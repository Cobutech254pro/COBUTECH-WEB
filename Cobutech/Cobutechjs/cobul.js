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
                displayMessage('Please enter your email.', 'error');
                return;
            }
            if (!password) {
                displayMessage('Please enter your password.', 'error'); 
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                displayMessage('Please enter a valid email address.', 'error');
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
                    displayMessage(data.message || 'Login successful!', 'success'); 
                    if (data.token) {
                        localStorage.setItem('authToken', data.token); 
                        localStorage.setItem('user', JSON.stringify(data.user)); 
                    }
                    if (data.user && data.user.is_verified) {
                        setTimeout(() => {
                            window.location.href = '/dashboard'; 
                        }, 2000); 
                    } else {
                        displayMessage(data.message || 'Your email is not verified. Please verify your email.', 'error'); 
                        localStorage.setItem('verificationEmail', email); 
                        setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; 
                        }, 2000); 
                    }
                } else {
                    displayMessage(data.message || 'Login failed. Please try again.', 'error'); 
                    if (data.email && data.user && !data.user.is_verified) {
                         localStorage.setItem('verificationEmail', email); 
                         setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; 
                         }, 2000);
                    }
                }
            } catch (error) {
                console.error('Error during login fetch operation:', error);
                displayMessage(error.message || 'An unexpected error occurred. Please try again later.', 'error'); // Use new display function
            }
        });
    }
    emailInput.addEventListener('input', clearMessages);
    passwordInput.addEventListener('input', clearMessages);

});
