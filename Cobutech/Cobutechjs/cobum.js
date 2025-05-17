// Cobutechjs/cobum.js

// Top Typing Animation
const topTypingElement = document.querySelector('.typing-animation-top');
const topText = "COBUTECH INDUSTRY BEST TECH EVER";
const topTypingSpeed = 150; // Adjust speed as needed
let topTextIndex = 0;

function typeTopText() {
    if (topTextElement) {
        topTextElement.textContent = topText.substring(0, topTextIndex);
        topTextIndex++;
        if (topTextIndex > topText.length) {
            topTextIndex = 0; // Reset to loop the animation
        }
        setTimeout(typeTopText, topTypingSpeed);
    }
}

// Continue Section
const continueTypingElement = document.querySelector('.typing-animation-continue');
const continueButton = document.getElementById('continue-button');
const authButtonsDiv = document.getElementById('auth-buttons');
const continueText = "PLEASE CONTINUE BY";
const continueTypingSpeed = 100; // Adjust speed as needed
let continueTextIndex = 0;

function typeContinueText() {
    if (continueTypingElement) {
        continueTypingElement.textContent = continueText.substring(0, continueTextIndex);
        continueTextIndex++;
        if (continueTextIndex > continueText.length) {
            // Animation complete, show the Continue button
            continueButton.style.display = 'inline-block';
        } else {
            setTimeout(typeContinueText, continueTypingSpeed);
        }
    }
}

if (continueButton) {
    continueButton.style.display = 'none'; // Initially hide the Continue button
    continueButton.addEventListener('click', () => {
        if (authButtonsDiv) {
            authButtonsDiv.classList.remove('hidden'); // Show Sign In and Log In buttons
            continueButton.style.display = 'none'; // Hide the Continue button
        }
    });
}

// Contact Section
const contactTypingElement = document.querySelector('.typing-animation-contact');
const contactButton = document.getElementById('contact-button');
const contactText = "TO CONTACT ME";
const contactTypingSpeed = 120; // Adjust speed as needed
let contactTextIndex = 0;

function typeContactText() {
    if (contactTypingElement) {
        contactTypingElement.textContent = contactText.substring(0, contactTextIndex);
        contactTextIndex++;
        if (contactTextIndex > contactText.length) {
            // Animation complete, show the Contact button
            contactButton.style.display = 'inline-block';
        } else {
            setTimeout(typeContactText, contactTypingSpeed);
        }
    }
}

if (contactButton) {
    contactButton.style.display = 'none'; // Initially hide the Contact button
}

// Start the animations
typeTopText();
typeContinueText();
typeContactText();
