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
    let mouse = { x: null, y: null, radius: 130 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    }, { passive: true });

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();

    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 50);
    const particles = [];
    const colors = ['rgba(169, 112, 255, ', 'rgba(0, 119, 255, ', 'rgba(236, 72, 153, ', 'rgba(255, 255, 255, '];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.7 + 0.8,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            color: colors[Math.floor(Math.random() * colors.length)],
            baseAlpha: Math.random() * 0.45 + 0.2
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
                const distSq = dx * dx + dy * dy;

                if (distSq < 10000) {
                    const dist = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(160, 168, 200, ${0.1 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.55;
                    ctx.stroke();
                }
            }

            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < mouse.radius * mouse.radius) {
                    const dist = Math.sqrt(distSq);
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - dist / mouse.radius)})`;
                    ctx.lineWidth = 0.7;
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
    { id: 'btn-twitch', type: 'like', color: '#a970ff', count: 5 },
    { id: 'btn-youtube', type: 'like', color: '#ff2a2a', count: 5 },
    { id: 'btn-vk', type: 'like', color: '#0077ff', count: 5 },
    { id: 'btn-kick', type: 'like', color: '#53fc18', count: 5 },
    { id: 'btn-goodgame', type: 'like', color: '#4371a5', count: 5 },
    { id: 'btn-order', type: 'dollar', color: '#00f2fe', count: 5 },
    { id: 'btn-telegram', type: 'heart', color: '#24a1de', count: 5 },
    { id: 'btn-discord', type: 'heart', color: '#5865f2', count: 5 },
    { id: 'btn-donatty', type: 'dollar', color: '#a855f7', count: 5 },
    { id: 'btn-donationalerts', type: 'dollar', color: '#f59e0b', count: 5 },
    { id: 'btn-fetta', type: 'dollar', color: '#ec4899', count: 5 },
    { id: 'btn-boosty', type: 'dollar', color: '#f15f2c', count: 5 },
    { id: 'btn-memes', type: 'dollar', color: '#facc15', count: 5 }
];

const likeSvg = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h4V9H1v12zm21-11h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L15.17 4 8.59 10.59C8.22 10.95 8 11.45 8 12v7c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1c0-.55-.45-1-1-1z"/></svg>`;

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
            const size = 13 + Math.random() * 7;
            symbol.style.width = `${size}px`;
            symbol.style.height = `${size}px`;
        }

        if (config.type === 'heart') {
            symbol.textContent = '♥';
            symbol.style.fontSize = `${15 + Math.random() * 9}px`;
        }

        if (config.type === 'dollar') {
            symbol.textContent = '$';
            symbol.style.fontSize = `${16 + Math.random() * 10}px`;
        }

        const drift1 = -7 + Math.random() * 14;
        const drift2 = -8 + Math.random() * 16;
        const drift3 = -7 + Math.random() * 14;
        const leftSide = i < Math.ceil(config.count / 2);

        symbol.style.left = leftSide ? `${3 + Math.random() * 16}%` : `${81 + Math.random() * 14}%`;
        symbol.style.animationDuration = `${5 + Math.random() * 3.5}s`;
        symbol.style.animationDelay = `${-Math.random() * 8}s`;
        symbol.style.setProperty('--drift1', `${drift1}px`);
        symbol.style.setProperty('--drift2', `${drift2}px`);
        symbol.style.setProperty('--drift3', `${drift3}px`);
        symbol.style.setProperty('--fx-opacity', `${0.22 + Math.random() * 0.2}`);

        fx.appendChild(symbol);
    }
}

buttonEffects.forEach(createButtonEffect);

/* ==========================================================================
   5. РАЗНОЦВЕТНЫЕ СЕРДЕЧКИ ВОКРУГ АВАТАРКИ
   ========================================================================== */
const avatarContainer = document.querySelector('.avatar-container');

if (avatarContainer) {
    const oldAvatarFx = avatarContainer.querySelector('.avatar-heart-fx');
    if (oldAvatarFx) oldAvatarFx.remove();

    const avatarFx = document.createElement('div');
    avatarFx.className = 'avatar-heart-fx';
    avatarFx.setAttribute('aria-hidden', 'true');
    avatarContainer.appendChild(avatarFx);

    const heartColors = ['#ff4d8d', '#a970ff', '#22d3ee', '#facc15', '#53fc18', '#ff6b6b', '#60a5fa', '#ec4899'];

    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('span');
        const leftSide = i < 5;
        const drift1 = leftSide ? -6 - Math.random() * 12 : 6 + Math.random() * 12;
        const drift2 = leftSide ? -10 - Math.random() * 15 : 10 + Math.random() * 15;
        const drift3 = leftSide ? -5 - Math.random() * 13 : 5 + Math.random() * 13;

        heart.className = 'avatar-heart';
        heart.textContent = '♥';
        heart.style.fontSize = `${10 + Math.random() * 8}px`;
        heart.style.left = leftSide ? `${7 + Math.random() * 16}%` : `${77 + Math.random() * 16}%`;
        heart.style.animationDuration = `${4.8 + Math.random() * 3.5}s`;
        heart.style.animationDelay = `${-Math.random() * 8}s`;
        heart.style.setProperty('--heart-color', heartColors[Math.floor(Math.random() * heartColors.length)]);
        heart.style.setProperty('--heart-opacity', `${0.3 + Math.random() * 0.25}`);
        heart.style.setProperty('--heart-drift1', `${drift1}px`);
        heart.style.setProperty('--heart-drift2', `${drift2}px`);
        heart.style.setProperty('--heart-drift3', `${drift3}px`);

        avatarFx.appendChild(heart);
    }
}