// public/Cobutech/Cobutechjs/cobus.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('cobus.js (Signup) script loaded.');

    // --- DOM Elements ---
    // Multi-step form elements
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const nextButton = document.getElementById('next-step');

    // Input fields
    const usernameInput = document.getElementById('username'); // Assuming a username input
    const emailInput = document.getElementById('email');       // Assuming an email input
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const termsCheckbox = document.getElementById('terms');

    // Feedback elements
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchDiv = document.getElementById('password-match');
    const signupMessageDiv = document.getElementById('signup-message'); // Added for general signup messages

    // Buttons
    const togglePasswordButton = document.getElementById('toggle-password');
    const signupForm = document.getElementById('signup-form'); // Crucial: Ensure your signup HTML form has this ID
    // Select submit button only if step2 exists to avoid errors on page load if step2 is initially hidden
    const submitButton = step2 ? step2.querySelector('button[type="submit"]') : null;

    // --- Helper Functions ---

    // Function to update password strength feedback
    function updatePasswordStrength() {
        if (!passwordInput || !passwordStrengthDiv) return;

        const password = passwordInput.value;
        let strength = 'weak';
        if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^\w\s]/.test(password)) {
            strength = 'strong';
        } else if (password.length >= 6 && (/[a-zA-Z]/.test(password) && /[0-9]/.test(password) || /[a-zA-Z]/.test(password) && /[^\w\s]/.test(password) || /[0-9]/.test(password) && /[^\w\s]/.test(password))) {
            strength = 'medium';
        }
        passwordStrengthDiv.textContent = `Password strength: ${strength}`;
        // Apply a class for styling (e.g., color: red for weak, orange for medium, green for strong)
        passwordStrengthDiv.className = `password-strength-${strength}`;
        enableSubmitIfConditionsMet(); // Re-evaluate submit button state
    }

    // Function to update password match feedback
    function updatePasswordMatch() {
        if (!passwordInput || !confirmPasswordInput || !passwordMatchDiv) return;

        if (passwordInput.value === confirmPasswordInput.value) {
            passwordMatchDiv.textContent = 'Passwords match';
            passwordMatchDiv.className = 'password-match-match'; // Add class for styling
        } else {
            passwordMatchDiv.textContent = 'Passwords do not match';
            passwordMatchDiv.className = 'password-match-mismatch'; // Add class for styling
        }
        enableSubmitIfConditionsMet(); // Re-evaluate submit button state
    }

    // Function to enable/disable the submit button
    function enableSubmitIfConditionsMet() {
        // Ensure all required elements are present
        if (!submitButton || !passwordInput || !confirmPasswordInput || !termsCheckbox) {
            console.warn("Missing elements for submit button logic.");
            return;
        }

        // Conditions: passwords match, terms are checked, and password field is not empty
        const passwordsMatch = passwordInput.value === confirmPasswordInput.value;
        const termsAccepted = termsCheckbox.checked;
        const passwordNotEmpty = passwordInput.value.length > 0; // Ensure a password has been entered

        if (passwordsMatch && termsAccepted && passwordNotEmpty) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }

    // Function to display messages to the user
    function displayMessage(message, type = 'info') {
        if (signupMessageDiv) {
            signupMessageDiv.textContent = message;
            // Remove previous type classes and add the new one
            signupMessageDiv.className = `signup-message ${type}`; // e.g., 'signup-message success', 'signup-message error'
            signupMessageDiv.style.display = 'block'; // Ensure it's visible
        } else {
            alert(message); // Fallback to alert if message div not found
        }
    }

    // --- Event Listeners ---

    // Multi-step form navigation
    if (nextButton && step1 && step2) {
        nextButton.addEventListener('click', () => {
            // Basic validation before moving to step 2 (optional, but good practice)
            if (!usernameInput.value || !emailInput.value) {
                displayMessage('Please fill in username and email before proceeding.', 'error');
                return;
            }
            displayMessage('', 'info'); // Clear previous message
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            // Small timeout to allow CSS transition
            setTimeout(() => {
                step2.classList.add('active');
            }, 50);
        });
    }

    // Password visibility toggle
    if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️'; // Changes icon
        });
    }

    // Password input events
    if (passwordInput) {
        passwordInput.addEventListener('input', updatePasswordStrength);
        passwordInput.addEventListener('input', updatePasswordMatch); // Also check match when password changes
    }

    // Confirm password input event
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', updatePasswordMatch);
    }

    // Terms checkbox event
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', enableSubmitIfConditionsMet);
    }

    // --- Main Signup Form Submission Logic ---
    if (signupForm) {
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default browser form submission

            // Clear previous messages
            displayMessage('', 'info');

            // Basic client-side validation before sending
            const username = usernameInput ? usernameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!username || !email || !password || !confirmPasswordInput || !termsCheckbox) {
                displayMessage('Please fill in all required fields.', 'error');
                return;
            }
            if (password !== confirmPasswordInput.value) {
                displayMessage('Passwords do not match.', 'error');
                return;
            }
            if (!termsCheckbox.checked) {
                displayMessage('You must agree to the terms and conditions.', 'error');
                return;
            }

            // Temporarily disable submit button to prevent multiple submissions
            if (submitButton) submitButton.setAttribute('disabled', 'true');
            displayMessage('Processing your registration...', 'info');

            try {
                const response = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username, email, password }),
                });

                const data = await response.json();

                if (response.ok) { // Status 200 OK or 201 Created from backend
                    displayMessage(data.message || 'Registration successful. Please check your email for verification.', 'success');

                    // Store email in local storage for the verification page to pick up
                    localStorage.setItem('verificationEmail', email);

                    // Redirect to the verification page
                    // This covers both new registrations and existing unverified accounts being guided to re-verify
                    setTimeout(() => {
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }, 1500); // Give user a moment to read the success message

                } else { // Backend returned an error (e.g., 400, 409, 500)
                    const errorMessage = data.message || 'An unexpected error occurred during signup.';
                    displayMessage(errorMessage, 'error');
                }

            } catch (error) {
                console.error('Network error during signup fetch:', error);
                displayMessage('Network error or server unreachable. Please check your internet connection and try again.', 'error');
            } finally {
                // Re-enable submit button in case of failure or if the user is not redirected immediately
                enableSubmitIfConditionsMet();
            }
        });
    } else {
        console.error("Signup form not found. Make sure its ID is 'signup-form' in your HTML.");
    }

    // --- Initial Setup on Page Load ---
    updatePasswordStrength(); // Set initial strength for password field if pre-filled
    updatePasswordMatch();    // Set initial match status
    enableSubmitIfConditionsMet(); // Set initial state of the submit button (usually disabled)
});
