const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Oyun Ayarları
const gravity = 0.5;
const friction = 0.8;

let player = {
    x: 100,
    y: 300,
    width: 30,
    height: 30,
    speed: 5,
    velX: 0,
    velY: 0,
    jumping: false,
    grounded: false,
    magnetMode: 'neutral' // 'attract' (mavi), 'repel' (kırmızı), 'neutral'
};

let keys = {};

// Klavye Dinleyicileri
window.addEventListener("keydown", (e) => { keys[e.code] = true; });
window.addEventListener("keyup", (e) => { keys[e.code] = false; });

function update() {
    // Sağa - Sola Hareket
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.velX < player.speed) player.velX++;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.velX > -player.speed) player.velX--;
    }

    // Zıplama
    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && !player.jumping && player.grounded) {
        player.jumping = true;
        player.grounded = false;
        player.velY = -player.speed * 2;
    }

    // Mıknatıs Modu Değiştirme
    if (keys['KeyQ']) player.magnetMode = 'attract'; // Mavi: Çekim
    if (keys['KeyE']) player.magnetMode = 'repel';   // Kırmızı: İtme
    if (keys['KeyR']) player.magnetMode = 'neutral'; // Reset

    // Fizik Uygulama
    player.velX *= friction;
    player.velY += gravity;

    // Eğer Mıknatıs "Attract" (Mavi) ise ve havadaysak yerçekimini azaltalım (Süzülme etkisi)
    if (player.magnetMode === 'attract' && !player.grounded) {
        player.velY -= 0.3; 
    }

    player.x += player.velX;
    player.y += player.velY;

    // Basit Yer Çarpışması
    if (player.y >= canvas.height - player.height) {
        player.y = canvas.height - player.height;
        player.jumping = false;
        player.grounded = true;
        player.velY = 0;
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Karakterin Rengi Moduna Göre Değişsin
    if (player.magnetMode === 'attract') ctx.fillStyle = "#3498db"; // Mavi
    else if (player.magnetMode === 'repel') ctx.fillStyle = "#e74c3c"; // Kırmızı
    else ctx.fillStyle = "#f1c40f"; // Sarı (Nötr)

    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Bilgi Metni
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Mod: " + player.magnetMode + " (Q: Mavi, E: Kırmızı, R: Reset)", 10, 20);
}

update();
