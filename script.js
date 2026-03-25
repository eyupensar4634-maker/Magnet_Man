const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Test için kırmızı bir kare (Senin karakterin)
    ctx.fillStyle = "red";
    ctx.fillRect(50, 50, 50, 50);

    requestAnimationFrame(draw);
}

draw();