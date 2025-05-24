// Animate the top sentence
const topTypingElement = document.querySelector('.typing-animation-top');
if (topTypingElement) {
    topTypingElement.textContent = "COBUTECH INDUSTRY BEST TECH EVER";
}
const continueButton = document.getElementById('continue-button');
const authButtonsDiv = document.getElementById('auth-buttons');
if (continueButton && authButtonsDiv) {
    continueButton.addEventListener('click', () => {
        authButtonsDiv.classList.remove('hidden');
        continueButton.style.display = 'none';
    });
}
const contactTypingElement = document.querySelector('.typing-animation-contact');
const contactButton = document.getElementById('contact-button');
const contactText = "TO CONTACT ME";
const contactTypingSpeed = 120;
let contactTextIndex = 0;
function typeContactText() {
    if (contactTypingElement) {
        contactTypingElement.textContent = contactText.substring(0, contactTextIndex);
        contactTextIndex++;
        if (contactTextIndex > contactText.length) {
            if (contactButton) contactButton.style.display = 'inline-block';
        } else {
            setTimeout(typeContactText, contactTypingSpeed);
        }
    }
}
if (contactButton) contactButton.style.display = 'none';
typeContactText();
