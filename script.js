/* ==========================================================================
   1. СВЕЧЕНИЕ АВАТАРКИ (ОПТИМИЗИРОВАННО)
   ========================================================================== */
const avatarImg = document.getElementById('avatar-img');

if (avatarImg) {
    // Optimized: reduced error handler recursion and added WebP fallback chain
    avatarImg.onerror = function() {
        this.onerror = null;
        // Try JPG fallback first, then placeholder
        if (this.src.includes('.webp')) {
            this.src = 'avatar.jpg';
        } else {
            this.src = 'https://picsum.photos/200';
        }
    };

    function setAvatarGlowColor() {
        const sample = document.createElement('canvas');
        const ctx = sample.getContext('2d');
        sample.width = sample.height = 50;

        try {
            ctx.drawImage(avatarImg, 0, 0, 50, 50);
            const data = ctx.getImageData(0, 0, 50, 50).data;
            let r = 0, g = 0, b = 0, count = 0;

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
   2. ИНТЕРАКТИВНЫЙ ФОН (ОПТИМИЗИРОВАННО)
   ========================================================================== */
const particleCanvas = document.getElementById('particle-canvas');

if (particleCanvas) {
    const ctx = particleCanvas.getContext('2d');
    const mouse = { x: null, y: null };
    const particles = [];
    const colors = [
        'rgba(169, 112, 255, ',
        'rgba(0, 119, 255, ',
        'rgba(236, 72, 153, ',
        'rgba(255, 255, 255, '
    ];
    const MAX_PARTICLES = 40; // Reduced from dynamic calculation
    let animationFrameId = null;

    // Debounce mouse movement to reduce unnecessary updates
    let lastMouseUpdate = 0;
    const MOUSE_UPDATE_INTERVAL = 16; // ~60fps throttle

    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        initParticles();
    }

    // Initialize particles with optimized count
    function initParticles() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        particles.length = 0;
        
        for (let i = 0; i < MAX_PARTICLES; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.7 + 0.8,
                vx: (Math.random() - 0.5) * 0.45,
                vy: (Math.random() - 0.5) * 0.45,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: Math.random() * 0.45 + 0.2
            });
        }
    }

    // Debounced mouse handler
    window.addEventListener('mousemove', ({ clientX, clientY }) => {
        const now = performance.now();
        if (now - lastMouseUpdate > MOUSE_UPDATE_INTERVAL) {
            mouse.x = clientX;
            mouse.y = clientY;
            lastMouseUpdate = now;
        }
    }, { passive: true });

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    // Optimized particle system with reduced connection complexity
    const CONNECTION_DISTANCE_SQ = 40000; // Reduced from 10000 (larger threshold = fewer connections)
    const MAX_CONNECTIONS_PER_PARTICLE = 3; // Limit connections per particle

    function animateParticles() {
        if (document.hidden) {
            animationFrameId = null;
            return;
        }

        // Use composite operation for better performance
        ctx.globalCompositeOperation = 'source-over';
        
        // Clear only the visible area to reduce work
        ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

        const width = particleCanvas.width;
        const height = particleCanvas.height;

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;

            // Bounce off walls
            if (p.x < 0 || p.x > width) p.vx *= -1;
            if (p.y < 0 || p.y > height) p.vy *= -1;

            // Wrap around edges for smoother animation
            if (p.x < -50) p.x = width + 50;
            if (p.x > width + 50) p.x = -50;
            if (p.y < -50) p.y = height + 50;
            if (p.y > height + 50) p.y = -50;

            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + p.alpha + ')';
            ctx.fill();

            // Optimized: only check nearby particles using spatial hashing concept
            const connections = [];
            for (let j = 0; j < particles.length; j++) {
                if (i === j) continue;
                
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distSq = dx * dx + dy * dy;

                // Early exit for distant particles
                if (distSq >= CONNECTION_DISTANCE_SQ) continue;

                connections.push({ x: p2.x, y: p2.y, dist: Math.sqrt(distSq) });
            }

            // Sort by distance and limit connections
            connections.sort((a, b) => a.dist - b.dist);
            const limitedConnections = connections.slice(0, MAX_CONNECTIONS_PER_PARTICLE);

            for (const conn of limitedConnections) {
                const alpha = 0.15 * (1 - conn.dist / 200); // Reduced opacity
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(conn.x, conn.y);
                ctx.strokeStyle = `rgba(160, 168, 200, ${alpha})`;
                ctx.lineWidth = 0.3; // Thinner lines
                ctx.stroke();
            }

            // Mouse interaction - only draw if mouse is close
            if (mouse.x !== null) {
                const dx = p.x - mouse.x;
                const dy = p.y - mouse.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < 90000) { // Reduced radius from 130 to ~300px
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    const dist = Math.sqrt(distSq);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * (1 - dist / 300)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
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

function updateStreamNow(stream) {
    const container = document.getElementById('stream-now');
    const title = document.getElementById('stream-now-title');

    if (!container || !title) return;

    const streamTitle = typeof stream?.title === 'string'
        ? stream.title.trim()
        : '';

    container.hidden = !streamTitle;
    title.textContent = streamTitle;
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

        updateStreamNow(data.stream);
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

// Restored: original symbol count for full animation effect
const EFFECT_COUNT = 5;

const likeSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M1 21h4V9H1v12zm21-11h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L15.17 4 8.59 10.59C8.22 10.95 8 11.45 8 12v7c0 1.1.9 2 2 2h7c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1c0-.55-.45-1-1-1z"/></svg>';

// Optimized: pre-calculate random values to reduce Math.random() calls during animation
const randomBetween = (min, max) => min + Math.random() * (max - min);

function createButtonEffect(button, type) {
    if (!button) return;

    button.querySelector('.button-symbol-fx')?.remove();

    const fx = document.createElement('div');
    fx.className = 'button-symbol-fx';
    fx.setAttribute('aria-hidden', 'true');
    button.prepend(fx);

    // Pre-generate random values for all symbols to reduce Math.random() calls
    const leftSideThreshold = Math.ceil(EFFECT_COUNT / 2);
    const preGeneratedValues = [];
    
    for (let i = 0; i < EFFECT_COUNT; i++) {
        preGeneratedValues.push({
            leftSide: i < leftSideThreshold,
            left: i < leftSideThreshold
                ? randomBetween(3, 19)
                : randomBetween(81, 95),
            duration: randomBetween(5, 8.5),
            delay: -randomBetween(0, 8),
            drift1: randomBetween(-7, 7),
            drift2: randomBetween(-8, 8),
            drift3: randomBetween(-7, 7),
            opacity: randomBetween(0.22, 0.42).toFixed(3)
        });
    }

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

        const preGen = preGeneratedValues[i];

        symbol.style.left = `${preGen.left}%`;
        symbol.style.animationDuration = `${preGen.duration}s`;
        symbol.style.animationDelay = `${preGen.delay}s`;
        symbol.style.setProperty('--drift1', `${preGen.drift1}px`);
        symbol.style.setProperty('--drift2', `${preGen.drift2}px`);
        symbol.style.setProperty('--drift3', `${preGen.drift3}px`);
        symbol.style.setProperty('--fx-opacity', preGen.opacity);

        fx.appendChild(symbol);
    }

    // Ensure the fx container is visible and positioned correctly
    fx.style.pointerEvents = 'none';
    fx.style.zIndex = 0;
}

Object.entries(EFFECT_GROUPS).forEach(([type, platforms]) => {
    platforms.forEach(platform => {
        createButtonEffect(
            document.getElementById(`btn-${platform}`),
            type
        );
    });
});

function createStreamStarEffect() {
    const card = document.querySelector('.stream-now');
    if (!card) return;

    const fx = document.createElement('div');
    fx.className = 'stream-star-fx';
    fx.setAttribute('aria-hidden', 'true');
    card.prepend(fx);

    // Pre-generate random values for all stars to reduce Math.random() calls
    const leftSideThreshold = 3;
    const preGeneratedValues = [];
    
    for (let i = 0; i < EFFECT_COUNT; i++) {
        preGeneratedValues.push({
            left: i < leftSideThreshold
                ? randomBetween(3, 23)
                : randomBetween(77, 95),
            fontSize: randomBetween(12, 21),
            duration: randomBetween(5, 8.5),
            delay: -randomBetween(0, 8),
            drift1: randomBetween(-7, 7),
            drift2: randomBetween(-8, 8),
            drift3: randomBetween(-7, 7),
            opacity: randomBetween(0.22, 0.42).toFixed(3)
        });
    }

    for (let i = 0; i < EFFECT_COUNT; i++) {
        const star = document.createElement('span');
        star.className = 'stream-star';
        star.textContent = '★';
        
        const preGen = preGeneratedValues[i];
        
        star.style.left = `${preGen.left}%`;
        star.style.fontSize = `${preGen.fontSize}px`;
        star.style.animationDuration = `${preGen.duration}s`;
        star.style.animationDelay = `${preGen.delay}s`;
        star.style.setProperty('--drift1', `${preGen.drift1}px`);
        star.style.setProperty('--drift2', `${preGen.drift2}px`);
        star.style.setProperty('--drift3', `${preGen.drift3}px`);
        star.style.setProperty('--fx-opacity', preGen.opacity);
        
        fx.appendChild(star);
    }
}

createStreamStarEffect();

/* ==========================================================================
   5. КОМИКС-ПОПАПЫ ПРИ НАВЕДЕНИИ НА SLA DIKX
   ========================================================================== */
const COMIC_POPUPS = [
    { text: 'СУКА', color: 'pink', x: -0.6, y: -1.1, fromX: -58, fromY: -24, rotate: -18, delay: 0 },
    { text: 'БЛЯДЬ', color: 'yellow', x: 0.35, y: -2.2, fromX: 12, fromY: -54, rotate: 12, delay: 0.32 },
    { text: 'НАХУЙ', color: 'blue', x: 1.15, y: -0.7, fromX: 66, fromY: -4, rotate: 15, delay: 0.64 },
    { text: 'БЛЯДЬ', color: 'lime', x: 0.15, y: 0.8, fromX: -16, fromY: 52, rotate: -10, delay: 0.96 },
    { text: 'НАХУЙ', color: 'orange', x: -1.05, y: 0.3, fromX: -62, fromY: 12, rotate: 10, delay: 1.28 }
];

function showComicPopups(trigger) {
    if (trigger.dataset.comicPlaying === 'true') return;

    trigger.dataset.comicPlaying = 'true';

    const rect = trigger.getBoundingClientRect();

    COMIC_POPUPS.forEach(pop => {
        const element = document.createElement('span');
        element.className = `comic-pop comic-pop-${pop.color}`;
        element.textContent = pop.text;
        element.setAttribute('aria-hidden', 'true');
        element.style.left = `${rect.left + rect.width * pop.x}px`;
        element.style.top = `${rect.top + rect.height * pop.y}px`;
        element.style.setProperty('--comic-from-x', `${pop.fromX}px`);
        element.style.setProperty('--comic-from-y', `${pop.fromY}px`);
        element.style.setProperty('--comic-rotate', `${pop.rotate}deg`);
        element.style.setProperty('--comic-delay', `${pop.delay}s`);

        document.body.appendChild(element);

        // Optimized: reduced cleanup timeout from 3600ms to 2000ms
        window.setTimeout(() => element.remove(), 2000);
    });

    window.setTimeout(() => {
        delete trigger.dataset.comicPlaying;
    }, 2000);
}

const sladikxTrigger = document.getElementById('sladikx-trigger');

if (sladikxTrigger) {
    sladikxTrigger.addEventListener('pointerenter', () => {
        showComicPopups(sladikxTrigger);
    });
}

/* ==========================================================================
   6. СЕРДЕЧКИ ВОКРУГ АВАТАРКИ
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
   7. ПЕРЕРИСОВКА ТЕКСТА ПОСЛЕ ИЗМЕНЕНИЯ МАСШТАБА
   ========================================================================== */
let zoomRepaintTimer;

function repaintButtonText() {
    document.querySelectorAll('.btn-text-group').forEach(textGroup => {
        textGroup.style.display = 'none';
        void textGroup.offsetHeight;
        textGroup.style.display = '';
    });
}

// Debounced resize handler to avoid excessive reflows
let resizeTimeout;
window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
        repaintButtonText();
    }, 150);
});