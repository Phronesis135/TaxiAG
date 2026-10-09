// Generates PWA PNGs with zero dependencies (pure JS + node:zlib).
// Run: npm run gen-icons --workspace @taxiag/web
// Design: full-bleed espresso square, cream "T" built from two bars,
// amber dot — geometric so it rasterizes without fonts, maskable-safe.
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ESPRESSO = [28, 22, 17, 255];
const CREAM = [243, 234, 217, 255];
const AMBER = [240, 180, 92, 255];

// CRC32 (standard table algorithm).
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(bytes) {
  let c = -1;
  for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function toPng(size, pixels) {
  const stride = size * 4;
  const out = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) {
    out[y * (stride + 1)] = 0;
    pixels.copy(out, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(out)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const s = size / 512; // scale from 512 master geometry
  const px = Buffer.alloc(size * size * 4);
  const bar = (x0, y0, x1, y1, [r, g, b, a]) => {
    for (let y = Math.max(0, Math.floor(y0 * s)); y < Math.min(size, Math.ceil(y1 * s)); y++) {
      for (let x = Math.max(0, Math.floor(x0 * s)); x < Math.min(size, Math.ceil(x1 * s)); x++) {
        const i = (y * size + x) * 4;
        px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a;
      }
    }
  };
  const dot = (cx, cy, r, c) => {
    for (let y = Math.floor((cy - r) * s); y < Math.ceil((cy + r) * s); y++) {
      for (let x = Math.floor((cx - r) * s); x < Math.ceil((cx + r) * s); x++) {
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        const dx = x / s - cx, dy = y / s - cy;
        if (dx * dx + dy * dy > r * r) continue;
        const i = (y * size + x) * 4;
        px[i] = c[0]; px[i + 1] = c[1]; px[i + 2] = c[2]; px[i + 3] = c[3];
      }
    }
  };
  bar(0, 0, 512, 512, ESPRESSO); // full-bleed background
  bar(140, 150, 372, 214, CREAM); // T top bar
  bar(224, 150, 288, 362, CREAM); // T stem
  dot(256, 408, 26, AMBER); // amber dot
  return px;
}

const root = path.dirname(fileURLToPath(import.meta.url));
const pub = path.join(root, '..', 'public');
for (const [size, name] of [
  [192, 'icon-192.png'],
  [512, 'icon-512.png'],
  [512, 'maskable-512.png'],
  [180, 'apple-touch-icon.png'],
]) {
  await writeFile(path.join(pub, name), toPng(size, drawIcon(size)));
  console.log(`wrote public/${name}`);
}
