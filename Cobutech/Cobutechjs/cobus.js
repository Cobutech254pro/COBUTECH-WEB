document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const nextButton = document.getElementById('next-step');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchDiv = document.getElementById('password-match');
    const togglePasswordButton = document.getElementById('toggle-password');
    const signupForm = document.getElementById('signup-form');
    const termsCheckbox = document.getElementById('terms');
    const submitButton = step2.querySelector('button[type="submit"]');
    const statusMessageElement = document.getElementById('status-message'); // NEW: Get the message display element

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


    // Event listener for the "Next Step" button
    nextButton.addEventListener('click', () => {
        // Basic validation for Step 1 before proceeding
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');

        if (!usernameInput.value.trim() || !emailInput.value.trim()) {
            displayMessage('Please fill in username and email.', 'error');
            return; // Stop if validation fails
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            displayMessage('Please enter a valid email address.', 'error');
            return;
        }

        clearMessages(); // Clear any previous messages before transition
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        setTimeout(() => {
            step2.classList.add('active');
        }, 50);
    });

    // Event listener for toggling password visibility
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Event listener for password input to check strength
    passwordInput.addEventListener('input', () => {
        clearMessages(); // Clear message when user starts typing password
        const password = passwordInput.value;
        let strength = 'weak';
        if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^\w\s]/.test(password)) {
            strength = 'strong';
        } else if (password.length >= 6 && (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) || (/[a-zA-Z]/.test(password) && /[^\w\s]/.test(password)) || (/[0-9]/.test(password) && /[^\w\s]/.test(password))) {
            strength = 'medium';
        }
        passwordStrengthDiv.textContent = `Password strength: ${strength}`;
        passwordStrengthDiv.className = strength;
        enableSubmitIfConditionsMet();
    });

    // Event listener for confirm password input to check match
    confirmPasswordInput.addEventListener('input', () => {
        clearMessages(); // Clear message when user starts typing confirm password
        if (passwordInput.value === confirmPasswordInput.value) {
            passwordMatchDiv.textContent = 'Passwords match';
            passwordMatchDiv.className = 'match';
        } else {
            passwordMatchDiv.textContent = 'Passwords do not match';
            passwordMatchDiv.className = 'mismatch';
        }
        enableSubmitIfConditionsMet();
    });

    // Event listener for terms and conditions checkbox
    termsCheckbox.addEventListener('change', () => {
        clearMessages(); // Clear message if checkbox state changes
        enableSubmitIfConditionsMet();
    });

    // Function to enable/disable the submit button based on conditions
    function enableSubmitIfConditionsMet() {
        const isPasswordMatch = passwordInput.value === confirmPasswordInput.value && passwordInput.value.length > 0;
        const isTermsChecked = termsCheckbox.checked;

        // You might want to also check password strength here if 'medium' or 'strong' is required
        const currentPasswordStrength = passwordStrengthDiv.className; // 'weak', 'medium', 'strong'
        const isPasswordStrongEnough = currentPasswordStrength === 'medium' || currentPasswordStrength === 'strong'; // Or just 'strong' if you prefer

        if (isPasswordMatch && isTermsChecked && isPasswordStrongEnough) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }

    // Event listener for the signup form submission
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearMessages(); // Clear previous messages on submission

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        // Re-validate terms and password match one last time
        if (!termsCheckbox.checked) {
            displayMessage('You must agree to the Terms and Conditions.', 'error');
            return;
        }
        if (password !== confirmPasswordInput.value) {
            displayMessage('Passwords do not match.', 'error');
            return;
        }
        // Add check for password strength if needed
        if (passwordStrengthDiv.className === 'weak') {
            displayMessage('Password is too weak. Please use a stronger password.', 'error');
            return;
        }

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle server errors (e.g., 400, 409, 500)
                if (response.status === 409 && data.redirectToVerification) {
                    // Scenario: User already exists but unverified (from server response)
                    displayMessage(data.message, 'error'); // Display on page
                    localStorage.setItem('verificationEmail', data.email);
                    // Redirect after a short delay so user can read message
                    setTimeout(() => {
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }, 2000);
                } else if (response.status === 409 && data.alreadyVerified) {
                    // Scenario: User already exists and IS verified
                    displayMessage(data.message + ' Please try logging in.', 'error'); // Display on page
                    // Optionally, redirect to login page after a delay
                    // setTimeout(() => {
                    //     window.location.href = 'path/to/your/login.html';
                    // }, 2000);
                } else {
                    // Generic server error
                    displayMessage(data.message || 'Sign-up failed due to server error.', 'error'); // Display on page
                    // throw new Error(data.message || 'Sign-up failed due to server error.'); // Removed throw, handled by display
                }
            } else {
                // Successful 200 or 201 response
                console.log('Success:', data);
                displayMessage(data.message || 'Sign-up successful. Please check your email for verification.', 'success'); // Display on page

                // If the server explicitly tells us to redirect to verification
                if (data.redirectToVerification && data.email) {
                    localStorage.setItem('verificationEmail', data.email);
                    // Redirect after a short delay so user can read message
                    setTimeout(() => {
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }, 2000);
                } else {
                    console.log("Signup success, but no explicit verification redirect. User might need to log in manually.");
                    // You might redirect to a dashboard or a login page here.
                    // For example:
                    // setTimeout(() => {
                    //     window.location.href = 'path/to/your/login.html';
                    // }, 2000);
                }
            }

        } catch (error) {
            console.error('Error during signup fetch:', error);
            displayMessage(error.message || 'Network error or sign-up failed. Please try again.', 'error'); // Display on page
        }
    });

    // Initial check for submit button state on page load
    enableSubmitIfConditionsMet();
});
