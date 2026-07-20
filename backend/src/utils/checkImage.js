import fs from 'fs';

const logoPath = '../frontend/public/logo.png';
const buffer = fs.readFileSync(logoPath);

// PNG header check
if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
  // Width is at offset 16 (4 bytes)
  const width = buffer.readInt32BE(16);
  // Height is at offset 20 (4 bytes)
  const height = buffer.readInt32BE(20);
  console.log(`PNG Dimensions: ${width}x${height}`);
} else {
  console.log('Not a valid PNG file');
}
