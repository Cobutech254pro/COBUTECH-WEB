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

// Initially center the profile
profileContainer.style.position = 'relative';
profileContainer.style.left = '0';

function startAnimation() {
    requestAnimationFrame(function moveProfile() {
        if (movingLeft && (topTextIndex < textTop.length || bottomTextIndex < textBottom.length)) {
            profilePosition -= moveAmount;
            profileContainer.style.left = profilePosition + 'px';
            requestAnimationFrame(moveProfile);
        }
    });

    typeText(topTextElement, textTop, 0, () => {
        typeText(bottomTextElement, textBottom, 0, () => {
            // After the animation, set a timeout for redirection
            setTimeout(() => {
                window.location.href = 'Cobutechhtml/inlet.html';
            }, redirectionDelay);
        });
    });
}

function typeText(element, text, index, callback) {
    if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        setTimeout(() => typeText(element, text, index + 1, callback), typingSpeed);
    } else if (callback) {
        callback();
    }
}

// Make the profile and animation visible and start the animation after the delay
setTimeout(() => {
    profileContainer.classList.add('visible');
    typingAnimationContainer.classList.add('visible');
    startAnimation();
}, appearanceDelay);
