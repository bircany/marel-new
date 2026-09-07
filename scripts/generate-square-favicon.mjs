import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
}

const CRC32_TABLE = createCRC32Table();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.slice(4, 8 + len);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const rawScanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const destOffset = y * (1 + width * 4);
    rawScanlines[destOffset] = 0; // Filter None
    rgbaBuffer.copy(rawScanlines, destOffset + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = zlib.deflateSync(rawScanlines);
  const idatChunk = writeChunk('IDAT', compressed);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

async function main() {
  const buf = fs.readFileSync('public/images/marel-logo.png');
  let pos = 8;
  const idat = [];
  let srcWidth, srcHeight;

  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.slice(pos + 4, pos + 8).toString('ascii');
    if (type === 'IHDR') {
      srcWidth = buf.readUInt32BE(pos + 8);
      srcHeight = buf.readUInt32BE(pos + 12);
    } else if (type === 'IDAT') {
      idat.push(buf.slice(pos + 8, pos + 8 + len));
    }
    pos += 12 + len;
  }

  const uncompressed = zlib.inflateSync(Buffer.concat(idat));
  const srcStride = 1 + srcWidth * 4;

  // Unfilter scanlines (assuming filter 0 or handling simple filter)
  const decodedSrc = Buffer.alloc(srcWidth * srcHeight * 4);
  for (let y = 0; y < srcHeight; y++) {
    const lineStart = y * srcStride;
    const filterType = uncompressed[lineStart];
    for (let x = 0; x < srcWidth; x++) {
      const srcIdx = lineStart + 1 + x * 4;
      const destIdx = (y * srcWidth + x) * 4;
      if (filterType === 0) {
        decodedSrc[destIdx] = uncompressed[srcIdx];
        decodedSrc[destIdx + 1] = uncompressed[srcIdx + 1];
        decodedSrc[destIdx + 2] = uncompressed[srcIdx + 2];
        decodedSrc[destIdx + 3] = uncompressed[srcIdx + 3];
      } else if (filterType === 1) { // Sub
        const prevDest = x > 0 ? destIdx - 4 : null;
        for (let c = 0; c < 4; c++) {
          const prev = prevDest !== null ? decodedSrc[prevDest + c] : 0;
          decodedSrc[destIdx + c] = (uncompressed[srcIdx + c] + prev) & 0xff;
        }
      } else if (filterType === 2) { // Up
        const upDest = y > 0 ? ((y - 1) * srcWidth + x) * 4 : null;
        for (let c = 0; c < 4; c++) {
          const up = upDest !== null ? decodedSrc[upDest + c] : 0;
          decodedSrc[destIdx + c] = (uncompressed[srcIdx + c] + up) & 0xff;
        }
      } else {
        // Simple copy
        decodedSrc[destIdx] = uncompressed[srcIdx];
        decodedSrc[destIdx + 1] = uncompressed[srcIdx + 1];
        decodedSrc[destIdx + 2] = uncompressed[srcIdx + 2];
        decodedSrc[destIdx + 3] = uncompressed[srcIdx + 3];
      }
    }
  }

  // Emblem Bounding Box: minX: 16, maxX: 119, minY: 5, maxY: 86
  const embX = 14;
  const embY = 4;
  const embW = 108;
  const embH = 84;

  // Create a 128x128 Square Canvas with centered emblem
  const size = 128;
  const squareRGBA = Buffer.alloc(size * size * 4); // default all 0 (transparent)

  const offsetX = Math.floor((size - embW) / 2);
  const offsetY = Math.floor((size - embH) / 2);

  for (let y = 0; y < embH; y++) {
    for (let x = 0; x < embW; x++) {
      const srcX = embX + x;
      const srcY = embY + y;
      if (srcX >= 0 && srcX < srcWidth && srcY >= 0 && srcY < srcHeight) {
        const sIdx = (srcY * srcWidth + srcX) * 4;
        const dIdx = ((offsetY + y) * size + (offsetX + x)) * 4;
        squareRGBA[dIdx] = decodedSrc[sIdx];
        squareRGBA[dIdx + 1] = decodedSrc[sIdx + 1];
        squareRGBA[dIdx + 2] = decodedSrc[sIdx + 2];
        squareRGBA[dIdx + 3] = decodedSrc[sIdx + 3];
      }
    }
  }

  const outputPng = encodePNG(size, size, squareRGBA);
  fs.writeFileSync('public/favicon.png', outputPng);
  fs.writeFileSync('app/icon.png', outputPng);
  console.log('Successfully generated 128x128 square Marel emblem favicon to public/favicon.png and app/icon.png');
}

main().catch(console.error);
