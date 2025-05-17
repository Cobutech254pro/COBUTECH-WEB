// Cobutech/Cobutechjs/cobuin.js
const typingTextElement = document.querySelector('.typing-animation');
const countdownNumberElement = document.querySelector('.countdown-number');
const loadingContainer = document.querySelector('.loading-container');
const loadingPercentageElement = document.querySelector('.loading-percentage');
const outerCircleElement = document.querySelector('.outer-circle'); // Get the outer circle
const textToType = "PLEASE WAIT FOR SETUP";
const typingSpeed = 100; // milliseconds per character
let timeLeft = 60;
let typingIndex = 0;
let progress = 0;
const progressSpeed = 30; // Reduced delay for faster loading (milliseconds per increment)
const redirectionDelay = 3000; // 3 seconds delay before redirecting

function typeText() {
    if (typingIndex < textToType.length) {
        typingTextElement.textContent = textToType.substring(0, typingIndex + 1);
        typingIndex++;
        setTimeout(typeText, typingSpeed);
    }
}

function updateCountdown() {
    countdownNumberElement.textContent = timeLeft;
    timeLeft--;
    if (timeLeft < 0) {
        clearInterval(countdownInterval);
        startLoadingAnimation();
    }
}

function startLoadingAnimation() {
    loadingContainer.classList.add('active');
    const progressInterval = setInterval(() => {
        progress++;
        loadingPercentageElement.textContent = `${progress}%`;
        if (outerCircleElement) { // Check if the element exists
            outerCircleElement.style.borderTopColor = `hsl(${progress * 3.6}, 100%, 50%)`; // Rainbow progress
        }
        if (progress >= 100) {
            clearInterval(progressInterval);
            // Add a 3-second delay before redirecting
            setTimeout(() => {
                window.location.href = 'main.html';
            }, redirectionDelay);
        }
    }, progressSpeed);
}

// Start typing animation
typeText();

// Start countdown
const countdownInterval = setInterval(updateCountdown, 1000);

// "kiba town" link is handled directly by the HTML `<a>` tag
