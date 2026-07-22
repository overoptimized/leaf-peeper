import fs from 'fs';
import https from 'https';
import { createCanvas, loadImage } from 'canvas';

const z = 7;
const minX = 19;
const maxX = 40;
const minY = 43;
const maxY = 55;

const tilesW = maxX - minX + 1;
const tilesH = maxY - minY + 1;
const canvas = createCanvas(tilesW * 256, tilesH * 256);
const ctx = canvas.getContext('2d');

function downloadTile(x, y) {
  return new Promise((resolve, reject) => {
    const url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`;
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
      const data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve(Buffer.concat(data)));
    }).on('error', reject);
  });
}

async function main() {
  console.log(`Downloading ${tilesW * tilesH} Terrarium DEM tiles...`);
  let count = 0;
  for (let x = minX; x <= maxX; x++) {
    for (let y = minY; y <= maxY; y++) {
      try {
        const buffer = await downloadTile(x, y);
        const img = await loadImage(buffer);
        const drawX = (x - minX) * 256;
        const drawY = (y - minY) * 256;
        ctx.drawImage(img, drawX, drawY, 256, 256);
        count++;
        if (count % 20 === 0) console.log(`Downloaded ${count}/${tilesW * tilesH}`);
      } catch (e) {
        console.error(`Error downloading tile ${z}/${x}/${y}:`, e.message);
      }
    }
  }

  console.log("Stitching complete. Saving public/us-elevation-dem.png...");
  fs.writeFileSync('public/us-elevation-dem.png', canvas.toBuffer('image/png'));
  console.log("Done!");
}

main();
