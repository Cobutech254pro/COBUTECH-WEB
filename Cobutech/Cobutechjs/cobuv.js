document.addEventListener('DOMContentLoaded', function() {
    console.log('cobuv.js script loaded and DOMContentLoaded event fired.'); // Debugging: Confirm script loads

    const codeBoxes = document.querySelectorAll('.code-box');
    const resendButton = document.getElementById('resend-code-button');
    const resendCountdownElement = document.getElementById('resend-countdown');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const waitMessageElement = document.getElementById('wait-message');
    const waitCountdownElement = document.getElementById('wait-countdown');
    const verifyButton = document.getElementById('verify-button');
    // Ensure this element exists in your HTML, or it will be null and cause errors later
    const codeBoxesContainer = document.querySelector('.code-boxes-container');

    let attempts = 3;
    let resendAvailableIn = 20;
    let resendInterval = null; // Initialize to null
    let waitPeriod = 24 * 60 * 60; // 24 hours in seconds
    let waitInterval = null; // Initialize to null
    let canRequestCode = true;
    let verificationBlocked = false;
    const email = localStorage.getItem('verificationEmail');

    if (!email) {
        alert('Email not found. Please sign up again.');
        window.location.href = '/';
        return; // Important: Stop execution if email is not found
    }

    // Focus on the first input box on load
    if (codeBoxes.length > 0) {
        codeBoxes[0].focus();
    }

    // Function to update attempt count display and handle blocking
    function updateAttempts() {
        if (attemptsLeftElement) { // Ensure element exists before updating
            attemptsLeftElement.textContent = `Attempts left: ${attempts}`;
        }

        if (attempts === 0 && !verificationBlocked) {
            verificationBlocked = true;
            canRequestCode = false;
            if (resendButton) resendButton.disabled = true;
            if (document.getElementById('request-code-message')) {
                document.getElementById('request-code-message').style.display = 'none';
            }
            if (waitMessageElement) waitMessageElement.style.display = 'block';
            if (codeBoxesContainer) codeBoxesContainer.style.display = 'none';

            const blockedSymbol = document.createElement('div');
            blockedSymbol.textContent = '⛔';
            blockedSymbol.style.fontSize = '5em';
            blockedSymbol.style.color = 'red';
            if (codeBoxesContainer && codeBoxesContainer.parentNode) {
                codeBoxesContainer.parentNode.insertBefore(blockedSymbol, codeBoxesContainer);
            }
            startWaitCountdown();
        }
    }

    // Function to start the resend countdown
    function startResendCountdown() {
        console.log('startResendCountdown called.'); 
        if (resendButton) resendButton.disabled = true;
        resendAvailableIn = 20;
        if (resendCountdownElement) resendCountdownElement.textContent = resendAvailableIn;
        if (document.getElementById('request-code-message')) {
            document.getElementById('request-code-message').style.display = 'block';
        }
        if (resendInterval) {
            clearInterval(resendInterval);
        }

        resendInterval = setInterval(() => {
            resendAvailableIn--;
            if (resendCountdownElement) resendCountdownElement.textContent = resendAvailableIn;
            if (resendAvailableIn <= 0 && canRequestCode) { 
                clearInterval(resendInterval);
                if (resendButton) resendButton.disabled = false;
                if (resendCountdownElement) resendCountdownElement.textContent = "Ready";
                resendInterval = null; /
                console.log('Resend countdown finished.'); 
            }
        }, 1000);
    }
    function startWaitCountdown() {
        console.log('startWaitCountdown called.'); 
        let remainingTime = waitPeriod;
        if (waitCountdownElement) waitCountdownElement.textContent = formatTime(remainingTime);

        if (waitInterval) { 
            clearInterval(waitInterval);
        }

        waitInterval = setInterval(() => {
            remainingTime--;
            if (waitCountdownElement) waitCountdownElement.textContent = formatTime(remainingTime);
            if (remainingTime <= 0) {
                clearInterval(waitInterval);
                attempts = 3; 
                canRequestCode = true;
                verificationBlocked = false;
                updateAttempts(); 
                if (waitMessageElement) waitMessageElement.style.display = 'none';
                if (document.getElementById('request-code-message')) {
                    document.getElementById('request-code-message').style.display = 'block';
                }
                if (codeBoxesContainer) codeBoxesContainer.style.display = 'flex';
                const blockedSymbol = codeBoxesContainer.parentNode.querySelector('div');
                if (blockedSymbol && blockedSymbol.textContent === '⛔') {
                    blockedSymbol.remove();
                }
                startResendCountdown();
                waitInterval = null; 
                console.log('Wait countdown finished, verification re-enabled.'); // Debugging
            }
        }, 1000);
    }
    function formatTime(totalSeconds) {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', function() {
            const currentBox = this;
            const nextBox = codeBoxes[index + 1];

            if (currentBox.value.length === 1 && nextBox) {
                nextBox.focus();
            }
            const enteredCode = Array.from(codeBoxes)
                .map(box => box.value)
                .join('');
            if (verifyButton) {
                verifyButton.disabled = enteredCode.length !== 6 || verificationBlocked;
            }
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
    function verifyCode(enteredCode) {
        console.log('Verifying code:', enteredCode, 'for email:', email); 
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
            localStorage.removeItem('verificationEmail')
            window.location.href = '../../../Cobutech/Cobutechhtml/cobup.html';
        })
        .catch(error => {
            console.error('Error during verification fetch:', error); 
            alert(error.message);
            if (error.message.includes('expired')) {
                console.log('Code expired, re-enabling resend button.'); 
                if (resendButton) resendButton.disabled = false;
                if (resendCountdownElement) resendCountdownElement.textContent = "Ready";
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
                console.log('Incorrect code attempt. Attempts left:', attempts); // Debugging
            }
        });
    }
    if (resendButton) { 
        resendButton.addEventListener('click', function() {
            console.log('Resend button clicked. canRequestCode:', canRequestCode); // Debugging
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
                    codeBoxes.forEach(box => box.value = ''); 
                    if (codeBoxes.length > 0) {
                        codeBoxes[0].focus();
                    }
                    console.log('Resend request successful, starting countdown.'); 
                })
                .catch(error => {
                    console.error('Error during resend fetch:', error); 
                    alert(error.message);
                    if (resendButton) resendButton.disabled = false;
                    if (resendCountdownElement) resendCountdownElement.textContent = "Try again";
                    clearInterval(resendInterval);
                });
            } else {
                console.log('Cannot request code, cooldown in progress or blocked.');
            }
        });
    }
    if (verifyButton) { 
        verifyButton.addEventListener('click', function() {
            console.log('Verify button clicked.'); // Debugging
            const enteredCode = Array.from(codeBoxes)
                .map(box => box.value)
                .join('');

            if (enteredCode.length === 6 && !verificationBlocked) {
                verifyCode(enteredCode);
            } else if (!verificationBlocked) {
                alert('Please enter the 6-digit code.');
            } else {
                alert('Verification is currently blocked. Please wait.');
            }
        });
    }
    if (verifyButton) verifyButton.disabled = true; /
    startResendCountdown(); 
    updateAttempts();
});
