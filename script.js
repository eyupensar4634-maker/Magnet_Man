const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 450;

// FİZİK AYARLARI
const gravity = 0.5;
const friction = 0.8;

let player = {
    x: 50,
    y: 350,
    width: 30,
    height: 30,
    velX: 0,
    velY: 0,
    speed: 5,
    jumpForce: -12,
    grounded: false,
    magnetMode: 'neutral' // 'attract' (Q), 'repel' (E), 'neutral' (R)
};

// PLATFORMLAR (Sadece Metal ve Normal Zemin)
let platforms = [
    { x: 0, y: 430, width: 800, height: 20, type: 'floor' },
    { x: 300, y: 280, width: 200, height: 20, type: 'metal' }, // Manyetik Platform
    { x: 100, y: 180, width: 150, height: 20, type: 'metal' }, // Manyetik Platform
    { x: 550, y: 150, width: 150, height: 20, type: 'normal' }
];

// TUŞ KONTROLLERİ
let keys = {};
window.onkeydown = (e) => { keys[e.code] = true; };
window.onkeyup = (e) => { keys[e.code] = false; };

function update() {
    // 1. Sağ-Sol Hareket
    if (keys['ArrowRight'] || keys['KeyD']) {
        if (player.velX < player.speed) player.velX++;
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        if (player.velX > -player.speed) player.velX--;
    }

    // 2. Zıplama
    if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && player.grounded) {
        player.velY = player.jumpForce;
        player.grounded = false;
    }

    // 3. Mıknatıs Modu Seçimi
    if (keys['KeyQ']) player.magnetMode = 'attract'; // Mavi
    if (keys['KeyE']) player.magnetMode = 'repel';   // Kırmızı
    if (keys['KeyR']) player.magnetMode = 'neutral'; // Sarı

    // 4. Fizik Uygulama
    player.velX *= friction;
    player.velY += gravity;
    player.grounded = false;

    // 5. Mıknatıs ve Platform Çarpışma Mantığı
    platforms.forEach(p => {
        if (p.type === 'metal') {
            // Platformun merkezi ile oyuncunun merkezi arasındaki mesafe
            let dx = (p.x + p.width / 2) - (player.x + player.width / 2);
            let dy = (p.y + p.height / 2) - (player.y + player.height / 2);
            let distance = Math.sqrt(dx * dx + dy * dy);

            // Eğer oyuncu platformun etki alanındaysa (250 piksel)
            if (distance < 250) {
                let force = (250 - distance) / 800; // Yaklaştıkça kuvvet artar
                
                if (player.magnetMode === 'attract') {
                    player.velX += dx * force; // Merkeze çek
                    player.velY += dy * force;
                } else if (player.magnetMode === 'repel') {
                    player.velX -= dx * force; // Merkezden it
                    player.velY -= dy * force;
                }
            }
        }

        // Klasik Üstten Basma Çarpışması
        if (player.x < p.x + p.width && 
            player.x + player.width > p.x &&
            player.y < p.y + p.height && 
            player.y + player.height > p.y) {
            
            if (player.velY > 0 && (player.y + player.height - player.velY) <= p.y) {
                player.y = p.y - player.height;
                player.velY = 0;
                player.grounded = true;
            }
        }
    });

    // 6. Konum Güncelleme
    player.x += player.velX;
    player.y += player.velY;

    // 7. Ekran Sınırları
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Platformları Çiz
    platforms.forEach(p => {
        ctx.fillStyle = p.type === 'metal' ? "#7f8c8d" : "#3e2723";
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Manyetik Alan Halkası (Görsel Yardımcı)
        if (p.type === 'metal') {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.beginPath();
            ctx.arc(p.x + p.width/2, p.y + p.height/2, 250, 0, Math.PI * 2);
            ctx.stroke();
        }
    });

    // Oyuncuyu Çiz
    let color = "#f1c40f"; // Nötr (Sarı)
    if (player.magnetMode === 'attract') color = "#3498db"; // Çekme (Mavi)
    if (player.magnetMode === 'repel') color = "#e74c3c";   // İtme (Kırmızı)
    
    ctx.fillStyle = color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Bilgi Metni
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Hareket: OK Tuşları | Q: Çek | E: İt | R: Normal", 10, 20);

    update();
    requestAnimationFrame(draw);
}

// Oyunu Başlat
draw();
