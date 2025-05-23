document.addEventListener('DOMContentLoaded', function() {
    const codeBoxes = document.querySelectorAll('.code-box');
    const resendButton = document.getElementById('resend-code-button');
    const resendCountdownElement = document.getElementById('resend-countdown');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const waitMessageElement = document.getElementById('wait-message');
    const waitCountdownElement = document.getElementById('wait-countdown');
    const verifyButton = document.getElementById('verify-button');
    const codeBoxesContainer = document.getElementById('code-boxes-container');
    const statusMessageElement = document.getElementById('status-message'); // NEW: Get the message display element

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
        displayMessage('Email not found. Please sign up again.', 'error'); // Use new display function
        // alert('Email not found. Please sign up again.'); // Old alert removed
        // No redirect for now, let user see message, then they can navigate
        // window.location.href = '/'; // Redirect to signup page (or your main landing page)
        // return; // IMPORTANT: Stop execution if no email is found, but allow message to show
    }

    // Set initial focus to the first code box
    if (codeBoxes.length > 0) {
        codeBoxes[0].focus();
    }

    // NEW: Function to display messages on the page
    function displayMessage(message, type) {
        statusMessageElement.textContent = message;
        statusMessageElement.style.display = 'block'; // Make it visible
        statusMessageElement.className = 'status-message'; // Reset classes
        if (type === 'success') {
            statusMessageElement.classList.add('success');
        } else if (type === 'error') {
            statusMessageElement.classList.add('error');
        }
        // Optionally, hide the message after a few seconds
        setTimeout(() => {
            statusMessageElement.style.display = 'none';
            statusMessageElement.textContent = '';
            statusMessageElement.className = 'status-message'; // Clear classes
        }, 5000); // Message disappears after 5 seconds
    }

    // NEW: Function to clear messages
    function clearMessages() {
        statusMessageElement.style.display = 'none';
        statusMessageElement.textContent = '';
        statusMessageElement.className = 'status-message';
    }


    // --- Helper functions for UI updates and countdowns ---
    function updateAttempts() {
        attemptsLeftElement.textContent = `Attempts left: ${attempts}`;
        if (attempts <= 0 && !verificationBlocked) {
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
            blockedSymbol.id = 'blocked-symbol';
            if (codeBoxesContainer && codeBoxesContainer.parentNode) {
                 codeBoxesContainer.parentNode.insertBefore(blockedSymbol, codeBoxesContainer);
            }
            startWaitCountdown();
        }
    }

    function startResendCountdown() {
        resendButton.disabled = true;
        resendAvailableIn = 20;
        resendCountdownElement.textContent = resendAvailableIn;
        document.getElementById('request-code-message').style.display = 'block';
        if (resendInterval) {
            clearInterval(resendInterval);
        }
        resendInterval = setInterval(() => {
            resendAvailableIn--;
            resendCountdownElement.textContent = resendAvailableIn;
            if (resendAvailableIn <= 0) {
                clearInterval(resendInterval);
                if (canRequestCode) {
                    resendButton.disabled = false;
                }
                resendCountdownElement.textContent = "Ready";
            }
        }, 1000);
    }

    function startWaitCountdown() {
        let remainingTime = waitPeriod;
        waitCountdownElement.textContent = formatTime(remainingTime);
        if (waitInterval) {
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
                updateAttempts();
                waitMessageElement.style.display = 'none';
                document.getElementById('request-code-message').style.display = 'block';
                if (codeBoxesContainer) {
                    codeBoxesContainer.style.display = 'flex';
                }
                const blockedSymbol = document.getElementById('blocked-symbol');
                if (blockedSymbol) {
                    blockedSymbol.remove();
                }
                startResendCountdown();
            }
        }, 1000);
    }

    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    // --- Event listener for input in the code boxes ---
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', function() {
            clearMessages(); // Clear messages when user starts typing
            const currentBox = this;
            const nextBox = codeBoxes[index + 1];

            if (currentBox.value.length === 1 && nextBox) {
                nextBox.focus();
            }

            const enteredCode = Array.from(codeBoxes)
                .map(box => box.value)
                .join('');

            verifyButton.disabled = enteredCode.length !== 6 || verificationBlocked;
        });

        box.addEventListener('keypress', function(event) {
            const charCode = (event.which) ? event.which : event.keyCode;
            if (charCode < 48 || charCode > 57) {
                event.preventDefault();
            }
        });

        box.addEventListener('keydown', function(event) {
            if (event.key === 'Backspace' && this.value.length === 0 && index > 0) {
                codeBoxes[index - 1].focus();
            }
        });
    });

    // --- Function to handle code verification API call ---
    function verifyCode(enteredCode) {
        clearMessages(); // Clear messages before making a new request

        console.log('Sending verification request with:');
        console.log('Email:', email);
        console.log('Verification Code:', enteredCode);

        fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
            displayMessage(data.message || 'Email verified successfully!', 'success'); // Use new display function
            // alert(data.message || 'Email verified successfully!'); // Old alert removed
            localStorage.removeItem('verificationEmail');
            // Redirect after a short delay so user can read the success message
            setTimeout(() => {
                window.location.href = '../../../Cobutech/Cobutechhtml/cobup.html'; // Redirect
            }, 2000); // Redirect after 2 seconds
        })
        .catch(error => {
            console.error('Error during verification fetch:', error);
            displayMessage(error.message, 'error'); // Use new display function
            // alert(error.message); // Old alert removed

            if (error.message.includes('expired')) {
                resendButton.disabled = false;
                resendCountdownElement.textContent = "Ready";
                clearInterval(resendInterval);
            } else {
                codeBoxes.forEach(box => box.classList.add('incorrect'));
                setTimeout(() => {
                    codeBoxes.forEach(box => box.classList.remove('incorrect'));
                    codeBoxes.forEach(box => box.value = '');
                    codeBoxes[0].focus();
                }, 1000);
                attempts--;
                updateAttempts();
            }
        });
    }

    // --- Event listener for resend code button ---
    resendButton.addEventListener('click', function() {
        clearMessages(); // Clear messages before resending
        if (canRequestCode && email) {
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
                displayMessage(data.message || 'New verification code sent to your email.', 'success'); // Use new display function
                // alert(data.message || 'New verification code sent to your email.'); // Old alert removed
                startResendCountdown();
                codeBoxes.forEach(box => box.value = '');
                codeBoxes[0].focus();
            })
            .catch(error => {
                console.error('Error during resend code fetch:', error);
                displayMessage(error.message, 'error'); // Use new display function
                // alert(error.message); // Old alert removed
            });
        } else if (!email) {
            displayMessage('Email not found in session. Please go back to signup.', 'error'); // Use new display function
            // alert('Email not found in session. Please go back to signup.'); // Old alert removed
            // No redirect for now, let user see message
            // window.location.href = '/';
        }
    });

    // --- Event listener for the Verify button ---
    verifyButton.addEventListener('click', function() {
        const enteredCode = Array.from(codeBoxes)
            .map(box => box.value)
            .join('');

        if (enteredCode.length === 6 && !verificationBlocked && email) {
            verifyCode(enteredCode);
        } else if (!verificationBlocked && !email) {
            displayMessage('Email not found. Please go back to signup.', 'error');
            // No redirect for now
        } else if (!verificationBlocked) {
            displayMessage('Please enter the complete 6-digit code.', 'error'); // Use new display function
            // alert('Please enter the complete 6-digit code.'); // Old alert removed
        }
    });

    // --- Initial setup calls when the page loads ---
    verifyButton.disabled = true;
    updateAttempts();
    startResendCountdown();
});
