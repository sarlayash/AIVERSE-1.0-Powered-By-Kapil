// Simple node script to create crisp PNG icons using pure JS (uncompressed PNG encoder)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, drawFn) {
  // RGBA buffer
  const buffer = Buffer.alloc(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const color = drawFn(x, y, width, height);
      buffer[idx] = color.r;
      buffer[idx + 1] = color.g;
      buffer[idx + 2] = color.b;
      buffer[idx + 3] = color.a;
    }
  }

  // Build PNG with zlib
  // Scanlines with filter byte 0
  const scanlines = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y++) {
    scanlines[y * (width * 4 + 1)] = 0; // Filter none
    buffer.copy(scanlines, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(scanlines);

  // PNG header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    crcBuf.writeInt32BE(crc32(combined), 0);
    return Buffer.concat([len, combined, crcBuf]);
  }

  // CRC32 table
  function crc32(buf) {
    let c = -1;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xFF];
    }
    return (c ^ -1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const chunks = [
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', compressed),
    chunk('IEND', Buffer.alloc(0))
  ];

  return Buffer.concat(chunks);
}

// Generate CRC Table
const crcTable = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xEDB88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  crcTable[n] = c;
}

// Icon design: Glowing Cyber Neural Core with Agent Star
function drawIcon(x, y, w, h) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxR = w / 2;

  // Background rounded squircle / gradient
  if (dist > maxR - 4) {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  // Deep dark violet-blue background
  let r = 10 + Math.floor((x / w) * 20);
  let g = 14 + Math.floor((y / h) * 30);
  let b = 35 + Math.floor((dist / maxR) * 40);

  // Cyan & Magenta Neural Rings
  if (Math.abs(dist - maxR * 0.75) < 3 || Math.abs(dist - maxR * 0.45) < 3) {
    return { r: 0, g: 229, b: 255, a: 255 }; // Electric Cyan
  }

  // Center glowing brain / core diamond
  if (Math.abs(dx) + Math.abs(dy) < maxR * 0.35) {
    return { r: 255, g: 0, b: 128, a: 255 }; // Hot Magenta Core
  }

  // Star cross
  if ((Math.abs(dx) < 2 && Math.abs(dy) < maxR * 0.55) || (Math.abs(dy) < 2 && Math.abs(dx) < maxR * 0.55)) {
    return { r: 255, g: 215, b: 0, a: 255 }; // Gold Star Beam
  }

  // Corner highlights
  if (dist < maxR * 0.8) {
    r += 15;
    g += 20;
    b += 40;
  }

  return { r: Math.min(255, r), g: Math.min(255, g), b: Math.min(255, b), a: 255 };
}

// Create 192x192 and 512x512
const icon192 = createPng(192, 192, drawIcon);
const icon512 = createPng(512, 512, drawIcon);

const iconDir = path.join(__dirname, 'public', 'icons');
fs.writeFileSync(path.join(iconDir, 'icon-192.png'), icon192);
fs.writeFileSync(path.join(iconDir, 'icon-512.png'), icon512);
fs.writeFileSync(path.join(iconDir, 'favicon.ico'), icon192); // works for browser favicon

console.log('Icons generated successfully in public/icons/');
