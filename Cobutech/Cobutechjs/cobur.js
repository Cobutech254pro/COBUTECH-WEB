// File: Cobutech/Cobutechjs/cobufp.js (Frontend Forgot Password/Reset JavaScript)

document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
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
    let attempts = 3; // Max attempts for code verification
    let resendCountdownValue = 120; // 2 minutes for resend
    let resendIntervalId;
    let pageDisabledCountdownValue = 24 * 60 * 60; // 24 hours in seconds for page disable
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
        resendCountdownValue = 120; // Reset to 2 minutes
        resendCountdownElement.textContent = resendCountdownValue;
        clearInterval(resendIntervalId); // Clear any existing interval
        resendIntervalId = setInterval(() => {
            resendCountdownValue--;
            resendCountdownElement.textContent = resendCountdownValue;
            if (resendCountdownValue <= 0) {
                clearInterval(resendIntervalId);
                resendCodeButton.disabled = false; // Enable resend
                resendCountdownElement.textContent = "Ready";
            }
        }, 1000);
    };

    const disablePageTemporarily = () => {
        showSection(pageDisabledOverlay);
        pageDisabledCountdownValue = 24 * 60 * 60; // 24 hours
        disabledCountdownElement.textContent = formatTime(pageDisabledCountdownValue);
        clearInterval(pageDisabledIntervalId);
        pageDisabledIntervalId = setInterval(() => {
            pageDisabledCountdownValue--;
            disabledCountdownElement.textContent = formatTime(pageDisabledCountdownValue);
            if (pageDisabledCountdownValue <= 0) {
                clearInterval(pageDisabledIntervalId);
                // Reload or redirect to clear state and allow new attempt
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
        verifyCodeButton.disabled = true; // Disable verify button
    };

    const updateAttemptsDisplay = () => {
        attemptsLeftElement.textContent = attempts;
        if (attempts <= 0) {
            disablePageTemporarily(); // Disable page if attempts run out
            updateMessage(codeMessage, 'Too many failed attempts. This page is disabled.');
        }
    };

    // --- Event Listeners ---

    // 1. Send Code Button Click
    sendCodeButton.addEventListener('click', async () => {
        userEmail = emailInput.value.trim();
        if (!userEmail) {
            updateMessage(emailMessage, 'Please enter your email.');
            return;
        }

        sendCodeButton.disabled = true;
        updateMessage(emailMessage, 'Sending code...', false); // Indicate loading

        try {
            const response = await fetch('/api/auth/request-password-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail }),
            });
            const data = await response.json();

            if (response.ok) {
                updateMessage(emailMessage, data.message, true);
                showSection(codeVerificationSection); // Show code input
                startResendCountdown(); // Start resend timer
                clearCodeBoxes(); // Clear and focus code boxes
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

    // 2. Code Box Input Handling
    codeBoxes.forEach((box, index) => {
        box.addEventListener('input', () => {
            if (box.value.length === 1 && codeBoxes[index + 1]) {
                codeBoxes[index + 1].focus(); // Move focus to next box
            }
            // Enable/disable verify button based on all boxes being filled
            const allBoxesFilled = Array.from(codeBoxes).every(b => b.value.length === 1);
            verifyCodeButton.disabled = !allBoxesFilled;
        });

        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && box.value.length === 0 && index > 0) {
                codeBoxes[index - 1].focus(); // Move focus to previous box on backspace
            }
        });
    });

    // 3. Verify Code Button Click
    verifyCodeButton.addEventListener('click', async () => {
        const enteredCode = Array.from(codeBoxes).map(box => box.value).join('');
        if (enteredCode.length !== 6) {
            updateMessage(codeMessage, 'Please enter the complete 6-digit code.');
            return;
        }
        if (!userEmail) { // Should not happen if flow is followed, but good check
            updateMessage(codeMessage, 'Email not found. Please restart the process.');
            return;
        }

        verifyCodeButton.disabled = true;
        updateMessage(codeMessage, 'Verifying code...', false);
        clearCodeBoxes(); // Clear boxes immediately after submission

        try {
            const response = await fetch('/api/auth/verify-password-reset-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, code: enteredCode }),
            });
            const data = await response.json();

            if (response.ok) {
                updateMessage(codeMessage, data.message, true);
                codeBoxes.forEach(box => box.classList.add('correct')); // Green feedback
                setTimeout(() => {
                    showSection(setNewPasswordSection); // Show set new password section
                    newPasswordInput.focus(); // Focus on new password input
                }, 1000); // Small delay for visual feedback
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

    // 4. Resend Code Button Click
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
                startResendCountdown(); // Restart timer
                clearCodeBoxes(); // Clear code input boxes
            } else {
                updateMessage(codeMessage, data.message || 'Failed to resend code.');
            }
        } catch (error) {
            console.error('Error resending password reset code:', error);
            updateMessage(codeMessage, 'An unexpected error occurred. Please try again.');
        }
    });

    // 5. New Password Input Validation (Frontend)
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
                updateMessage(resetMessage, '', true); // Clear message
            }
        });
    });


    // 6. Reset Password Button Click
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
