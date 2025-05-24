document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const statusMessageElement = document.getElementById('status-message'); 
    const togglePasswordButton = document.getElementById('toggle-password');
    function displayMessage(message, type) {
        statusMessageElement.textContent = message;
        statusMessageElement.style.display = 'block'; 
        statusMessageElement.className = 'status-message'; 
        if (type === 'success') {
            statusMessageElement.classList.add('success');
        } else if (type === 'error') {
            statusMessageElement.classList.add('error');
        }
        setTimeout(() => {
            statusMessageElement.style.display = 'none';
            statusMessageElement.textContent = '';
            statusMessageElement.className = 'status-message'; 
        }, 5000); 
    }
    function clearMessages() {
        statusMessageElement.style.display = 'none';
        statusMessageElement.textContent = '';
        statusMessageElement.className = 'status-message';
    }
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearMessages(); 
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            console.log('--- LOGIN ATTEMPT (Frontend) ---');
            console.log('Email value from input (raw):', emailInput.value);
            console.log('Password value from input (raw):', passwordInput.value);
            console.log('Trimmed Email:', email, ' (length:', email.length, ')');
            console.log('Trimmed Password (partial):', password.substring(0, 3) + '...', ' (length:', password.length, ')');
            if (!email) {
                displayMessage('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐲𝐨𝐮𝐫 𝐞𝐦𝐚𝐢𝐥.', 'error');
                return;
            }
            if (!password) {
                displayMessage('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐲𝐨𝐮𝐫 𝐩𝐚𝐬𝐬𝐰𝐨𝐫𝐝.', 'error'); 
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                displayMessage('𝐏𝐥𝐞𝐚𝐬𝐞 𝐞𝐧𝐭𝐞𝐫 𝐚 𝐯𝐚𝐥𝐢𝐝 𝐞𝐦𝐚𝐢𝐥 𝐚𝐝𝐝𝐫𝐞𝐬𝐬.', 'error');
                return;
            }
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });
                const data = await response.json();
                console.log('Response from /api/auth/login (Status):', response.status);
                console.log('Response data from /api/auth/login:', data);
                if (response.ok) { 
                    displayMessage(data.message || '𝐋𝐨𝐠𝐢𝐧 𝐬𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥!', 'success'); 
                    if (data.token) {
                        localStorage.setItem('authToken', data.token); 
                        localStorage.setItem('user', JSON.stringify(data.user)); 
                    }
                    if (data.user && data.user.is_verified) {
                        setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuac.html; 
                        }, 2000); 
                    } else {
                        displayMessage(data.message || '𝐕𝐞𝐫𝐢𝐟𝐲 𝐲𝐨𝐮𝐫 𝐚𝐜𝐜𝐨𝐮𝐧𝐭.', 'error'); 
                        localStorage.setItem('verificationEmail', email); 
                        setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; 
                        }, 2000); 
                    }
                } else {
                    displayMessage(data.message || '𝐋𝐨𝐠𝐢𝐧 𝐟𝐚𝐢𝐥𝐞𝐝.', 'error'); 
                    if (data.email && data.user && !data.user.is_verified) {
                         localStorage.setItem('verificationEmail', email); 
                         setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; 
                         }, 2000);
                    }
                }
            } catch (error) {
                console.error('Error during login fetch operation:', error);
                displayMessage(error.message || '𝐀𝐧 𝐮𝐧𝐞𝐱𝐩𝐞𝐜𝐭𝐞𝐝 𝐞𝐫𝐫𝐨𝐫 𝐨𝐜𝐜𝐮𝐫𝐫𝐞𝐝.', 'error'); 
            }
        });
    }
    emailInput.addEventListener('input', clearMessages);
    passwordInput.addEventListener('input', clearMessages);
});
