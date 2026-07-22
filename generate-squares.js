import fs from 'fs';
import * as turf from '@turf/turf';

console.log("Loading US Boundaries...");
const usStates = JSON.parse(fs.readFileSync('public/us-states.json', 'utf8'));
const contiguousStates = usStates.features.filter(f => 
  !['Alaska', 'Hawaii', 'Puerto Rico'].includes(f.properties.NAME)
);

const minLng = -125;
const maxLng = -66;
const minLat = 25;
const maxLat = 49;
const step = 0.15; // 0.15 degrees = ~15km resolution

const cols = Math.ceil((maxLng - minLng) / step);
const rows = Math.ceil((maxLat - minLat) / step);

let grid = new Array(cols).fill(null).map(() => new Array(rows).fill(null));

// Define Mountain Ranges (much higher detail)
const rockies = turf.lineString([[-114, 49], [-111, 45], [-106, 39], [-105, 35]]);
const cascades = turf.lineString([[-121.5, 49], [-122, 44], [-121.5, 40]]);
const sierraNevada = turf.lineString([[-121, 40], [-119, 37], [-118, 35]]);
const appalachians = turf.lineString([[-84, 34], [-81, 37], [-77, 40], [-73, 43], [-70, 45]]);
const adirondacks = turf.point([-74, 44]);
const ozarks = turf.point([-92, 36]);

console.log(`Generating highly granular grid (${cols * rows} squares)...`);

for (let x = 0; x < cols; x++) {
  const lng = minLng + x * step;
  for (let y = 0; y < rows; y++) {
    const lat = minLat + y * step;
    
    // Base peak day calculation purely based on latitude
    let peakDay = 324 - (lat - 25) * 2.54;
    const pt = turf.point([lng, lat]);

    // Apply elevation offsets
    const distRockies = turf.pointToLineDistance(pt, rockies, {units: 'miles'});
    if (distRockies < 200) peakDay -= (1 - distRockies / 200) * 35;

    const distCascades = turf.pointToLineDistance(pt, cascades, {units: 'miles'});
    if (distCascades < 100) peakDay -= (1 - distCascades / 100) * 25;

    const distSierra = turf.pointToLineDistance(pt, sierraNevada, {units: 'miles'});
    if (distSierra < 100) peakDay -= (1 - distSierra / 100) * 25;

    const distAppalachians = turf.pointToLineDistance(pt, appalachians, {units: 'miles'});
    if (distAppalachians < 150) peakDay -= (1 - distAppalachians / 150) * 20;

    // Add some random noise for organic feel
    peakDay += (Math.random() * 4) - 2;
    
    peakDay = Math.max(244, Math.min(349, peakDay));
    grid[x][y] = { lng, lat, peakDay, pt };
  }
}

console.log("Applying smoothing blur...");
const blurredGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(null));
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    let sum = 0;
    let count = 0;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        if (x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows) {
          sum += grid[x + dx][y + dy].peakDay;
          count++;
        }
      }
    }
    blurredGrid[x][y] = sum / count;
  }
}

console.log("Clipping to US Contiguous borders and building squares...");
const features = [];
let squaresInside = 0;

for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    const cell = grid[x][y];
    const pt = cell.pt;
    
    // Strict Clipping: Check if center point is inside ANY contiguous US state
    let isInsideUS = false;
    for (let state of contiguousStates) {
      if (turf.booleanPointInPolygon(pt, state)) {
        isInsideUS = true;
        break;
      }
    }

    // Also check bounding box of square doesn't poke out much? 
    // Just point clipping is usually enough if grid is small.

    if (isInsideUS) {
      squaresInside++;
      // Create a square polygon
      // [lng, lat] is center.
      const halfStep = step / 2;
      const square = turf.polygon([[
        [cell.lng - halfStep, cell.lat - halfStep],
        [cell.lng + halfStep, cell.lat - halfStep],
        [cell.lng + halfStep, cell.lat + halfStep],
        [cell.lng - halfStep, cell.lat + halfStep],
        [cell.lng - halfStep, cell.lat - halfStep] // close
      ]]);
      
      features.push({
        type: 'Feature',
        geometry: square.geometry,
        properties: { peakDay: Math.round(blurredGrid[x][y]) }
      });
    }
  }
}

console.log(`Kept ${squaresInside} squares inside the US.`);

const geojson = {
  type: 'FeatureCollection',
  features: features
};

console.log("Writing to public/foliage-squares.geojson...");
fs.writeFileSync('public/foliage-squares.geojson', JSON.stringify(geojson));
console.log(`Done! Wrote ${(fs.statSync('public/foliage-squares.geojson').size / 1024 / 1024).toFixed(2)} MB file.`);
