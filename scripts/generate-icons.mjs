import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'icon');

const BG = [28, 25, 21, 255];
const PAPER = [243, 230, 201, 255];
const INK = [28, 25, 21, 255];
const ACCENT = [196, 92, 38, 255];

function createPng(size) {
  const pixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      setPixel(pixels, size, x, y, paint(size, x, y));
    }
  }
  return encodePng(size, size, pixels);
}

function paint(size, x, y) {
  const s = size / 128;
  const px = x / s;
  const py = y / s;

  if (inRoundRect(px, py, 22, 30, 86, 68, 10)) {
    if (inCircle(px, py, 36, 64, 8)) {
      return BG;
    }
    if (py >= 30 && py <= 40) {
      return ACCENT;
    }
    if (px > 48 && py > 52 && py < 58 && px < 96) {
      return INK;
    }
    if (px > 48 && py > 64 && py < 69 && px < 84) {
      return [28, 25, 21, 140];
    }
    return PAPER;
  }
  return BG;
}

function inRoundRect(x, y, left, top, width, height, radius) {
  if (x < left || y < top || x > left + width || y > top + height) {
    return false;
  }
  const rx = clamp(x, left + radius, left + width - radius);
  const ry = clamp(y, top + radius, top + height - radius);
  if (Math.abs(x - rx) <= radius && Math.abs(y - ry) <= radius) {
    return (x - rx) ** 2 + (y - ry) ** 2 <= radius ** 2;
  }
  return true;
}

function inCircle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r ** 2;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function setPixel(pixels, size, x, y, color) {
  const i = (y * size + x) * 4;
  pixels[i] = color[0];
  pixels[i + 1] = color[1];
  pixels[i + 2] = color[2];
  pixels[i + 3] = color[3];
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const chunks = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
  return chunks;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcSrc = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcSrc), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i++) {
      c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

mkdirSync(OUT_DIR, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  writeFileSync(join(OUT_DIR, `${size}.png`), createPng(size));
}
