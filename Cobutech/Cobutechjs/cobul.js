document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    // Removed old loginMessage element as it's replaced
    // const loginMessage = document.getElementById('login-message');
    const statusMessageElement = document.getElementById('status-message'); // NEW: Get the message display element
    const togglePasswordButton = document.getElementById('toggle-password');

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
            clearMessages(); // Clear any previous messages on submission

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            // --- DEBUGGING LOGS (for Login Page) ---
            console.log('--- LOGIN ATTEMPT (Frontend) ---');
            console.log('Email value from input (raw):', emailInput.value);
            console.log('Password value from input (raw):', passwordInput.value);
            console.log('Trimmed Email:', email, ' (length:', email.length, ')');
            console.log('Trimmed Password (partial):', password.substring(0, 3) + '...', ' (length:', password.length, ')');
            // --- END DEBUGGING LOGS ---

            // --- Client-side validation ---
            if (!email) {
                displayMessage('Please enter your email.', 'error'); // Use new display function
                return;
            }
            if (!password) {
                displayMessage('Please enter your password.', 'error'); // Use new display function
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                displayMessage('Please enter a valid email address.', 'error');
                return;
            }


            try {
                // --- Fetch API call to backend login endpoint ---
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password }),
                });

                const data = await response.json();

                // --- DEBUGGING LOGS (for Login Response) ---
                console.log('Response from /api/auth/login (Status):', response.status);
                console.log('Response data from /api/auth/login:', data);
                // --- END DEBUGGING LOGS ---

                if (response.ok) { // Check if HTTP status is 2xx
                    displayMessage(data.message || 'Login successful!', 'success'); // Use new display function

                    if (data.token) {
                        localStorage.setItem('authToken', data.token); // Store JWT
                        localStorage.setItem('user', JSON.stringify(data.user)); // Store user data
                    }

                    // --- Handle redirection based on verification status ---
                    if (data.user && data.user.is_verified) {
                        setTimeout(() => {
                            window.location.href = '/dashboard'; // Redirect to user dashboard
                        }, 2000); // Redirect after 2 seconds to show message
                    } else {
                        // Account not verified, redirect to verification page
                        displayMessage(data.message || 'Your email is not verified. Please verify your email.', 'error'); // Use new display function
                        // alert(data.message || 'Your email is not verified. Please verify your email.'); // Old alert removed
                        localStorage.setItem('verificationEmail', email); // Store email for verification page
                        setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; // Redirect to verification page
                        }, 2000); // Redirect after 2 seconds to show message
                    }
                } else {
                    // Handle server-side errors (e.g., 401, 403, 500)
                    displayMessage(data.message || 'Login failed. Please try again.', 'error'); // Use new display function
                    // Specific handling for unverified users, if not already caught by backend's 403 response
                    if (data.email && data.user && !data.user.is_verified) {
                         localStorage.setItem('verificationEmail', email); // Store email for verification page
                         setTimeout(() => {
                            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html'; // Redirect to verification page
                         }, 2000);
                    }
                }
            } catch (error) {
                console.error('Error during login fetch operation:', error);
                displayMessage(error.message || 'An unexpected error occurred. Please try again later.', 'error'); // Use new display function
            }
        });
    }

    // Clear messages when user types in email or password
    emailInput.addEventListener('input', clearMessages);
    passwordInput.addEventListener('input', clearMessages);

});
