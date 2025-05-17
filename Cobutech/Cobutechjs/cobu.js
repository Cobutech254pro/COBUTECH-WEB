// Cobutechjs/cobu.js
const profileContainer = document.querySelector('.profile-container');
const topTextElement = document.querySelector('.top-text');
const bottomTextElement = document.querySelector('.bottom-text');
const textTop = "COBUTECH WEB";
const textBottom = "INDUSTRY POWER ⚡";
const typingSpeed = 100; // milliseconds per character
const moveSpeed = 5; // pixels per frame

let topTextIndex = 0;
let bottomTextIndex = 0;
let profilePosition = 0;
let movingLeft = false;

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

// Start typing the top text
typeText(topTextElement, textTop, 0, () => {
    // Once top text is typed, start typing the bottom text
    typeText(bottomTextElement, textBottom, 0, () => {
        // Optionally start the profile movement after the text is done
        requestAnimationFrame(moveProfile);
        // Initially set the profile to the right side
        profileContainer.style.position = 'absolute';
        profileContainer.style.right = '0';
        profilePosition = 0; // Reset position for movement
        movingLeft = true; // Start moving left immediately
    });
});
