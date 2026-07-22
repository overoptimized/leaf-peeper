#!/usr/bin/env node
/**
 * Strips routeGeoJSON from drives.json and locations.json.
 * Writes each geometry to public/routes/{drive|location}-{slug}.geojson.
 * Saves stripped versions back to src/data/.
 *
 * Run: node scripts/extract-geojson.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'src', 'data');
const OUT = path.join(ROOT, 'public', 'routes');

fs.mkdirSync(OUT, { recursive: true });

function processFile(filename, prefix) {
  const filePath = path.join(DATA, filename);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const arr = Array.isArray(raw) ? raw : Object.values(raw);

  let extracted = 0;
  const stripped = arr.map(item => {
    const outFile = path.join(OUT, `${prefix}-${item.slug}.geojson`);
    if (item.routeGeoJSON) {
      fs.writeFileSync(outFile, JSON.stringify(item.routeGeoJSON));
      extracted++;
      const { routeGeoJSON, ...rest } = item;
      return { ...rest, hasRoute: true };
    }
    // Mark items that already had routes extracted in a previous run
    if (fs.existsSync(outFile)) {
      return { ...item, hasRoute: true };
    }
    return item;
  });

  const sizeBefore = fs.statSync(filePath).size;
  fs.writeFileSync(filePath, JSON.stringify(stripped, null, 2));
  const sizeAfter = fs.statSync(filePath).size;

  console.log(
    `${filename}: ${extracted} routes extracted | ` +
    `${(sizeBefore / 1024).toFixed(0)}KB → ${(sizeAfter / 1024).toFixed(0)}KB ` +
    `(${Math.round((1 - sizeAfter / sizeBefore) * 100)}% reduction)`
  );
}

processFile('drives.json', 'drive');
processFile('locations.json', 'location');

console.log(`\nGeoJSON files written to public/routes/`);
console.log('MapLibre: load route geometry client-side via fetch(`/routes/${prefix}-${slug}.geojson`)');
