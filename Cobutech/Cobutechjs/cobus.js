document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const nextButton = document.getElementById('next-step');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchDiv = document.getElementById('password-match');
    const togglePasswordButton = document.getElementById('toggle-password');
    const signupForm = document.getElementById('signup-form'); // <--- RENAMED from signinForm to signupForm
    const termsCheckbox = document.getElementById('terms');
    const submitButton = step2.querySelector('button[type="submit"]');

    // Make sure your HTML form has id="signup-form"
    // e.g., <form id="signup-form"> ... </form>

    // Event listener for the "Next Step" button
    nextButton.addEventListener('click', () => {
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
        enableSubmitIfConditionsMet();
    });

    // Function to enable/disable the submit button based on conditions
    function enableSubmitIfConditionsMet() {
        if (passwordInput.value === confirmPasswordInput.value && termsCheckbox.checked) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }

    // Event listener for the signup form submission
    signupForm.addEventListener('submit', async (event) => { // Added 'async' keyword, used signupForm
        event.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json(); // Always parse JSON for error messages too

            if (!response.ok) {
                // Handle server errors (e.g., 400, 409, 500)
                if (response.status === 409 && data.redirectToVerification) {
                    // Scenario: User already exists but unverified (from server response)
                    alert(data.message);
                    localStorage.setItem('verificationEmail', data.email);
                    window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                } else if (response.status === 409 && data.alreadyVerified) {
                    // Scenario: User already exists and IS verified
                    alert(data.message + ' Please try logging in.');
                    // Optionally redirect to login page
                    // window.location.href = 'path/to/your/login.html';
                } else {
                    // Generic server error
                    throw new Error(data.message || 'Sign-up failed due to server error.');
                }
            } else {
                // Successful 200 or 201 response
                console.log('Success:', data);
                alert(data.message || 'Sign-up successful. Please check your email for verification.');

                // If the server explicitly tells us to redirect to verification
                if (data.redirectToVerification && data.email) {
                    localStorage.setItem('verificationEmail', data.email);
                    window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                } else {
                    // For any other successful scenario (e.g., direct login for some reason, though not typical for signup)
                    // You might redirect to a dashboard or a login page here.
                    console.log("Signup success, but no explicit verification redirect. User might need to log in manually.");
                }
            }

        } catch (error) {
            console.error('Error during signup fetch:', error);
            alert(error.message || 'Network error or sign-up failed');
        }
    });
});
