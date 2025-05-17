// Cobutechjs/cobuin.js
const typingTextElement = document.querySelector('.typing-animation');
const countdownNumberElement = document.querySelector('.countdown-number');
const progressCircle = document.querySelector('.progress-circle');
const textToType = "PLEASE WAIT FOR SETUP";
const typingSpeed = 100; // milliseconds per character
let timeLeft = 60;
let typingIndex = 0;
let progress = 0;
const progressSpeed = 50; // milliseconds per increment

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
        startProgressAnimation();
    }
}

function startProgressAnimation() {
    progressCircle.classList.add('active');
    const progressInterval = setInterval(() => {
        progress++;
        const outerCircle = document.querySelector('.outer-circle');
        outerCircle.style.borderTopColor = `hsl(${progress * 3.6}, 100%, 50%)`; // Rainbow progress
        if (progress >= 100) {
            clearInterval(progressInterval);
            window.location.href = 'Cobutechhtml/main.html';
        }
    }, progressSpeed);
}

// Start typing animation
typeText();

// Start countdown
const countdownInterval = setInterval(updateCountdown, 1000);

// "kiba town" link is handled directly by the HTML `<a>` tag
