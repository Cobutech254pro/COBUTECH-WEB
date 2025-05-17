// Cobutechjs/cobu.js
const profileContainer = document.querySelector('.profile-container');
const topTextElement = document.querySelector('.top-text');
const bottomTextElement = document.querySelector('.bottom-text');
const textTop = "COBUTECH WEB";
const textBottom = "INDUSTRY POWER ⚡";
const typingSpeed = 100; // milliseconds per character
const animationDelay = 3000; // 3 seconds
const redirectionDelay = 5000; // 5 seconds
const moveAmount = 2; // Pixels to move per character typed (adjust as needed)

let topTextIndex = 0;
let bottomTextIndex = 0;
let profilePosition = 0;
let movingLeft = true; // Start moving left from the beginning

function typeText(element, text, index, callback) {
    if (index < text.length) {
        element.textContent = text.substring(0, index + 1);
        // Move the profile as each character types
        if (movingLeft) {
            profilePosition -= moveAmount;
            profileContainer.style.left = profilePosition + 'px';
            // You might want to add a condition to stop moving left at some point
            if (profilePosition <= -100) { // Example: Stop moving after -100px
                movingLeft = false;
            }
        } else {
            profilePosition += moveAmount;
            profileContainer.style.left = profilePosition + 'px';
            if (profilePosition >= 0) {
                movingLeft = true;
            }
        }
        setTimeout(() => typeText(element, text, index + 1, callback), typingSpeed);
    } else if (callback) {
        callback();
    }
}

// Initially position the profile on the right (outside the visible area)
profileContainer.style.position = 'absolute';
profileContainer.style.right = '-5cm'; // Adjust based on the profile width

// Start the typing animation and profile movement after a delay
setTimeout(() => {
    // Start typing the top text, which will also move the profile
    typeText(topTextElement, textTop, 0, () => {
        // Once top text is typed, start typing the bottom text, which will continue to move the profile
        typeText(bottomTextElement, textBottom, 0, () => {
            // After the animation, set a timeout for redirection
            setTimeout(() => {
                window.location.href = 'Cobutechhtml/inlet.html';
            }, redirectionDelay);
        });
    });
}, animationDelay);
