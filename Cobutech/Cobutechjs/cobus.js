// public/Cobutech/Cobutechjs/cobus.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Step 1 & 2 Transition Elements (assuming your signup form is multi-step) ---
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const nextButton = document.getElementById('next-step');

    // --- Password Related Elements ---
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordStrengthDiv = document.getElementById('password-strength');
    const passwordMatchDiv = document.getElementById('password-match');
    const togglePasswordButton = document.getElementById('toggle-password');

    // --- Form & Submission Elements ---
    const signupForm = document.getElementById('signup-form'); // Assumed ID for your signup form
    const termsCheckbox = document.getElementById('terms');
    const submitButton = step2 ? step2.querySelector('button[type="submit"]') : null; // Get submit button from step2

    // --- Event Listeners for Multi-Step Form (if applicable) ---
    if (nextButton && step1 && step2) {
        nextButton.addEventListener('click', () => {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            setTimeout(() => {
                step2.classList.add('active');
            }, 50);
        });
    }

    // --- Password Toggle ---
    if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    // --- Password Strength Check ---
    if (passwordInput && passwordStrengthDiv) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            let strength = 'weak';
            if (password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^\w\s]/.test(password)) {
                strength = 'strong';
            } else if (password.length >= 6 && ((/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) || (/[a-zA-Z]/.test(password) && /[^\w\s]/.test(password)) || (/[0-9]/.test(password) && /[^\w\s]/.test(password)))) {
                strength = 'medium';
            }
            passwordStrengthDiv.textContent = `Password strength: ${strength}`;
            passwordStrengthDiv.className = strength;
            enableSubmitIfConditionsMet();
        });
    }

    // --- Password Match Check ---
    if (confirmPasswordInput && passwordInput && passwordMatchDiv) {
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
    }

    // --- Terms Checkbox ---
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            enableSubmitIfConditionsMet();
        });
    }

    // --- Enable/Disable Submit Button Logic ---
    function enableSubmitIfConditionsMet() {
        if (submitButton && passwordInput && confirmPasswordInput && termsCheckbox) {
            // Check if passwords match, terms are checked, and password is not empty
            if (passwordInput.value === confirmPasswordInput.value && termsCheckbox.checked && passwordInput.value.length > 0) {
                submitButton.removeAttribute('disabled');
            } else {
                submitButton.setAttribute('disabled', 'true');
            }
        }
    }

    // --- Main Signup Form Submission Logic ---
    if (signupForm) { // Ensure the form element exists
        signupForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission

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
                const data = await response.json();
                if (response.ok) { 
                    alert(data.message || 'Action successful. Please check your email for verification.');
                    localStorage.setItem('verificationEmail', email); 
                    window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                } else { 
                    throw new Error(data.message || 'Sign-up failed.');
                }
            } catch (error) {
                console.error('Error during signup fetch:', error);
                alert(error.message || 'Network error or server unreachable. Please try again.');
            }
        });
    }
    enableSubmitIfConditionsMet();
});
