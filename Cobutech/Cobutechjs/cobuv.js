document.addEventListener('DOMContentLoaded', function() {
    const codeBoxes = document.querySelectorAll('.code-box');
    const resendButton = document.getElementById('resend-code-button');
    const resendCountdownElement = document.getElementById('resend-countdown');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const waitMessageElement = document.getElementById('wait-message');
    const waitCountdownElement = document.getElementById('wait-countdown');
    const verifyButton = document.getElementById('verify-button');
    const codeBoxesContainer = document.getElementById('code-boxes-container'); // Ensure this element exists in your HTML

    let attempts = 3;
    let resendAvailableIn = 20;
    let resendInterval;
    let waitPeriod = 24 * 60 * 60; // 24 hours in seconds
    let waitInterval;
    let canRequestCode = true;
    let verificationBlocked = false; // Flag to track if verification is blocked

    // --- Retrieve email from localStorage ---
    const email = localStorage.getItem('verificationEmail');

    // --- DEBUGGING LOGS (for Verification Page) ---
    console.log('--- VERIFICATION PAGE LOAD (Frontend) ---');
    console.log('Email retrieved from localStorage:', email);
    // --- END DEBUGGING LOGS ---

    // --- Initial Email Check ---
    if (!email) {
        alert('Email not found. Please sign up again.');
        window.location.href = '/'; // Redirect to signup page (or your main landing page)
        return; // IMPORTANT: Stop execution if no email is found
    }

    // Set initial focus to the first code box
    if (codeBoxes.length > 0) {
        codeBoxes[0].focus();
    }

    // --- Helper functions for UI updates and countdowns ---
    function updateAttempts() {
        attemptsLeftElement.textContent = `Attempts left: ${attempts}`;
        if (attempts <= 0 && !verificationBlocked) { // Changed to <= 0
            verificationBlocked = true;
            canRequestCode = false;
            resendButton.disabled = true;
            document.getElementById('request-code-message').style.display = 'none';
            waitMessageElement.style.display = 'block';
            if (codeBoxesContainer) {
                codeBoxesContainer.style.display = 'none';
            }
            // Add blocked symbol
            const blockedSymbol = document.createElement('div');
            blockedSymbol.textContent = '⛔';
            blockedSymbol.style.fontSize = '5em';
            blockedSymbol.style.color = 'red';
            blockedSymbol.id = 'blocked-symbol'; // Give it an ID for easier removal
            if (codeBoxesContainer && codeBoxesContainer.parentNode) {
                 codeBoxesContainer.parentNode.insertBefore(blockedSymbol, codeBoxesContainer);
            }
            startWaitCountdown();
        }
    }

    function startResendCountdown() {
        resendButton.disabled = true;
        resendAvailableIn = 20; // Reset countdown time
        resendCountdownElement.textContent = resendAvailableIn;
        document.getElementById('request-code-message').style.display = 'block';
        if (resendInterval) { // Clear any existing interval
            clearInterval(resendInterval);
        }
        resendInterval = setInterval(() => {
            resendAvailableIn--;
            resendCountdownElement.textContent = resendAvailableIn;
            if (resendAvailableIn <= 0) {
                clearInterval(resendInterval);
                if (canRequestCode) { // Only enable if not blocked
                    resendButton.disabled = false;
                }
                resendCountdownElement.textContent = "Ready";
            }
        }, 1000);
    }

    function startWaitCountdown() {
        let remainingTime = waitPeriod;
        waitCountdownElement.textContent = formatTime(remainingTime);
        if (waitInterval) { // Clear any existing interval
            clearInterval(waitInterval);
        }
        waitInterval = setInterval(() => {
            remainingTime--;
            waitCountdownElement.textContent = formatTime(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(waitInterval);
                attempts = 3; // Reset attempts
                canRequestCode = true;
                verificationBlocked = false;
                updateAttempts(); // Update attempts display
                waitMessageElement.style.display = 'none';
                document.getElementById('request-code-message').style.display = 'block';
                if (codeBoxesContainer) {
                    codeBoxesContainer.style.display = 'flex'; // Show the input boxes again
                }
                const blockedSymbol = document.getElementById('blocked-symbol'); // Get by ID
                if (blockedSymbol) {
                    blockedSymbol.remove(); // Remove the blocked symbol
                }
                startResendCountdown(); // Start resend countdown for new attempts
            }
        }, 1000);
    }

    // Helper function to format time (HH:MM:SS)
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // --- Event listener for input in the code boxes ---
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', function() {
            const currentBox = this;
            const nextBox = codeBoxes[index + 1];

            if (currentBox.value.length === 1 && nextBox) {
                nextBox.focus(); // Move focus to the next box
            }

            // If all boxes are filled, enable the verify button
            const enteredCode = Array.from(codeBoxes)
                .map(box => box.value)
                .join('');

            verifyButton.disabled = enteredCode.length !== 6 || verificationBlocked;
        });

        // Prevent non-numeric input
        box.addEventListener('keypress', function(event) {
            const charCode = (event.which) ? event.which : event.keyCode;
            if (charCode < 48 || charCode > 57) { // Only allow digits 0-9
                event.preventDefault();
            }
        });

        // Allow backspace to move to the previous box
        box.addEventListener('keydown', function(event) {
            if (event.key === 'Backspace' && this.value.length === 0 && index > 0) {
                codeBoxes[index - 1].focus();
            }
        });
    });

    // --- Function to handle code verification API call ---
    function verifyCode(enteredCode) {
        // --- DEBUGGING LOGS (for Verification Request) ---
        console.log('Sending verification request with:');
        console.log('Email:', email);
        console.log('Verification Code:', enteredCode);
        // --- END DEBUGGING LOGS ---

        fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // FIX: Sending 'verificationCode' to match backend's expected key
            body: JSON.stringify({ email: email, verificationCode: enteredCode }),
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(error => {
                    throw new Error(error.message || 'Verification failed');
                });
            }
            return response.json();
        })
        .then(data => {
            alert(data.message || 'Email verified successfully!');
            localStorage.removeItem('verificationEmail'); // Clean up local storage
            window.location.href = '../../../Cobutech/Cobutechhtml/cobup.html'; // Redirect to dashboard or profile
        })
        .catch(error => {
            console.error('Error during verification fetch:', error); // Log full error
            alert(error.message); // Display the error message from the backend

            // Handle specific error messages (e.g., code expired vs. incorrect)
            if (error.message.includes('expired')) {
                resendButton.disabled = false;
                resendCountdownElement.textContent = "Ready";
                clearInterval(resendInterval);
            } else {
                // For incorrect code or other errors, decrease attempts and show visual feedback
                codeBoxes.forEach(box => box.classList.add('incorrect'));
                setTimeout(() => {
                    codeBoxes.forEach(box => box.classList.remove('incorrect'));
                    codeBoxes.forEach(box => box.value = ''); // Clear boxes
                    codeBoxes[0].focus(); // Focus first box
                }, 1000);
                attempts--; // Decrement attempts
                updateAttempts(); // Update attempts display and handle blocking if 0
            }
        });
    }

    // --- Event listener for resend code button ---
    resendButton.addEventListener('click', function() {
        if (canRequestCode && email) { // Ensure email exists before attempting resend
            console.log('Attempting to resend verification code for:', email);
            fetch('/api/auth/resend-verification-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email }),
            })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => {
                        throw new Error(error.message || 'Failed to resend code');
                    });
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || 'New verification code sent to your email.');
                startResendCountdown(); // Restart countdown
                codeBoxes.forEach(box => box.value = ''); // Optionally clear the input boxes
                codeBoxes[0].focus();
            })
            .catch(error => {
                console.error('Error during resend code fetch:', error); // Log full error
                alert(error.message);
            });
        } else if (!email) {
            alert('Email not found in session. Please go back to signup.');
            window.location.href = '/'; // Redirect to signup/main page
        }
    });

    // --- Event listener for the Verify button ---
    verifyButton.addEventListener('click', function() {
        const enteredCode = Array.from(codeBoxes)
            .map(box => box.value)
            .join('');

        // Ensure all 6 digits are entered, verification is not blocked, and email is available
        if (enteredCode.length === 6 && !verificationBlocked && email) {
            verifyCode(enteredCode);
        } else if (!verificationBlocked && !email) {
            alert('Email not found. Please go back to signup.');
            window.location.href = '/'; // Redirect to signup/main page
        } else if (!verificationBlocked) {
            alert('Please enter the complete 6-digit code.'); // More specific message for incomplete code
        }
    });

    // --- Initial setup calls when the page loads ---
    verifyButton.disabled = true; // Disable verify button initially
    updateAttempts(); // Update attempts display on load
    startResendCountdown(); // Start the initial resend countdown
});
