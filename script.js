// Theme Toggle
function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    document.getElementById('theme-icon').innerText = newTheme === 'dark' ? '🌙' : '☀️';
}

// Sidebar Toggle
const sidebar = document.getElementById('sidebar');
if (window.innerWidth <= 768) { sidebar.classList.remove('open'); }
else { sidebar.classList.remove('collapsed'); }

function toggleMenu() {
    if (window.innerWidth <= 768) { sidebar.classList.toggle('open'); }
    else { sidebar.classList.toggle('collapsed'); }
}

// Funkenflug / Grill Embers Animation
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');
let embers = [];

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Ember {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 1.5;
        this.speedY = -(Math.random() * 2 + 0.5);
        this.opacity = Math.random();
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= 0.003;

        if (this.opacity <= 0 || this.y < 0) {
            this.y = canvas.height + 10;
            this.x = Math.random() * canvas.width;
            this.opacity = Math.random();
        }
    }
    draw() {
        const root = document.documentElement;
        const isDark = root.getAttribute('data-theme') === 'dark';
        // Orange/Rote Funken
        ctx.fillStyle = isDark ? `rgba(255, 87, 34, ${this.opacity})` : `rgba(230, 57, 70, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function createEmbers() {
    embers = [];
    for (let i = 0; i < 100; i++) {
        embers.push(new Ember());
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    embers.forEach(e => {
        e.update();
        e.draw();
    });
    requestAnimationFrame(animate);
}


// Schüttel-Easter-Egg
let shakeThreshold = 15; // Wie stark muss geschüttelt werden?
let lastX, lastY, lastZ;

window.addEventListener('devicemotion', (event) => {
    let acceleration = event.accelerationIncludingGravity;
    let x = acceleration.x;
    let y = acceleration.y;
    let z = acceleration.z;

    if (lastX && lastY && lastZ) {
        let delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
        if (delta > shakeThreshold) {
            // HIER PASSIERT DIE MAGIE
            triggerEasterEgg();
        }
    }
    lastX = x; lastY = y; lastZ = z;
});

function triggerEasterEgg() {
    const emoji = document.getElementById('confused-emoji');
    emoji.style.display = 'block';
    setTimeout(() => { emoji.style.display = 'none'; }, 5000); // 5 Sekunden
}

// Konfetti-Geste (zwei Finger nach oben wischen)
let touchStartY = 0;
document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) { touchStartY = e.touches[0].clientY; }
});

document.addEventListener('touchend', (e) => {
    if (e.changedTouches.length === 2) {
        let touchEndY = e.changedTouches[0].clientY;
        if (touchStartY - touchEndY > 100) { // Wenn mehr als 100px gewischt wurde
            triggerKonfetti();
        }
    }
});

function triggerKonfetti() {
    // Falls noch nicht vorhanden, lädt dies die Konfetti-Library
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js";
    script.onload = () => {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    };
    document.body.appendChild(script);
}

// 3D-Neigungs-Effekt für das Logo
window.addEventListener('deviceorientation', (event) => {
    const logo = document.getElementById('secret-logo');
    if (logo) {
        // gamma ist die Neigung links/rechts, beta ist vor/zurück
        let x = event.gamma; 
        let y = event.beta;
        // Wir begrenzen den Effekt, damit es nicht "ausflippt"
        logo.style.transform = `perspective(500px) rotateY(${x / 5}deg) rotateX(${-y / 5}deg)`;
    }
});

// Easter Egg Trigger: 5 Klicks auf das Logo
const secretLogo = document.getElementById('secret-logo');
let clickCount = 0;
let clickTimer;

if(secretLogo) {
    secretLogo.addEventListener('click', () => {
        clickCount++;
        clearTimeout(clickTimer);
        
        if (clickCount >= 5) {
            window.location.href = 'easteregg.html';
        }

        // Setzt den Zähler nach 1,5 Sekunden Pause wieder auf 0 zurück
        clickTimer = setTimeout(() => {
            clickCount = 0;
        }, 1500);
    });
}


window.addEventListener('resize', () => {
    initCanvas();
    createEmbers();
});

initCanvas();
createEmbers();
animate();
