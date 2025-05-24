const typingTextElement = document.querySelector('.typing-animation');
const countdownNumberElement = document.querySelector('.countdown-number');
const loadingContainer = document.querySelector('.loading-container');
const loadingPercentageElement = document.querySelector('.loading-percentage');
const outerCircleElement = document.querySelector('.outer-circle'); // Get the outer circle
const textToType = "PLEASE WAIT FOR SETUP";
const typingSpeed = 100;
let timeLeft = 60;
let typingIndex = 0;
let progress = 0;
const progressSpeed = 30; 
const redirectionDelay = 3000; 
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
        if (outerCircleElement) { 
            outerCircleElement.style.borderTopColor = `hsl(${progress * 3.6}, 100%, 50%)`; // Rainbow progress
        }
        if (progress >= 100) {
            clearInterval(progressInterval);
            setTimeout(() => {
                window.location.href = '../../../Cobutech/Cobutechhtml/cobum.html';
            }, redirectionDelay);
        }
    }, progressSpeed);
}
typeText();
const countdownInterval = setInterval(updateCountdown, 1000);
