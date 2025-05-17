// Cobutechjs/cobu.js
const backgroundImage = document.querySelector('.background-image');
const appearanceDelay = 1000; // 2 seconds
const redirectionDelay = 3000; // 4 seconds

// Make the background image visible after the delay
setTimeout(() => {
    backgroundImage.classList.add('visible');
    // Redirect to inlet.html after a further delay
    setTimeout(() => {
        window.location.href = 'Cobutechhtml/inlet.html';
    }, redirectionDelay);
}, appearanceDelay);
