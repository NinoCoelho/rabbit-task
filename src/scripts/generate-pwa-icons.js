import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0052cc"/>
  <text x="50%" y="50%" font-family="Arial" font-weight="bold" font-size="${size * 0.4}"
    fill="white" text-anchor="middle" dominant-baseline="middle">
    RT
  </text>
</svg>
`;

function saveIcon(size, filename) {
  const svg = svgTemplate(size);
  fs.writeFileSync(path.join(__dirname, '../../public', filename), svg);
  console.log(`Generated ${filename}`);
}

// Generate icons
saveIcon(192, 'pwa-192x192.svg');
saveIcon(512, 'pwa-512x512.svg');
saveIcon(32, 'favicon.svg');

console.log('Icon generation complete!'); 