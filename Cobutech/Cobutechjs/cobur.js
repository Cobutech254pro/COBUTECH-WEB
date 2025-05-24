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
            updateMessage(codeMessage, '𝐓𝐨𝐨 𝐦𝐚𝐧𝐲 𝐟𝐚𝐢𝐥𝐞𝐝 𝐚𝐭𝐭𝐞𝐦𝐩𝐭𝐬. 𝐓𝐡𝐢𝐬 𝐩𝐚𝐠𝐞 𝐢𝐬 𝐝𝐢𝐬𝐚𝐛𝐥𝐞𝐝.');
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
            updateMessage(emailMessage, '𝐀𝐧 𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝. 𝐏𝐥𝐞𝐚𝐬𝐞 𝐭𝐫𝐲 𝐚𝐠𝐚𝐢𝐧.');
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
            updateMessage(codeMessage, '𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐭𝐡𝐞 𝐜𝐨𝐦𝐩𝐥𝐞𝐭𝐞 6-𝐝𝐢𝐠𝐢𝐭 𝐜𝐨𝐝𝐞.');
            return;
        }
        if (!userEmail) { 
            updateMessage(codeMessage, '𝐍𝐨𝐭 𝐟𝐨𝐮𝐧𝐝 🚫.');
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
                codeBoxes.forEach(box => box.classList.add('incorrect')); 
            }
        } catch (error) {
            console.error('Error verifying password reset code:', error);
            updateMessage(codeMessage, '𝐅𝐚𝐢𝐥𝐞𝐝.');
        } finally {
            verifyCodeButton.disabled = false;
        }
    });
    resendCodeButton.addEventListener('click', async () => {
        if (!userEmail) {
            updateMessage(codeMessage, '𝐍𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.');
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
                updateMessage(codeMessage, data.message || '𝐅𝐚𝐢𝐥𝐞𝐝 𝐭𝐨 𝐫𝐞𝐬𝐞𝐧𝐝 𝐜𝐨𝐝𝐞.');
            }
        } catch (error) {
            console.error('Error resending password reset code:', error);
            updateMessage(codeMessage, '𝐄𝐫𝐨𝐫 ,🚫.');
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
                updateMessage(resetMessage, '𝐏𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐚𝐭 𝐥𝐞𝐚𝐬𝐭 8 𝐜𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫𝐬.', false);
            } else if (!passwordMatch && confirmPass.length > 0) {
                updateMessage(resetMessage, '𝐏𝐚𝐬𝐬𝐰𝐨𝐫𝐝𝐬 𝐝𝐨 𝐧𝐨𝐭 𝐦𝐚𝐭𝐜𝐡.', false);
            } else {
                updateMessage(resetMessage, '', true); 
            }
        });
    });
    resetPasswordButton.addEventListener('click', async () => {
        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        if (newPassword.length < 8) { 
            updateMessage(resetMessage, '𝐏𝐚𝐬𝐬𝐰𝐨𝐫𝐝 𝐦𝐮𝐬𝐭 𝐛𝐞 𝐚𝐭 𝐥𝐞𝐚𝐬𝐭 8 𝐜𝐡𝐚𝐫𝐚𝐜𝐭𝐞𝐫𝐬 𝐥𝐨𝐧𝐠.');
            return;
        }
        if (newPassword !== confirmPassword) {
            updateMessage(resetMessage, '𝐏𝐚𝐬𝐬𝐰𝐨𝐫𝐝𝐬 𝐝𝐨 𝐧𝐨𝐭 𝐦𝐚𝐭𝐜𝐡.');
            return;
        }
        if (!userEmail) {
            updateMessage(resetMessage, '𝐄𝐦𝐚𝐢𝐥 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝.');
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
                alert(data.message + '𝐏𝐥𝐞𝐚𝐬𝐞𝐬 𝐥𝐨𝐧𝐠 𝐢𝐧.');
                setTimeout(() => {
                    window.location.href = '../../../Cobutech/Cobutechhtml/cobul.html'; 
                }, 2000);
            } else {
                updateMessage(resetMessage, data.message || '𝐅𝐚𝐢𝐥𝐞𝐝 🚫.');
            }
        } catch (error) {
            console.error('Error resetting password:', error);
            updateMessage(resetMessage, '𝐄𝐫𝐫𝐨𝐫 🚫.');
        } finally {
            resetPasswordButton.disabled = false;
        }
     });
    showSection(emailRequestSection); 
    updateAttemptsDisplay(); 
});
