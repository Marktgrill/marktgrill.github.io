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

window.addEventListener('resize', () => {
    initCanvas();
    createEmbers();
});

initCanvas();
createEmbers();
animate();