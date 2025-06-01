const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

// Create placeholder clothing images
const clothingItems = [
  { name: 'tshirt', color: '#4285f4', shape: 'tshirt' },
  { name: 'hoodie', color: '#34a853', shape: 'hoodie' },
  { name: 'jacket', color: '#ea4335', shape: 'jacket' },
  { name: 'polo', color: '#fbbc04', shape: 'polo' }
];

function drawTShirt(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  // Body
  ctx.moveTo(100, 150);
  ctx.lineTo(100, 400);
  ctx.lineTo(412, 400);
  ctx.lineTo(412, 150);
  // Neckline
  ctx.lineTo(350, 150);
  ctx.quadraticCurveTo(256, 100, 162, 150);
  ctx.closePath();
  ctx.fill();
  
  // Sleeves
  ctx.beginPath();
  ctx.moveTo(100, 150);
  ctx.lineTo(50, 200);
  ctx.lineTo(50, 280);
  ctx.lineTo(100, 250);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(412, 150);
  ctx.lineTo(462, 200);
  ctx.lineTo(462, 280);
  ctx.lineTo(412, 250);
  ctx.closePath();
  ctx.fill();
}

function drawHoodie(ctx, color) {
  ctx.fillStyle = color;
  // Main body
  ctx.fillRect(100, 150, 312, 300);
  
  // Hood
  ctx.beginPath();
  ctx.arc(256, 150, 100, Math.PI, 0);
  ctx.closePath();
  ctx.fill();
  
  // Pocket
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(180, 350, 152, 60);
}

function drawJacket(ctx, color) {
  ctx.fillStyle = color;
  // Main body
  ctx.fillRect(100, 150, 312, 350);
  
  // Collar
  ctx.beginPath();
  ctx.moveTo(100, 150);
  ctx.lineTo(150, 100);
  ctx.lineTo(362, 100);
  ctx.lineTo(412, 150);
  ctx.closePath();
  ctx.fill();
  
  // Zipper line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(256, 150);
  ctx.lineTo(256, 500);
  ctx.stroke();
}

function drawPolo(ctx, color) {
  ctx.fillStyle = color;
  // Body
  ctx.fillRect(100, 180, 312, 270);
  
  // Collar
  ctx.beginPath();
  ctx.moveTo(150, 180);
  ctx.lineTo(150, 120);
  ctx.lineTo(362, 120);
  ctx.lineTo(362, 180);
  ctx.closePath();
  ctx.fill();
  
  // Buttons
  ctx.fillStyle = 'white';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(256, 200 + i * 40, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'demo-clothing');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate images
clothingItems.forEach(item => {
  const canvas = createCanvas(512, 768);
  const ctx = canvas.getContext('2d');
  
  // Clear canvas with transparency
  ctx.clearRect(0, 0, 512, 768);
  
  // Draw clothing item
  switch (item.shape) {
    case 'tshirt':
      drawTShirt(ctx, item.color);
      break;
    case 'hoodie':
      drawHoodie(ctx, item.color);
      break;
    case 'jacket':
      drawJacket(ctx, item.color);
      break;
    case 'polo':
      drawPolo(ctx, item.color);
      break;
  }
  
  // Save as PNG
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(outputDir, `${item.name}.png`), buffer);
  console.log(`Created ${item.name}.png`);
});

console.log('All demo clothing images created successfully!');