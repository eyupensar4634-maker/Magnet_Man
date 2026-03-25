const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 450;

// OYUN AYARLARI
const gravity = 0.45;
const friction = 0.85;
let gameState = "playing"; // "playing", "win", "dead"

let player = {
    x: 50, y: 350, width: 30, height: 30,
    velX: 0, velY: 0,
    speed: 4, jumpForce: -11,
    grounded: false,
    magnetMode: 'neutral' // 'attract' (Q), 'repel' (E), 'neutral' (R)
};

// NESNELER (Platformlar, Dikenler, Hedef)
let platforms = [
    { x: 0, y: 430, width: 800, height: 20, type: 'floor' },
    { x: 250, y: 320, width: 150, height: 20, type: 'metal' },
    { x: 500, y: 220, width: 150, height: 20, type: 'metal' },
    { x: 100, y: 150, width: 120, height: 20, type: 'wood' }
];

let spikes = [
    { x: 420, y: 410, width: 30, height: 20 }
];

let goal = { x: 720, y: 380, width: 40, height: 50 };

let keys = {};
window.onkeydown = (e) => keys[e.code] = true;
window.onkeyup = (e) => keys[e.code] = false;

function update() {
    if (gameState !== "playing") return;

    // HAREKET VE ZIPLAMA
    if (keys['ArrowRight'] || keys['KeyD']) { if (player.velX < player.speed) player.velX++; }
    if (keys['ArrowLeft'] || keys['KeyA']) { if (player.velX > -player.speed) player.velX--; }
    if ((keys['Space'] || keys['KeyW']) && player.grounded) {
        player.velY = player.jumpForce;
        player.grounded = false;
    }

    // MOD DEĞİŞTİRME
    if (keys['KeyQ']) player.magnetMode = 'attract';
    if (keys['KeyE']) player.magnetMode = 'repel';
    if (keys['KeyR']) player.magnetMode = 'neutral';

    // FİZİK UYGULAMA
    player.velX *= friction;
    player.velY += gravity;
    player.grounded = false;

    // METAL ÇEKİM/İTME MANTIĞI
    platforms.forEach(p => {
        if (p.type === 'metal') {
            let dx = (p.x + p.width/2) - (player.x + player.width/2);
            let dy = (p.y + p.height/2) - (player.y + player.height/2);
            let dist = Math.sqrt(dx*dx + dy*dy);

            if (dist < 220) {
                let force = (220 - dist) / 800;
                if (player.magnetMode === 'attract') { player.velX += dx * force; player.velY += dy * force; }
                if (player.magnetMode === 'repel') { player.velX -= dx * force; player.velY -= dy * force; }
            }
        }

        // ÇARPIŞMA (Collision)
        if (player.x < p.x + p.width && player.x + player.width > p.x &&
            player.y < p.y + p.height && player.y + player.height > p.y) {
            // Üstten basma
            if (player.velY > 0 && (player.y + player.height - player.velY) <= p.y) {
                player.y = p.y - player.height;
                player.velY = 0;
                player.grounded = true;
            }
        }
    });

    // DİKEN KONTROLÜ
    spikes.forEach(s => {
        if (player.x < s.x + s.width && player.x + player.width > s.x &&
            player.y < s.y + s.height && player.y + player.height > s.y) {
            gameState = "dead";
        }
    });

    // HEDEF KONTROLÜ
    if (player.x < goal.x + goal.width && player.x + player.width > goal.x &&
        player.y < goal.y + goal.height && player.y + player.height > goal.y) {
        gameState = "win";
    }

    player.x += player.velX;
    player.y += player.velY;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // PLATFORMLARI ÇİZ
    platforms.forEach(p => {
        ctx.fillStyle = p.type === 'metal' ? "#7f8c8d" : "#3e2723";
        ctx.fillRect(p.x, p.y, p.width, p.height);
        if (p.type === 'metal') {
            ctx.strokeStyle = player.magnetMode === 'attract' ? "rgba(0,255,255,0.2)" : "rgba(255,0,0,0.1)";
            ctx.beginPath(); ctx.arc(p.x + p.width/2, p.y + p.height/2, 220, 0, Math.PI*2); ctx.stroke();
        }
    });

    // DİKENLERİ ÇİZ
    ctx.fillStyle = "#e74c3c";
    spikes.forEach(s => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y + s.height);
        ctx.lineTo(s.x + s.width/2, s.y);
        ctx.lineTo(s.x + s.width, s.y + s.height);
        ctx.fill();
    });

    // HEDEFİ ÇİZ (BAYRAK)
    ctx.fillStyle = "#2ecc71";
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);

    // KARAKTERİ ÇİZ
    ctx.fillStyle = player.magnetMode === 'attract' ? "#3498db" : (player.magnetMode === 'repel' ? "#e74c3c" : "#f1c40f");
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Gözler (Karakterin nereye baktığını hissettirir)
    ctx.fillStyle = "white";
    ctx.fillRect(player.x + 5, player.y + 5, 8, 8);
    ctx.fillRect(player.x + 17, player.y + 5, 8, 8);

    // OYUN DURUMU EKRANI
    if (gameState === "win") {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0,0,800,450);
        ctx.fillStyle = "white"; ctx.font = "40px Arial"; ctx.fillText("KAZANDIN!", 300, 225);
    } else if (gameState === "dead") {
        ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(0,0,800,450);
        ctx.fillStyle = "red"; ctx.font = "40px Arial"; ctx.fillText("ÖLDÜN! (F5 ile Yenile)", 250, 225);
    }

    update();
    requestAnimationFrame(draw);
}
draw();
