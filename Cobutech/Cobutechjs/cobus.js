document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const nextButton = document.getElementById('next-step');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchDiv = document.getElementById('password-match');
    const togglePasswordButton = document.getElementById('toggle-password');
    const signinForm = document.getElementById('signin-form'); // This is your signup form
    const termsCheckbox = document.getElementById('terms');
    const submitButton = step2.querySelector('button[type="submit"]');

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
    signinForm.addEventListener('submit', async (event) => { // Added 'async' keyword
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

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Sign-up failed');
            }

            const data = await response.json();

            console.log('Success:', data);
            alert(data.message || 'Sign-up successful. Please check your email for verification.');

            // --- IMPORTANT FIX: Store email in localStorage before redirecting ---
            localStorage.setItem('verificationEmail', email);

            // Redirect to the verification page
            window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';

        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Network error or sign-up failed');
        }
    });
});
