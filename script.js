/* ==========================================================================
   1. СВЕЧЕНИЕ АВАТАРКИ
   ========================================================================== */
const avatarImg = document.getElementById('avatar-img');

if (avatarImg) {
    avatarImg.onerror = function () {
        this.onerror = null;
        this.src = 'https://picsum.photos/200';
    };

    function setAvatarGlowColor() {
        const sample = document.createElement('canvas');
        const ctx = sample.getContext('2d');
        sample.width = sample.height = 50;

        try {
            ctx.drawImage(avatarImg, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let r = 0;
            let g = 0;
            let b = 0;
            let count = 0;

            for (let i = 0; i < data.length; i += 4) {
                if (data[i] + data[i + 1] + data[i + 2] <= 60) continue;

                r += data[i];
                g += data[i + 1];
                b += data[i + 2];
                count++;
            }

            if (!count) return;

            document.documentElement.style.setProperty(
                '--avatar-glow',
                `rgba(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)}, 0.85)`
            );
        } catch (e) {}
    }

    if (avatarImg.complete) {
        setAvatarGlowColor();
    } else {
        avatarImg.addEventListener('load', setAvatarGlowColor, { once: true });
    }
}

/* ==========================================================================
   2. ИНТЕРАКТИВНЫЙ ФОН
   ========================================================================== */
const particleCanvas = document.getElementById('particle-canvas');

if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    const mouse = { x: null, y: null, radius: 130 };
    const particles = [];
    const colors = [
        'rgba(169, 112, 255, ',
        'rgba(0, 119, 255, ',
        'rgba(236, 72, 153, ',
        'rgba(255, 255, 255, '
    ];
    const particleCount = Math.min(Math.floor(window.innerWidth / 22), 50);
    let animationFrameId = null;

    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }

    window.addEventListener('mousemove', ({ clientX, clientY }) => {
        mouse.x = clientX;
        mouse.y = clientY;
    }, { passive: true });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * particleCanvas.width,
            y: Math.random() * particleCanvas.height,
            radius: Math.random() * 1.7 + 0.8,
            vx: (Math.random() - 0.5) * 0.45,
            vy: (Math.random() - 0.5) * 0.45,
            color: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.45 + 0.2
        });
    }

    function drawConnection(a, b, alpha, lineWidth) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(160, 168, 200, ${alpha})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }

    function animateParticles() {
        if (document.hidden) {
            animationFrameId = null;
            return;
        }

        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSq = dx * dx + dy * dy;

                if (distSq >= 10000) continue;

                const dist = Math.sqrt(distSq);
                drawConnection(p, p2, 0.1 * (1 - dist / 100), 0.55);
            }

            if (mouse.x === null) continue;

            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const distSq = dx * dx + dy * dy;

            if (distSq >= mouse.radius * mouse.radius) continue;

            const dist = Math.sqrt(distSq);

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * (1 - dist / mouse.radius)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(animateParticles);
    }

    function startParticleAnimation() {
        if (animationFrameId === null && !document.hidden) {
            animationFrameId = requestAnimationFrame(animateParticles);
        }
    }

    document.addEventListener('visibilitychange', startParticleAnimation);
    startParticleAnimation();
}

/* ==========================================================================
   3. LIVE СТАТУСЫ
   ========================================================================== */
const BACKEND_URL = 'https://stream-links-backend-1061508657324.europe-west1.run.app';
const LIVE_PLATFORMS = ['twitch', 'youtube', 'vk', 'kick', 'goodgame'];

function setPlatformStatus(platform, isOnline) {
    const button = document.getElementById(`btn-${platform}`);
    if (!button) return;

    const badge = button.querySelector('.live-badge');

    button.classList.add('btn-status-ready');
    button.classList.toggle('btn-live', isOnline);
    button.classList.toggle('btn-offline', !isOnline);

    if (badge) {
        badge.textContent = isOnline ? 'LIVE' : 'OFFLINE';
    }
}

async function checkStatuses() {
    if (document.hidden) return;

    try {
        const response = await fetch(`${BACKEND_URL}/status`);
        if (!response.ok) return;

        const data = await response.json();

        LIVE_PLATFORMS.forEach(platform => {
            setPlatformStatus(platform, data[platform] === 'online');
        });
    } catch (err) {
        console.error('Ошибка получения статусов:', err);
    }
}

checkStatuses();
setInterval(checkStatuses, 15000);

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) checkStatuses();
});

/* ==========================================================================
   4. ЭФФЕКТЫ ВНУТРИ КНОПОК
   ========================================================================== */
const EFFECT_GROUPS = {
    like: ['twitch', 'youtube', 'vk', 'kick', 'goodgame'],
    dollar: ['order', 'donatty', 'donationalerts', 'fetta', 'boosty', 'memes'],
    heart: ['telegram', 'discord']
};

