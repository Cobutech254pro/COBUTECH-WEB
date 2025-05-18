document.addEventListener('DOMContentLoaded', () => {
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const nextButton = document.getElementById('next-step');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchDiv = document.getElementById('password-match');
    const togglePasswordButton = document.getElementById('toggle-password');
    const signinForm = document.getElementById('signin-form');
    const termsCheckbox = document.getElementById('terms');
    const submitButton = step2.querySelector('button[type="submit"]'); // Get the submit button within step-2

    nextButton.addEventListener('click', () => {
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        setTimeout(() => {
            step2.classList.add('active');
        }, 50); // Small delay to trigger the transition
    });

    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let strength = 'weak';
        if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^\w\s]/.test(password)) {
            strength = 'strong';
        } else if (password.length >= 6 && (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) || (/[a-zA-Z]/.test(password) && /[^\w\s]/.test(password)) || (/[0-9]/.test(password) && /[^\w\s]/.test(password))) {
            strength = 'medium';
        }
        passwordStrengthDiv.textContent = `Password strength: ${strength}`;
        passwordStrengthDiv.className = strength; // Add class for color styling
        enableSubmitIfConditionsMet(); // Check if submit should be enabled
    });

    confirmPasswordInput.addEventListener('input', () => {
        if (passwordInput.value === confirmPasswordInput.value) {
            passwordMatchDiv.textContent = 'Passwords match';
            passwordMatchDiv.className = 'match';
        } else {
            passwordMatchDiv.textContent = 'Passwords do not match';
            passwordMatchDiv.className = 'mismatch';
        }
        enableSubmitIfConditionsMet(); // Check if submit should be enabled
    });

    termsCheckbox.addEventListener('change', () => {
        enableSubmitIfConditionsMet(); // Check if submit should be enabled
    });

    function enableSubmitIfConditionsMet() {
        if (passwordInput.value === confirmPasswordInput.value && termsCheckbox.checked) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }

    signinForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission for now

        // In a real scenario, you would send the data to your backend here
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;

        console.log('Submitting:', { username, email, password });

        // After successful backend storage, redirect to verification.html
        window.location.href = 'verification.html';
    });
});
