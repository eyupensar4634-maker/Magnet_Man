// ... (Önceki değişkenlerin devamı) ...

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
