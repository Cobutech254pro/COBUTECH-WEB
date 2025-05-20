document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');
    const togglePasswordButton = document.getElementById('toggle-password'); 
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
            const email = emailInput.value.trim(); 
            const password = passwordInput.value.trim();
            loginMessage.textContent = '';
            loginMessage.style.color = 'red'; 
            if (!email) {
                loginMessage.textContent = 'Please enter your email.';
                return;
            }
            if (!password) {
                loginMessage.textContent = 'Please enter your password.';
                return;
            }
            try {
                const response = await fetch('/api/auth/signin', { 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    loginMessage.textContent = data.message;
                    loginMessage.style.color = 'green';
                    if (data.token) {
                        localStorage.setItem('authToken', data.token);
                        localStorage.setItem('user', JSON.stringify(data.user)); 
                    }
                    if (data.user && data.user.is_verified) {
                        window.location.href = '/account/userhtml'; 
                    } else {
                        alert('Your email is not verified. Please verify your email.');
                        localStorage.setItem('verificationEmail', email);
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; 
                    }
                } else {                
                    loginMessage.textContent = data.message || 'Login failed. Please try again.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                loginMessage.textContent = 'An error occurred. Please try again later.';
            }
        });
    }
});
