document.addEventListener('DOMContentLoaded', function() {
    const followMeButton = document.getElementById('followMeButton');
    const followChannelsButton = document.getElementById('followChannelsButton');
    const contactMeButton = document.getElementById('contactMeButton');
    const followMeSubButtons = document.getElementById('followMeSubButtons');
    const followChannelsSubButtons = document.getElementById('followChannelsSubButtons');
    const contactMeSubButtons = document.getElementById('contactMeSubButtons');
    followMeButton.addEventListener('click', function() {
        followMeSubButtons.classList.toggle('visible');
        followChannelsSubButtons.classList.remove('visible');
        contactMeSubButtons.classList.remove('visible');
    });
    followChannelsButton.addEventListener('click', function() {
        followChannelsSubButtons.classList.toggle('visible');
        followMeSubButtons.classList.remove('visible');
        contactMeSubButtons.classList.remove('visible');
    });
    contactMeButton.addEventListener('click', function() {
        contactMeSubButtons.classList.toggle('visible');
        followMeSubButtons.classList.remove('visible');
        followChannelsSubButtons.classList.remove('visible');
    });
    const canvas = document.getElementById('socialLogosCanvas'); // Reusing the canvas ID
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
    function drawCodeRain() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ff4d4d'; 
        ctx.font = fontSize + 'px monospace';
        for (let i = 0; i < drops.length; i++) {
            const text = letters[Math.floor(Math.random() * letters.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            drops[i]++;
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
                drops[i] = 0;
            }
        }
    }
    setInterval(drawCodeRain, 30);
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
});
