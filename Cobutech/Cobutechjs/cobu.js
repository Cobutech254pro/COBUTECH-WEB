// Cobutechjs/cobu.js
const profileContainer = document.querySelector('.profile-container');
const profileImage = document.querySelector('.profile-image');
const topTextElement = document.querySelector('.top-text');
const bottomTextElement = document.querySelector('.bottom-text');
const textTop = "COBUTECH WEB";
const textBottom = "INDUSTRY POWER ⚡";
const typingSpeed = 100; // milliseconds per character
const profileAppearDelay = 4000; // 4 seconds
const redirectionDelay = 5000; // 5 seconds
const moveAmount = 2; // Pixels to move per character typed (adjust as needed)

let topTextIndex = 0;
let bottomTextIndex = 0;
let profilePosition = 0;
let movingLeft = true;
let animationStarted = false;

// Initially center the profile
profileContainer.style.position = 'relative';
profileContainer.style.left = '0'; // Center horizontally by default in flex context

// Function to start the animation and movement
function startAnimation() {
    requestAnimationFrame(function moveProfile() {
        if (movingLeft && topTextIndex < textTop.length + bottomTextIndex < textBottom.length) {
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

// Make the profile visible after the delay
setTimeout(() => {
    profileImage.classList.add('visible');
    // Start the typing animation and profile movement after the profile appears
    setTimeout(startAnimation, 0); // Start immediately after appearing
}, profileAppearDelay);
