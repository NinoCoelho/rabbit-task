const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0052cc';
  ctx.fillRect(0, 0, size, size);

  // Text
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('RT', size/2, size/2);

  return canvas;
}

function saveIcon(size, filename) {
  const canvas = generateIcon(size);
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(__dirname, '../public', filename), buffer);
}

// Generate icons
saveIcon(192, 'pwa-192x192.png');
saveIcon(512, 'pwa-512x512.png');
saveIcon(32, 'favicon.png'); 