document.addEventListener('DOMContentLoaded', () => {
    const emailRequestSection = document.getElementById('email-request-section');
    const emailInput = document.getElementById('email');
    const sendCodeButton = document.getElementById('send-code-button');
    const emailMessage = document.getElementById('email-message');
    const codeVerificationSection = document.getElementById('code-verification-section');
    const codeBoxes = document.querySelectorAll('.code-box');
    const verifyCodeButton = document.getElementById('verify-code-button');
    const resendCodeButton = document.getElementById('resend-code-button');
    const codeMessage = document.getElementById('code-message');
    const attemptsLeftElement = document.getElementById('attempts-left');
    const resendCountdownElement = document.getElementById('resend-countdown');
    const setNewPasswordSection = document.getElementById('set-new-password-section');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const resetPasswordButton = document.getElementById('reset-password-button');
    const resetMessage = document.getElementById('reset-message');
    const pageDisabledOverlay = document.getElementById('page-disabled-overlay');
    const disabledCountdownElement = document.getElementById('disabled-countdown');
    let userEmail = ''; 
    let attempts = 3; 
    let resendCountdownValue = 30; 
    let resendIntervalId;
    let pageDisabledCountdownValue = 24 * 60 * 60; 
    let pageDisabledIntervalId;
    const showSection = (section) => {
        emailRequestSection.style.display = 'none';
        codeVerificationSection.style.display = 'none';
        setNewPasswordSection.style.display = 'none';
        pageDisabledOverlay.style.display = 'none'; 
        section.style.display = 'block';
    };
    const updateMessage = (element, message, isSuccess = false) => {
        element.textContent = message;
        element.style.color = isSuccess ? 'green' : 'red';
    };
    const startResendCountdown = () => {
        resendCodeButton.disabled = true;
        resendCountdownValue = 120; 
        resendCountdownElement.textContent = resendCountdownValue;
        clearInterval(resendIntervalId); 
        resendIntervalId = setInterval(() => {
            resendCountdownValue--;
            resendCountdownElement.textContent = resendCountdownValue;
            if (resendCountdownValue <= 0) {
                clearInterval(resendIntervalId);
                resendCodeButton.disabled = false; 
                resendCountdownElement.textContent = "Ready";
            }
        }, 1000);
    };
    const disablePageTemporarily = () => {
        showSection(pageDisabledOverlay);
        pageDisabledCountdownValue = 24 * 60 * 60; 
        disabledCountdownElement.textContent = formatTime(pageDisabledCountdownValue);
        clearInterval(pageDisabledIntervalId);
        pageDisabledIntervalId = setInterval(() => {
            pageDisabledCountdownValue--;
            disabledCountdownElement.textContent = formatTime(pageDisabledCountdownValue);
            if (pageDisabledCountdownValue <= 0) {
                clearInterval(pageDisabledIntervalId);
                window.location.reload();
            }
        }, 1000);
    };
    const formatTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    const clearCodeBoxes = () => {
        codeBoxes.forEach(box => {
            box.value = '';
            box.classList.remove('incorrect', 'correct');
        });
        if (codeBoxes.length > 0) codeBoxes[0].focus();
        verifyCodeButton.disabled = true; 
    };
    const updateAttemptsDisplay = () => {
        attemptsLeftElement.textContent = attempts;
        if (attempts <= 0) {
            disablePageTemporarily(); 
            updateMessage(codeMessage, 'Too many failed attempts. This page is disabled.');
        }
    };
        userEmail = emailInput.value.trim();
        if (!userEmail) {
            updateMessage(emailMessage, 'Please enter your email.');
            return;
        }
        sendCodeButton.disabled = true;
        updateMessage(emailMessage, 'Sending code...', false); 
        try {
            const response = await fetch('/api/auth/request-password-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            if (response.ok) {
                updateMessage(emailMessage, data.message, true);
                showSection(codeVerificationSection); 
                startResendCountdown();
                clearCodeBoxes(); 
            } else {
                updateMessage(emailMessage, data.message || 'Failed to send code.');
            }
        } catch (error) {
            console.error('Error requesting password reset code:', error);
            updateMessage(emailMessage, 'An unexpected error occurred. Please try again.');
        } finally {
            sendCodeButton.disabled = false;
        }
    });
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', () => {
            if (box.value.length === 1 && codeBoxes[index + 1]) {
                codeBoxes[index + 1].focus();
            }
            const allBoxesFilled = Array.from(codeBoxes).every(b => b.value.length === 1);
            verifyCodeButton.disabled = !allBoxesFilled;
        });
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && box.value.length === 0 && index > 0) {
                codeBoxes[index - 1].focus(); 
            }
        });
    });
    verifyCodeButton.addEventListener('click', async () => {
        const enteredCode = Array.from(codeBoxes).map(box => box.value).join('');
        if (enteredCode.length !== 6) {
            updateMessage(codeMessage, 'Please enter the complete 6-digit code.');
            return;
        }
        if (!userEmail) { 
            updateMessage(codeMessage, 'Email not found. Please restart the process.');
            return;
        }
        verifyCodeButton.disabled = true;
        updateMessage(codeMessage, 'Verifying code...', false);
        clearCodeBoxes();
        try {
            const response = await fetch('/api/auth/verify-password-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, code: enteredCode }),
            });
            const data = await response.json();
            if (response.ok) {
                updateMessage(codeMessage, data.message, true);
                codeBoxes.forEach(box => box.classList.add('correct')); 
                setTimeout(() => {
                    showSection(setNewPasswordSection); 
                    newPasswordInput.focus(); 
                }, 1000); 
            } else {
                attempts--;
                updateAttemptsDisplay();
                updateMessage(codeMessage, data.message || 'Verification failed.');
                codeBoxes.forEach(box => box.classList.add('incorrect')); // Red feedback
            }
        } catch (error) {
            console.error('Error verifying password reset code:', error);
            updateMessage(codeMessage, 'An unexpected error occurred during verification.');
        } finally {
            verifyCodeButton.disabled = false;
        }
    });
    resendCodeButton.addEventListener('click', async () => {
        if (!userEmail) {
            updateMessage(codeMessage, 'Email not found. Please restart the process.');
            return;
        }
        resendCodeButton.disabled = true;
        updateMessage(codeMessage, 'Resending code...', false);
        try {
            const response = await fetch('/api/auth/request-password-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();
            if (response.ok) {
                updateMessage(codeMessage, data.message, true);
                startResendCountdown(); 
                clearCodeBoxes(); 
            } else {
                updateMessage(codeMessage, data.message || 'Failed to resend code.');
            }
        } catch (error) {
            console.error('Error resending password reset code:', error);
            updateMessage(codeMessage, 'An unexpected error occurred. Please try again.');
        }
    });
    [newPasswordInput, confirmPasswordInput].forEach(input => {
        input.addEventListener('input', () => {
            const newPass = newPasswordInput.value;
            const confirmPass = confirmPasswordInput.value;
            const passwordMatch = newPass === confirmPass;
            const passwordLengthValid = newPass.length >= 8; 
            resetPasswordButton.disabled = !(passwordMatch && passwordLengthValid);
            if (!passwordLengthValid && newPass.length > 0) {
                updateMessage(resetMessage, 'Password must be at least 8 characters.', false);
            } else if (!passwordMatch && confirmPass.length > 0) {
                updateMessage(resetMessage, 'Passwords do not match.', false);
            } else {
                updateMessage(resetMessage, '', true); 
            }
        });
    });
    resetPasswordButton.addEventListener('click', async () => {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        if (newPassword.length < 8) { 
            updateMessage(resetMessage, 'Password must be at least 8 characters long.');
            return;
        }
        if (newPassword !== confirmPassword) {
            updateMessage(resetMessage, 'Passwords do not match.');
            return;
        }
        if (!userEmail) {
            updateMessage(resetMessage, 'Email not found. Please restart the process.');
            return;
        }
        resetPasswordButton.disabled = true;
        updateMessage(resetMessage, 'Resetting password...', false);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, newPassword: newPassword }),
            });
            const data = await response.json();
            if (response.ok) {
                updateMessage(resetMessage, data.message, true);
                alert(data.message + ' You will now be redirected to the login page.');
                setTimeout(() => {
                    window.location.href = '../../../Cobutech/Cobutechhtml/cobul.html'; 
                }, 2000);
            } else {
                updateMessage(resetMessage, data.message || 'Failed to reset password.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            updateMessage(resetMessage, 'An unexpected error occurred during password reset.');
        } finally {
            resetPasswordButton.disabled = false;
        }
     });
    showSection(emailRequestSection); 
    updateAttemptsDisplay(); 
});
