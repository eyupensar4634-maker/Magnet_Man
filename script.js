/** * MAGNET-MAN: PRO VERSION 
 * Mekanik: Gelişmiş Kamera, Parçacık Sistemi ve Fizik Motoru
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 450;

// --- AYARLAR ---
const GRAVITY = 0.5;
const FRICTION = 0.85;
const MAGNET_RANGE = 250;
const MAGNET_FORCE = 0.0012;

// --- OYUN NESNELERİ ---
let particles = [];
let keys = {};

class Camera {
    constructor() {
        this.x = 0;
        this.y = 0;
    }
    follow(target) {
        this.x += (target.x - canvas.width / 2 - this.x) * 0.1;
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2;
        this.speedX = (Math.random() - 0.5) * 5;
        this.speedY = (Math.random() - 0.5) * 5;
        this.color = color;
        this.life = 1.0;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
    }
    draw(camX) {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x - camX, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

const player = {
    x: 100, y: 300,
    width: 32, height: 32,
    velX: 0, velY: 0,
    speed: 5, jumpForce: -12,
    grounded: false,
    magnetMode: 'neutral', // 'attract', 'repel', 'neutral'
    angle: 0,
    stretch: 1 // Animasyon için
};

const levels = [
    { x: 0, y: 430, w: 2000, h: 40, type: 'floor' },
    { x: 400, y: 300, w: 200, h: 30, type: 'metal' },
    { x: 750, y: 200, w: 200, h: 30, type: 'metal' },
    { x: 1100, y: 320, w: 300, h: 30, type: 'wood' },
    { x: 1500, y: 250, w: 150, h: 30, type: 'metal' }
];

const camera = new Camera();

// --- KONTROLLER ---
window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

// --- FİZİK VE MANTIK ---
function update() {
    // Giriş Kontrolü
    if (keys['ArrowRight'] || keys['KeyD']) { if (player.velX < player.speed) player.velX++; }
    if (keys['ArrowLeft'] || keys['KeyA']) { if (player.velX > -player.speed) player.velX--; }
    if ((keys['Space'] || keys['ArrowUp']) && player.grounded) {
        player.velY = player.jumpForce;
        player.grounded = false;
        player.stretch = 1.5; // Zıplama esnemesi
        createParticles(player.x + 16, player.y + 32, "#fff", 10);
    }

    // Mıknatıs Modu
    if (keys['KeyQ']) player.magnetMode = 'attract';
    if (keys['KeyE']) player.magnetMode = 'repel';
    if (keys['KeyR']) player.magnetMode = 'neutral';

    // Fizik Uygula
    player.velX *= FRICTION;
    player.velY += GRAVITY;
    player.grounded = false;

    // Metal Etkileşimi
    levels.forEach(p => {
        if (p.type === 'metal') {
            let dx = (p.x + p.w / 2) - (player.x + 16);
            let dy = (p.y + p.h / 2) - (player.y + 16);
            let dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MAGNET_RANGE) {
                let f = (MAGNET_RANGE - dist) * MAGNET_FORCE;
                let color = "#fff";
                if (player.magnetMode === 'attract') {
                    player.velX += dx * f; player.velY += dy * f;
                    color = "#3498db";
                } else if (player.magnetMode === 'repel') {
                    player.velX -= dx * f; player.velY -= dy * f;
                    color = "#e74c3c";
                }
                if (player.magnetMode !== 'neutral' && Math.random() > 0.8) 
                    particles.push(new Particle(player.x + 16, player.y + 16, color));
            }
        }

        // Gelişmiş Çarpışma (AABB)
        let pMidX = p.x + p.w / 2;
        let pMidY = p.y + p.h / 2;
        let pX = player.x + 16;
        let pY = player.y + 16;

        if (Math.abs(pX - pMidX) < (player.width / 2 + p.w / 2) &&
            Math.abs(pY - pMidY) < (player.height / 2 + p.h / 2)) {
            
            let oX = (player.width / 2 + p.w / 2) - Math.abs(pX - pMidX);
            let oY = (player.height / 2 + p.h / 2) - Math.abs(pY - pMidY);

            if (oX >= oY) {
                if (pY > pMidY) { // Alttan çarpma
                    player.y += oY; player.velY = 0;
                } else { // Üstten basma
                    player.y -= oY; player.velY = 0; player.grounded = true;
                }
            } else {
                player.x += (pX > pMidX) ? oX : -oX; player.velX = 0;
            }
        }
    });

    player.x += player.velX;
    player.y += player.velY;
    player.stretch += (1 - player.stretch) * 0.1; // Normal boyuta dön

    camera.follow(player);
    
    // Parçacık Güncelleme
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => p.update());
}

// --- ÇİZİM ---
function draw() {
    ctx.fillStyle = "#111"; // Koyu arka plan
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    // Izgara Arka Plan (Derinlik hissi için)
    ctx.strokeStyle = "#222";
    for(let i=0; i<2000; i+=50) { ctx.beginPath(); ctx.moveTo(i - camera.x, 0); ctx.lineTo(i - camera.x, 450); ctx.stroke(); }

    // Platformları Çiz
    levels.forEach(p => {
        let grad = ctx.createLinearGradient(p.x - camera.x, p.y, p.x - camera.x, p.y + p.h);
        if (p.type === 'metal') {
            grad.addColorStop(0, "#95a5a6"); grad.addColorStop(1, "#2c3e50");
            // Manyetik Parıltı
            if (player.magnetMode !== 'neutral') {
                ctx.shadowBlur = 15; ctx.shadowColor = player.magnetMode === 'attract' ? "#3498db" : "#e74c3c";
            }
        } else {
            grad.addColorStop(0, "#d35400"); grad.addColorStop(1, "#3e2723");
        }
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - camera.x, p.y, p.w, p.h);
        ctx.shadowBlur = 0;
    });

    // Parçacıklar
    particles.forEach(p => p.draw(camera.x));

    // Oyuncuyu Çiz
    let pColor = player.magnetMode === 'attract' ? "#3498db" : (player.magnetMode === 'repel' ? "#e74c3c" : "#f1c40f");
    ctx.fillStyle = pColor;
    ctx.shadowBlur = 10; ctx.shadowColor = pColor;
    
    // Squash & Stretch Çizimi
    let drawH = player.height * player.stretch;
    let drawW = player.width / player.stretch;
    ctx.fillRect(player.x - camera.x + (player.width - drawW)/2, player.y + (player.height - drawH), drawW, drawH);
    
    // Gözler (Bakış yönüne göre)
    ctx.fillStyle = "white";
    let eyeOffset = player.velX * 2;
    ctx.fillRect(player.x - camera.x + 8 + eyeOffset, player.y + 8, 6, 6);
    ctx.fillRect(player.x - camera.x + 20 + eyeOffset, player.y + 8, 6, 6);

    ctx.restore();

    // UI
    ctx.fillStyle = "white"; ctx.font = "16px monospace";
    ctx.fillText(`MODE: ${player.magnetMode.toUpperCase()}`, 20, 30);
    ctx.fillText("Q: ATTRACT | E: REPEL | R: NEUTRAL", 20, 50);

    update();
    requestAnimationFrame(draw);
}

function createParticles(x, y, color, count) {
    for(let i=0; i<count; i++) particles.push(new Particle(x, y, color));
}

draw();
