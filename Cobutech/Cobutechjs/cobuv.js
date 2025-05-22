document.addEventListener('DOMContentLoaded', function() {
    const codeBoxes = document.querySelectorAll('.code-box');
    const resendButton = document.getElementById('resend-code-button');
    const resendCountdownElement = document.getElementById('resend-countdown');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const waitMessageElement = document.getElementById('wait-message');
    const waitCountdownElement = document.getElementById('wait-countdown');
    const verifyButton = document.getElementById('verify-button'); // Get the Verify button

    let attempts = 3;
    let resendAvailableIn = 20;
    let resendInterval;
    let waitPeriod = 24 * 60 * 60; // 24 hours in seconds
    let waitInterval;
    let canRequestCode = true;
    let verificationBlocked = false; // Flag to track if verification is blocked
    const email = localStorage.getItem('verificationEmail'); // Get email from localStorage

    if (!email) {
        alert('Email not found. Please sign up again.');
        window.location.href = '/'; // Redirect to signup page
    }
    codeBoxes[0].focus();
    function updateAttempts() {
        attemptsLeftElement.textContent = `Attempts left: ${attempts}`;
        if (attempts === 0 && !verificationBlocked) {
            verificationBlocked = true;
            canRequestCode = false;
            resendButton.disabled = true;
            document.getElementById('request-code-message').style.display = 'none';
            waitMessageElement.style.display = 'block';
            codeBoxesContainer.style.display = 'none'; 
            const blockedSymbol = document.createElement('div');
            blockedSymbol.textContent = '⛔';
            blockedSymbol.style.fontSize = '5em';
            blockedSymbol.color = 'red';
            codeBoxesContainer.parentNode.insertBefore(blockedSymbol, codeBoxesContainer);
            startWaitCountdown();
        }
    }
    function startResendCountdown() {
        resendButton.disabled = true;
        resendAvailableIn = 20;
        resendCountdownElement.textContent = resendAvailableIn;
        document.getElementById('request-code-message').style.display = 'block';
        resendInterval = setInterval(() => {
            resendAvailableIn--;
            resendCountdownElement.textContent = resendAvailableIn;
            if (resendAvailableIn === 0 && canRequestCode) {
                clearInterval(resendInterval);
                resendButton.disabled = false;
                resendCountdownElement.textContent = "Ready";
            }
        }, 1000);
    }
    function startWaitCountdown() {
        let remainingTime = waitPeriod;
        waitCountdownElement.textContent = formatTime(remainingTime);
        waitInterval = setInterval(() => {
            remainingTime--;
            waitCountdownElement.textContent = formatTime(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(waitInterval);
                attempts = 3;
                canRequestCode = true;
                verificationBlocked = false;
                updateAttempts();
                waitMessageElement.style.display = 'none';
                document.getElementById('request-code-message').style.display = 'block';
                codeBoxesContainer.style.display = 'flex'; // Show the input boxes again
                const blockedSymbol = codeBoxesContainer.parentNode.querySelector('div');
                if (blockedSymbol && blockedSymbol.textContent === '⛔') {
                    blockedSymbol.remove(); // Remove the blocked symbol
                }
                startResendCountdown();
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

    // Event listener for input in the code boxes
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', function() {
            const currentBox = this;
            const nextBox = codeBoxes[index + 1];

            if (currentBox.value.length === 1 && nextBox) {
                nextBox.focus();
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
            if (charCode < 48 || charCode > 57) {
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

    // Function to handle code verification API call
    function verifyCode(enteredCode) {
        fetch('/api/auth/verify-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, code: enteredCode }),
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
            window.location.href = '../../../Cobutech/Cobutechtml/cobup.html'; // Redirect to dashboard
        })
        .catch(error => {
            alert(error.message);
            if (error.message.includes('expired')) {
                // Enable resend button immediately if the code expired
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

    // Event listener for resend code button
    resendButton.addEventListener('click', function() {
        if (canRequestCode) {
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
                startResendCountdown();
                // Optionally clear the input boxes
                codeBoxes.forEach(box => box.value = '');
                codeBoxes[0].focus();
            })
            .catch(error => {
                alert(error.message);
            });

            // Disable the button and start the countdown
            resendButton.disabled = true;
            resendAvailableIn = 20;
            resendCountdownElement.textContent = resendAvailableIn;
            document.getElementById('request-code-message').style.display = 'block';
            clearInterval(resendInterval); // Clear any existing interval
            resendInterval = setInterval(() => {
                resendAvailableIn--;
                resendCountdownElement.textContent = resendAvailableIn;
                if (resendAvailableIn <= 0) {
                    clearInterval(resendInterval);
                    resendButton.disabled = false;
                    resendCountdownElement.textContent = "Ready";
                }
            }, 1000);
        }
    });

    // Event listener for the Verify button
    verifyButton.addEventListener('click', function() {
        const enteredCode = Array.from(codeBoxes)
            .map(box => box.value)
            .join('');

        if (enteredCode.length === 6 && !verificationBlocked) {
            verifyCode(enteredCode);
        } else if (!verificationBlocked) {
            alert('Please enter the 6-digit code.');
        }
    });

    // Disable verify button initially
    verifyButton.disabled = true;

    // Start the initial resend countdown
    startResendCountdown();
});
                    


