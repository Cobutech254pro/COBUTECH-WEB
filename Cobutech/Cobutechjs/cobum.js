Const topTypingElement = document.querySelector('.typing-animation-top');
const topText = "COBUTECH INDUSTRY BEST TECH EVER";
const topTypingSpeed = 50;
let topTextIndex = 0;
function typeTopText() {
    if (topTypingElement) {
        topTypingElement.style.transform = `translateX(${100 - (topTextIndex / topText.length) * 200}%)`;
        topTextIndex++;
        if (topTextIndex > topText.length * 2) {
            topTextIndex = 0;
        }
        setTimeout(typeTopText, topTypingSpeed);
    }
}
typeTopText();

const continueButton = document.getElementById('continue-button');
const authButtonsDiv = document.getElementById('auth-buttons');
if (continueButton) {
    // continueButton.style.display = 'none'; // REMOVE OR COMMENT OUT THIS LINE
    continueButton.addEventListener('click', () => {
        if (authButtonsDiv) {
            authButtonsDiv.classList.remove('hidden');
            continueButton.style.display = 'none';
        }
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
            if (contactButton) {
                contactButton.style.display = 'inline-block';
            }
        } else {
            setTimeout(typeContactText, contactTypingSpeed);
        }
    }
}
if (contactButton) {
    contactButton.style.display = 'none';
}
typeContactText();
