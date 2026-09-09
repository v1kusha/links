/* ==========================================================================
   1. ДИНАМИЧЕСКИЙ ЦВЕТ СВЕЧЕНИЯ АВАТАРКИ
   ========================================================================== */
const img = document.getElementById('avatar-img');

if (img) {
    img.onerror = function() {
        this.onerror = null;
        this.src = 'https://picsum.photos/200';
    };

    function setAvatarGlowColor() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 50;
        canvas.height = 50;

        try {
            ctx.drawImage(img, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let r = 0, g = 0, b = 0, count = 0;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] + data[i + 1] + data[i + 2] > 60) {
                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }
            }

            if (count > 0) {
                r = Math.round(r / count);
                g = Math.round(g / count);
                b = Math.round(b / count);
                document.documentElement.style.setProperty('--avatar-glow', `rgba(${r}, ${g}, ${b}, 0.85)`);
            }
        } catch (e) {}
    }

    if (img.complete) {
        setAvatarGlowColor();
    } else {
        img.addEventListener('load', setAvatarGlowColor);
    }
}

/* ==========================================================================
   2. ИНТЕРАКТИВНЫЙ ФОН
   ========================================================================== */
const canvas = document.getElementById('particle-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');
    let mouse = { x: null, y: null, radius: 140 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    const particleCount = Math.min(Math.floor(window.innerWidth / 18), 65);
    const particles = [];
    const colors = [
        'rgba(169, 112, 255, ',
        'rgba(0, 119, 255, ',
        'rgba(236, 72, 153, ',
        'rgba(255, 255, 255, '
    ];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            baseAlpha: Math.random() * 0.5 + 0.25
        });
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p, index) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.baseAlpha + ')';
            ctx.fill();

            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 110) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(160, 168, 200, ${0.12 * (1 - dist / 110)})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < mouse.radius) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * (1 - dist / mouse.radius)})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animateParticles);
    }

    animateParticles();
}

/* ==========================================================================
   3. LIVE СТАТУСЫ
   ========================================================================== */
const BACKEND_URL = "https://stream-links-backend-1061508657324.europe-west1.run.app";

async function checkStatuses() {
    try {
        const response = await fetch(`${BACKEND_URL}/status`);
        if (!response.ok) return;

        const data = await response.json();
        const platforms = ['twitch', 'youtube', 'vk', 'kick', 'goodgame'];

        platforms.forEach(platform => {
            const btn = document.getElementById(`btn-${platform}`);

            if (btn) {
                if (data[platform] === "online") {
                    btn.classList.add("btn-live");
                } else {
                    btn.classList.remove("btn-live");
                }
            }
        });
    } catch (err) {
        console.error("Ошибка получения статусов:", err);
    }
}

checkStatuses();
setInterval(checkStatuses, 15000);

/* ==========================================================================
   4. АНИМАЦИИ ВНУТРИ КНОПОК
   ========================================================================== */
document.querySelector('.support-fx')?.remove();

const buttonEffects = [
    { id: 'btn-twitch', type: 'like', color: '#a970ff', count: 6 },
    { id: 'btn-youtube', type: 'like', color: '#ff2a2a', count: 6 },
    { id: 'btn-vk', type: 'like', color: '#0077ff', count: 6 },
    { id: 'btn-kick', type: 'like', color: '#53fc18', count: 6 },
    { id: 'btn-goodgame', type: 'like', color: '#4371a5', count: 6 },

    { id: 'btn-order', type: 'dollar', color: '#00f2fe', count: 7 },

    { id: 'btn-telegram', type: 'heart', color: '#24a1de', count: 7 },
    { id: 'btn-discord', type: 'heart', color: '#5865f2', count: 7 },

    { id: 'btn-donatty', type: 'dollar', color: '#a855f7', count: 7 },
    { id: 'btn-donationalerts', type: 'dollar', color: '#f59e0b', count: 7 },
    { id: 'btn-fetta', type: 'dollar', color: '#ec4899', count: 7 },
    { id: 'btn-boosty', type: 'dollar', color: '#f15f2c', count: 7 },
    { id: 'btn-memes', type: 'dollar', color: '#facc15', count: 7 }
];

const likeSvg = `
<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M1 21h4V9H1v12zm21-11h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L15.17 4 8.59 10.59C8.22 10.95 8 11.45 8 12v7c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1c0-.55-.45-1-1-1z"/>
</svg>`;

function createButtonEffect(config) {
    const button = document.getElementById(config.id);
    if (!button) return;

    const oldFx = button.querySelector('.button-symbol-fx');
    if (oldFx) oldFx.remove();

    const fx = document.createElement('div');
    fx.className = 'button-symbol-fx';
    fx.setAttribute('aria-hidden', 'true');
    button.prepend(fx);

    for (let i = 0; i < config.count; i++) {
        const symbol = document.createElement('span');
        symbol.className = `button-fx-symbol ${config.type}`;
        symbol.style.setProperty('--fx-color', config.color);

        if (config.type === 'like') {
            symbol.innerHTML = likeSvg;
            const size = 13 + Math.random() * 8;
            symbol.style.width = `${size}px`;
            symbol.style.height = `${size}px`;
        }

        if (config.type === 'heart') {
            symbol.textContent = '♥';
            symbol.style.fontSize = `${15 + Math.random() * 10}px`;
        }

        if (config.type === 'dollar') {
            symbol.textContent = '$';
            symbol.style.fontSize = `${16 + Math.random() * 11}px`;
        }

        const drift1 = -10 + Math.random() * 20;
        const drift2 = -12 + Math.random() * 24;
        const drift3 = -10 + Math.random() * 20;

        const leftSide = Math.random() < 0.5;

        if (leftSide) {
            symbol.style.left = `${3 + Math.random() * 17}%`;
        } else {
            symbol.style.left = `${80 + Math.random() * 15}%`;
        }

        symbol.style.animationDuration = `${4.5 + Math.random() * 4}s`;
        symbol.style.animationDelay = `${-Math.random() * 8}s`;
        symbol.style.setProperty('--drift1', `${drift1}px`);
        symbol.style.setProperty('--drift2', `${drift2}px`);
        symbol.style.setProperty('--drift3', `${drift3}px`);
        symbol.style.setProperty('--fx-opacity', `${0.24 + Math.random() * 0.24}`);

        fx.appendChild(symbol);
    }
}

buttonEffects.forEach(createButtonEffect);