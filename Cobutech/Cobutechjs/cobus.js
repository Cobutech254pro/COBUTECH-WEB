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
    const statusMessageElement = document.getElementById('status-message'); 
    function displayMessage(message, type) {
        statusMessageElement.textContent = message;
        statusMessageElement.style.display = 'block'; 
        statusMessageElement.className = 'status-message'; /
        if (type === 'success') {
            statusMessageElement.classList.add('success');
        } else if (type === 'error') {
            statusMessageElement.classList.add('error');
        }
        setTimeout(() => {
            statusMessageElement.style.display = 'none';
            statusMessageElement.textContent = 'status-message';
        }, 5000);
    }
    function clearMessages() {
        statusMessageElement.style.display = 'none';
        statusMessageElement.textContent = '';
        statusMessageElement.className = 'status-message';
    }
    nextButton.addEventListener('click', () => {
        const usernameInput = document.getElementById('username');
        const emailInput = document.getElementById('email');
        if (!usernameInput.value.trim() || !emailInput.value.trim()) {
            displayMessage('Please fill in username and email.', 'error');
            return; 
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
            displayMessage('Please enter a valid email address.', 'error');
            return;
        }
        clearMessages(); 
        step1.classList.add('hidden');
        step2.classList.remove('hidden');
        setTimeout(() => {
            step2.classList.add('active');
        }, 50);
    });
    togglePasswordButton.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordButton.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });
    passwordInput.addEventListener('input', () => {
        clearMessages(); 
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
    confirmPasswordInput.addEventListener('input', () => {
        clearMessages(); 
        if (passwordInput.value === confirmPasswordInput.value) {
            passwordMatchDiv.textContent = 'Passwords match';
            passwordMatchDiv.className = 'match';
        } else {
            passwordMatchDiv.textContent = 'Passwords do not match';
            passwordMatchDiv.className = 'mismatch';
        }
        enableSubmitIfConditionsMet();
    });
    termsCheckbox.addEventListener('change', () => {
        clearMessages(); 
        enableSubmitIfConditionsMet();
    });
    function enableSubmitIfConditionsMet() {
        const isPasswordMatch = passwordInput.value === confirmPasswordInput.value && passwordInput.value.length > 0;
        const isTermsChecked = termsCheckbox.checked;
        const currentPasswordStrength = passwordStrengthDiv.className; 
        const isPasswordStrongEnough = currentPasswordStrength === 'medium' || currentPasswordStrength === 'strong'; 
        if (isPasswordMatch && isTermsChecked && isPasswordStrongEnough) {
            submitButton.removeAttribute('disabled');
        } else {
            submitButton.setAttribute('disabled', 'true');
        }
    }
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearMessages(); 
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = passwordInput.value;
        if (!termsCheckbox.checked) {
            displayMessage('You must agree to the Terms and Conditions.', 'error');
            return;
        }
        if (password !== confirmPasswordInput.value) {
            displayMessage('Passwords do not match.', 'error');
            return;
        }
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
                    displayMessage(data.message, 'error'); 
                    localStorage.setItem('verificationEmail', data.email);
                    setTimeout(() => {
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }, 2000);
                } else if (response.status === 409 && data.alreadyVerified) {
                    displayMessage(data.message + ' Please try logging in.', 'error'); 
          
                    displayMessage(data.message || 'Sign-up failed due to server error.', 'error'); 
                }
            } else {
                console.log('Success:', data);
                displayMessage(data.message || 'Sign-up successful. Please check your email for verification.', 'success'); 
                if (data.redirectToVerification && data.email) {
                    localStorage.setItem('verificationEmail', data.email);
                    setTimeout(() => {
                        window.location.href = '../../../Cobutech/Cobutechhtml/cobuv.html';
                    }, 2000);
                } else {
                    console.log("Signup success, but no explicit verification redirect. User might need to log in manually.");
                }
            }

        } catch (error) {
            console.error('Error during signup fetch:', error);
            displayMessage(error.message || 'Network error or sign-up failed. Please try again.', 'error'); 
        }
    });
    enableSubmitIfConditionsMet();
});
