document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('login-message');
    const togglePasswordButton = document.getElementById('toggle-password');

    // --- Password Toggle Functionality ---
    if (togglePasswordButton) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // --- Login Form Submission Handler ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // --- DEBUGGING LOGS (for Login Page) ---
            console.log('--- LOGIN ATTEMPT (Frontend) ---');
            console.log('Email value from input (raw):', emailInput.value);
            console.log('Password value from input (raw):', passwordInput.value);
            console.log('Trimmed Email:', email, ' (length:', email.length, ')');
            console.log('Trimmed Password (partial):', password.substring(0, 3) + '...', ' (length:', password.length, ')');
            // --- END DEBUGGING LOGS ---

            loginMessage.textContent = ''; // Clear previous messages
            loginMessage.style.color = 'red'; // Default to red for errors

            // --- Client-side validation ---
            if (!email) {
                loginMessage.textContent = 'Please enter your email.';
                return;
            }
            if (!password) {
                loginMessage.textContent = 'Please enter your password.';
                return;
            }

            try {
                // --- Fetch API call to backend signin endpoint ---
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json(); // Always parse JSON for both success and error messages

                // --- DEBUGGING LOGS (for Login Response) ---
                console.log('Response from /api/auth/signin (Status):', response.status);
                console.log('Response data from /api/auth/signin:', data);
                // --- END DEBUGGING LOGS ---

                if (response.ok) { // Check if HTTP status is 2xx
                    loginMessage.textContent = data.message || 'Login successful!';
                    loginMessage.style.color = 'green';

                    if (data.token) {
                        localStorage.setItem('authToken', data.token); // Store JWT
                        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
                    }

                    // --- Handle redirection based on verification status ---
                    if (data.user && data.user.is_verified) {
                        window.location.href = '/account/userhtml'; // Redirect to user dashboard
                    } else {
                        // Account not verified, redirect to verification page
                        alert(data.message || 'Your email is not verified. Please verify your email.');
                        localStorage.setItem('verificationEmail', email); // Store email for verification page
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }
                } else {
                    // Handle server-side errors (e.g., 401, 403, 500)
                    loginMessage.textContent = data.message || 'Login failed. Please try again.';
                    // Specific handling for unverified users, if not already caught by backend's 403 response
                    if (data.email && !data.user.is_verified) { // Assuming backend sends user object
                         localStorage.setItem('verificationEmail', email); // Store email for verification page
                         window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }
                }
            } catch (error) {
                console.error('Error during login fetch operation:', error);
                loginMessage.textContent = 'An unexpected error occurred. Please try again later.';
            }
        });
    }
});