const EFFECT_COUNT = 5;

const likeSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h4V9H1v12zm21-11h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L15.17 4 8.59 10.59C8.22 10.95 8 11.45 8 12v7c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1c0-.55-.45-1-1-1z"/></svg>';

const randomBetween = (min, max) => min + Math.random() * (max - min);

function createButtonEffect(button, type) {
    if (!button) return;

    button.querySelector('.button-symbol-fx')?.remove();

    const fx = document.createElement('div');
    fx.className = 'button-symbol-fx';
    fx.setAttribute('aria-hidden', 'true');
    button.prepend(fx);

    for (let i = 0; i < EFFECT_COUNT; i++) {
        const symbol = document.createElement('span');
        symbol.className = `button-fx-symbol ${type}`;

        if (type === 'like') {
            symbol.innerHTML = likeSvg;
            const size = randomBetween(13, 20);
            symbol.style.width = `${size}px`;
            symbol.style.height = `${size}px`;
        } else {
            symbol.textContent = type === 'heart' ? '♥' : '$';
            symbol.style.fontSize = `${
                type === 'heart'
                    ? randomBetween(15, 24)
                    : randomBetween(16, 26)
            }px`;
        }

        const leftSide = i < Math.ceil(EFFECT_COUNT / 2);

        symbol.style.left = leftSide
            ? `${randomBetween(3, 19)}%`
            : `${randomBetween(81, 95)}%`;

        symbol.style.animationDuration = `${randomBetween(5, 8.5)}s`;
        symbol.style.animationDelay = `${-randomBetween(0, 8)}s`;
        symbol.style.setProperty('--drift1', `${randomBetween(-7, 7)}px`);
        symbol.style.setProperty('--drift2', `${randomBetween(-8, 8)}px`);
        symbol.style.setProperty('--drift3', `${randomBetween(-7, 7)}px`);
        symbol.style.setProperty('--fx-opacity', randomBetween(0.22, 0.42).toFixed(3));

        fx.appendChild(symbol);
    }
}

Object.entries(EFFECT_GROUPS).forEach(([type, platforms]) => {
    platforms.forEach(platform => {
        createButtonEffect(document.getElementById(`btn-${platform}`), type);
    });
});

/* ==========================================================================
   5. СЕРДЕЧКИ ВОКРУГ АВАТАРКИ
   ========================================================================== */
const avatarContainer = document.querySelector('.avatar-container');

if (avatarContainer) {
    avatarContainer.querySelector('.avatar-heart-fx')?.remove();

    const fx = document.createElement('div');
    fx.className = 'avatar-heart-fx';
    fx.setAttribute('aria-hidden', 'true');
    avatarContainer.appendChild(fx);

    const colors = [
        '#ff4d8d',
        '#a970ff',
        '#22d3ee',
        '#facc15',
        '#53fc18',
        '#ff6b6b',
        '#60a5fa',
        '#ec4899'
    ];

    for (let i = 0; i < 10; i++) {
        const heart = document.createElement('span');
        const leftSide = i < 5;
        const direction = leftSide ? -1 : 1;

        heart.className = 'avatar-heart';
        heart.textContent = '♥';
        heart.style.fontSize = `${randomBetween(10, 18)}px`;

        heart.style.left = leftSide
            ? `${randomBetween(7, 23)}%`
            : `${randomBetween(77, 93)}%`;

        heart.style.animationDuration = `${randomBetween(4.8, 8.3)}s`;
        heart.style.animationDelay = `${-randomBetween(0, 8)}s`;

        heart.style.setProperty(
            '--heart-color',
            colors[Math.floor(Math.random() * colors.length)]
        );

        heart.style.setProperty(
            '--heart-opacity',
            randomBetween(0.3, 0.55).toFixed(3)
        );

        heart.style.setProperty(
            '--heart-drift1',
            `${direction * randomBetween(6, 18)}px`
        );

        heart.style.setProperty(
            '--heart-drift2',
            `${direction * randomBetween(10, 25)}px`
        );

        heart.style.setProperty(
            '--heart-drift3',
            `${direction * randomBetween(5, 18)}px`
        );

        fx.appendChild(heart);
    }
}

/* ==========================================================================
   6. ПЕРЕРИСОВКА ТЕКСТА ПОСЛЕ ИЗМЕНЕНИЯ МАСШТАБА
   ========================================================================== */
let zoomRepaintTimer;

function repaintButtonText() {
    document.querySelectorAll('.btn-text-group').forEach(textGroup => {
        textGroup.style.display = 'none';
        void textGroup.offsetHeight;
        textGroup.style.display = '';
    });
}

window.addEventListener('resize', () => {
    window.clearTimeout(zoomRepaintTimer);
    zoomRepaintTimer = window.setTimeout(repaintButtonText, 120);
});