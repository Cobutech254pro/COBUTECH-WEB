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
    const submitButton = step2 ? step2.querySelector('button[type="submit"]') : null;
    if (nextButton && step1 && step2) {
        nextButton.addEventListener('click', () => {
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            setTimeout(() => {
                step2.classList.add('active');
            }, 50);
        });
    }
    if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

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
    if (termsCheckbox) {
        termsCheckbox.addEventListener('change', () => {
            enableSubmitIfConditionsMet();
        });
    }
    function enableSubmitIfConditionsMet() {
        if (submitButton && passwordInput && confirmPasswordInput && termsCheckbox) {
            if (passwordInput.value === confirmPasswordInput.value && termsCheckbox.checked && passwordInput.value.length > 0) {
                submitButton.removeAttribute('disabled');
            } else {
                submitButton.setAttribute('disabled', 'true');
            }
        }
    }
    if (signupForm) { 
        signupForm.addEventListener('submit', async (event) => {
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
   
});
