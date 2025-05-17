// Cobutechjs/cobu.js
const profileContainer = document.querySelector('.profile-container');
const topTextElement = document.querySelector('.top-text');
const bottomTextElement = document.querySelector('.bottom-text');
const textTop = "COBUTECH WEB";
const textBottom = "INDUSTRY POWER ⚡";
const typingSpeed = 100; // milliseconds per character
const moveSpeed = 5; // pixels per frame
const animationDelay = 3000; // 3 seconds
const redirectionDelay = 5000; // 5 seconds

let topTextIndex = 0;
let bottomTextIndex = 0;
let profilePosition = 0;
let movingLeft = false;
let animationStarted = false;

function typeText(element, text, index, callback) {
    if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        setTimeout(() => typeText(element, text, index + 1, callback), typingSpeed);
    } else if (callback) {
        callback();
    }
}

function moveProfile() {
    if (movingLeft) {
        profilePosition -= moveSpeed;
        if (profilePosition <= -50) { // Adjust this value based on how far you want it to move
            movingLeft = false;
        }
    } else {
        profilePosition += moveSpeed;
        if (profilePosition >= 0) {
            movingLeft = true;
        }
    }
    profileContainer.style.left = profilePosition + 'px';
    requestAnimationFrame(moveProfile);
}

// Initially position the profile on the right
profileContainer.style.position = 'absolute';
profileContainer.style.right = '0';

// Start the typing animation and profile movement after a delay
setTimeout(() => {
    animationStarted = true;
    requestAnimationFrame(moveProfile);
    typeText(topTextElement, textTop, 0, () => {
        typeText(bottomTextElement, textBottom, 0, () => {
            // After the animation, set a timeout for redirection
            setTimeout(() => {
                window.location.href = 'Cobutech/Cobutechhtml/cobuin.html';
            }, redirectionDelay);
        });
    });
}, animationDelay);
