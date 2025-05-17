// Cobutechjs/cobum.js

// ---------------------- Top Typing Animation ----------------------
const topTypingElement = document.querySelector('.typing-animation-top');
const topText = "COBUTECH INDUSTRY BEST TECH EVER";
const topTypingSpeed = 150; // Adjust speed in milliseconds
let topTextIndex = 0;

function typeTopText() {
    if (topTypingElement) {
        topTypingElement.textContent = topText.substring(0, topTextIndex);
        topTextIndex++;
        if (topTextIndex > topText.length) {
            topTextIndex = 0; // Reset to loop the animation
        }
        setTimeout(typeTopText, topTypingSpeed);
    }
}

// Start the top typing animation when the script loads
typeTopText();

// ---------------------- Continue Section ----------------------
const continueTypingElement = document.querySelector('.typing-animation-continue');
const continueButton = document.getElementById('continue-button');
const authButtonsDiv = document.getElementById('auth-buttons');
const continueText = "PLEASE CONTINUE BY";
const continueTypingSpeed = 100; // Adjust speed in milliseconds
let continueTextIndex = 0;

function typeContinueText() {
    if (continueTypingElement) {
        continueTypingElement.textContent = continueText.substring(0, continueTextIndex);
        continueTextIndex++;
        if (continueTextIndex > continueText.length) {
            // Animation complete, show the Continue button
            if (continueButton) {
                continueButton.style.display = 'inline-block';
            }
        } else {
            setTimeout(typeContinueText, continueTypingSpeed);
        }
    }
}

// Initially hide the Continue button
if (continueButton) {
    continueButton.style.display = 'none';
    // Add event listener to the Continue button
    continueButton.addEventListener('click', () => {
        if (authButtonsDiv) {
            authButtonsDiv.classList.remove('hidden'); // Show Sign In and Log In buttons
            continueButton.style.display = 'none'; // Hide the Continue button
        }
    });
}

// Start the continue typing animation when the script loads
typeContinueText();

// ---------------------- Contact Section ----------------------
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
