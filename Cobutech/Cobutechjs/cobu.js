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
const moveAmount = 2; // Pixels to move per character typed (adjust as needed)

let topTextIndex = 0;
let bottomTextIndex = 0;
let profilePosition = 0;
let movingLeft = true;
let animationActive = true;

// Initially center the profile
profileContainer.style.position = 'relative';
profileContainer.style.left = '0';

function moveProfile() {
    if (animationActive) {
        if (movingLeft) {
            profilePosition -= moveAmount;
            profileContainer.style.left = profilePosition + 'px';
        }
        requestAnimationFrame(moveProfile);
    }
}

function typeText(element, text, index, callback) {
    if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        setTimeout(() => {
            if (element === topTextElement) {
                topTextIndex = index + 1;
            } else if (element === bottomTextElement) {
                bottomTextIndex = index + 1;
            }
            typeText(element, text, index + 1, callback);
        }, typingSpeed);
    } else if (callback) {
        callback();
    }
}

function startAnimation() {
    requestAnimationFrame(moveProfile);

    typeText(topTextElement, textTop, 0, () => {
        typeText(bottomTextElement, textBottom, 0, () => {
            // After all text is typed, stop the profile movement
            animationActive = false;
            // Set a timeout for redirection
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
