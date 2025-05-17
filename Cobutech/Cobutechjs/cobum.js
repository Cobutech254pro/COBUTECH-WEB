// Cobutechjs/cobum.js

// =========================================================================
//                             TOP TYPING ANIMATION
// =========================================================================

const topTypingElement = document.querySelector('.typing-animation-top');
const topText = "COBUTECH INDUSTRY BEST TECH EVER";
const topTypingSpeed = 50; // Reduced speed for smoother movement
let topTextIndex = 0;

function typeTopText() {
    if (topTypingElement) {
        topTypingElement.style.transform = `translateX(${100 - (topTextIndex / topText.length) * 200}%)`; // Smooth right to left
        topTextIndex++;
        if (topTextIndex > topText.length * 2) { // Adjust for smoother loop
            topTextIndex = 0;
        }
        setTimeout(typeTopText, topTypingSpeed);
    }
}

// Start the top typing animation when the script loads
typeTopText();

// =========================================================================
//                            CONTINUE SECTION
// =========================================================================

const continueButton = document.getElementById('continue-button');
const authButtonsDiv = document.getElementById('auth-buttons');

// Initially hide the Continue button
if (continueButton) {
    continueButton.style.display = 'none';
    continueButton.addEventListener('click', () => {
        if (authButtonsDiv) {
            authButtonsDiv.classList.remove('hidden'); // Show Sign In and Log In buttons
            continueButton.style.display = 'none'; // Hide the Continue button
        }
    });
}

// =========================================================================
//                             CONTACT SECTION
// =========================================================================

const contactTypingElement = document.querySelector('.typing-animation-contact');
const contactButton = document.getElementById('contact-button');
const contactText = "TO CONTACT ME";
const contactTypingSpeed = 120; // Adjust speed in milliseconds
let contactTextIndex = 0;

function typeContactText() {
    if (contactTypingElement) {
        contactTypingElement.textContent = contactText.substring(0, contactTextIndex);
        contactTextIndex++;
        if (contactTextIndex > contactText.length) {
            // Animation complete, show the Contact button
            if (contactButton) {
                contactButton.style.display = 'inline-block';
            }
        } else {
            setTimeout(typeContactText, contactTypingSpeed);
        }
    }
}

// Initially hide the Contact button
if (contactButton) {
    contactButton.style.display = 'none';
}

// Start the contact typing animation when the script loads
typeContactText();

// =========================================================================
//                               END OF FILE
// =========================================================================
