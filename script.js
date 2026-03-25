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

update();// ... (Önceki değişkenlerin devamı) ...

// Platformları Tanımlayalım
let platforms = [
    { x: 300, y: 250, width: 150, height: 20, type: 'metal' }, // Havada metal platform
    { x: 100, y: 150, width: 100, height: 20, type: 'metal' }, // Başka bir metal
    { x: 500, y: 300, width: 200, height: 20, type: 'wood' }   // Normal platform (etkilenmez)
];

function update() {
    // ... (Hareket ve Zıplama kodları aynı kalsın) ...

    // Mıknatıs Kuvveti Hesaplama
    platforms.forEach(plat => {
        if (plat.type === 'metal') {
            // Karakter ve platform arasındaki mesafe
            let dx = (plat.x + plat.width/2) - (player.x + player.width/2);
            let dy = (plat.y + plat.height/2) - (player.y + player.height/2);
            let distance = Math.sqrt(dx*dx + dy*dy);

            // Eğer mesafe 200 pikselden azsa mıknatıs çalışsın
            if (distance < 200) {
                let force = (200 - distance) / 1000; // Yaklaştıkça kuvvet artar

                if (player.magnetMode === 'attract') { // MAVİ: Çek
                    player.velX += dx * force;
                    player.velY += dy * force;
                } else if (player.magnetMode === 'repel') { // KIRMIZI: İt
                    player.velX -= dx * force;
                    player.velY -= dy * force;
                }
            }
        }

        // Klasik Platform Çarpışma Kontrolü (Basit Versiyon)
        if (player.x < plat.x + plat.width &&
            player.x + player.width > plat.x &&
            player.y + player.height > plat.y &&
            player.y < plat.y + plat.height) {
            
            // Üstten çarpma (Platformda durma)
            if (player.velY > 0 && player.y + player.height - player.velY <= plat.y) {
                player.y = plat.y - player.height;
                player.velY = 0;
                player.grounded = true;
                player.jumping = false;
            }
        }
    });

    // ... (Sınır kontrolleri ve çizim çağrısı) ...
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Platformları Çiz
    platforms.forEach(plat => {
        ctx.fillStyle = plat.type === 'metal' ? "#7f8c8d" : "#d35400"; // Gri metal, turuncu tahta
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        
        // Metal platformların etrafına "manyetik alan" çizgisi (isteğe bağlı)
        if (plat.type === 'metal') {
            ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
            ctx.beginPath();
            ctx.arc(plat.x + plat.width/2, plat.y + plat.height/2, 200, 0, Math.PI * 2);
            ctx.stroke();
        }
    });

    // Karakteri Çiz (Önceki draw kodunla aynı)
    // ... 
}
