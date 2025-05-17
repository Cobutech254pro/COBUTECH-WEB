// Cobutechjs/cobu.js
const profileContainer = document.querySelector('.profile-container');
const typingAnimationContainer = document.querySelector('.typing-animation-container');
const topTextElement = document.querySelector('.top-text');
const bottomTextElement = document.querySelector('.bottom-text');
const textTop = "COBUTECH WEB";
const textBottom = "INDUSTRY POWER ⚡";
const typingSpeed = 100; // milliseconds per character
const appearanceDelay = 2000; // 2 seconds
const redirectionDelay = 4000; // 4 seconds

let topTextIndex = 0;
let bottomTextIndex = 0;

function typeText(element, text, index, callback) {
    if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        setTimeout(() => typeText(element, text, index + 1, callback), typingSpeed);
    } else if (callback) {
        callback();
    }
}

function startAnimation() {
    typeText(topTextElement, textTop, 0, () => {
        typeText(bottomTextElement, textBottom, 0, () => {
            // After the animation, set a timeout for redirection
            setTimeout(() => {
                window.location.href = 'Cobutechhtml/inlet.html';
            }, redirectionDelay);
        });
    });
}

// Make the profile and animation visible and start the animation after the delay
setTimeout(() => {
    profileContainer.classList.add('visible');
    typingAnimationContainer.classList.add('visible');
    startAnimation();
}, appearanceDelay);
