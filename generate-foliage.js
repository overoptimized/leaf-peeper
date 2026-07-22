import fs from 'fs';
import * as turf from '@turf/turf';

console.log("Loading US Boundaries...");
const usStates = JSON.parse(fs.readFileSync('public/us-states.json', 'utf8'));

// We only want Contiguous US, so filter out Alaska, Hawaii, Puerto Rico to speed up turf
const contiguousStates = usStates.features.filter(f => 
  !['Alaska', 'Hawaii', 'Puerto Rico'].includes(f.properties.NAME)
);

const minLng = -125;
const maxLng = -66;
const minLat = 25;
const maxLat = 49;
const step = 0.1; // 0.1 degrees = ~11km resolution

const cols = Math.ceil((maxLng - minLng) / step);
const rows = Math.ceil((maxLat - minLat) / step);

let grid = new Array(cols).fill(null).map(() => new Array(rows).fill(null));

// Define Mountain Ranges (simplified as line strings)
const rockies = turf.lineString([[-114, 49], [-105, 35]]);
const cascades = turf.lineString([[-121.5, 49], [-121.5, 40]]);
const sierraNevada = turf.lineString([[-121, 40], [-118, 35]]);
const appalachians = turf.lineString([[-84, 34], [-77, 40], [-70, 45]]);
const adirondacks = turf.point([-74, 44]);
const ozarks = turf.point([-92, 36]);

console.log(`Generating highly granular grid (${cols * rows} points)...`);

for (let x = 0; x < cols; x++) {
  const lng = minLng + x * step;
  for (let y = 0; y < rows; y++) {
    const lat = minLat + y * step;
    
    // Base peak day calculation purely based on latitude
    // Lat 25 -> Day 324 (Nov 20)
    // Lat 49 -> Day 263 (Sept 20)
    let peakDay = 324 - (lat - 25) * 2.54;

    const pt = turf.point([lng, lat]);

    // Apply elevation offsets
    const distRockies = turf.pointToLineDistance(pt, rockies, {units: 'miles'});
    if (distRockies < 200) peakDay -= (1 - distRockies / 200) * 35; // Rockies peak very early

    const distCascades = turf.pointToLineDistance(pt, cascades, {units: 'miles'});
    if (distCascades < 100) peakDay -= (1 - distCascades / 100) * 25;

    const distSierra = turf.pointToLineDistance(pt, sierraNevada, {units: 'miles'});
    if (distSierra < 100) peakDay -= (1 - distSierra / 100) * 25;

    const distAppalachians = turf.pointToLineDistance(pt, appalachians, {units: 'miles'});
    if (distAppalachians < 150) peakDay -= (1 - distAppalachians / 150) * 20;

    const distAdirondacks = turf.distance(pt, adirondacks, {units: 'miles'});
    if (distAdirondacks < 100) peakDay -= (1 - distAdirondacks / 100) * 15;

    const distOzarks = turf.distance(pt, ozarks, {units: 'miles'});
    if (distOzarks < 100) peakDay -= (1 - distOzarks / 100) * 10;

    // Add some random noise for organic feel
    peakDay += (Math.random() * 6) - 3;
    
    // Ensure we don't go earlier than Sept 1 (day 244) or later than Dec 15 (day 349)
    peakDay = Math.max(244, Math.min(349, peakDay));
    
    grid[x][y] = { lng, lat, peakDay, pt };
  }
}

// Optional: Apply 2D Gaussian blur to the grid to smooth the random noise and elevation gradients
console.log("Applying smoothing blur...");
const blurredGrid = new Array(cols).fill(null).map(() => new Array(rows).fill(null));
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    let sum = 0;
    let count = 0;
    // 3x3 kernel
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (x + dx >= 0 && x + dx < cols && y + dy >= 0 && y + dy < rows) {
          sum += grid[x + dx][y + dy].peakDay;
          count++;
        }
      }
    }
    blurredGrid[x][y] = sum / count;
  }
}

console.log("Clipping to US Contiguous borders (this may take a minute)...");
const features = [];
let pointsInside = 0;

for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    const cell = grid[x][y];
    const pt = cell.pt;
    
    // Strict Clipping: Check if point is inside ANY contiguous US state
    let isInsideUS = false;
    // Optimization: check bounding boxes first if turf.booleanPointInPolygon is slow. 
    // It's usually fast enough for 141k points.
    for (let state of contiguousStates) {
      if (turf.booleanPointInPolygon(pt, state)) {
        isInsideUS = true;
        break;
      }
    }

    if (isInsideUS) {
      pointsInside++;
      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [cell.lng, cell.lat] },
        properties: { peakDay: Math.round(blurredGrid[x][y]) } // Rounded to save file size
      });
    }
  }
}

console.log(`Kept ${pointsInside} points inside the US.`);

const geojson = {
  type: 'FeatureCollection',
  features: features
};

console.log("Writing to public/foliage-data.geojson...");
fs.writeFileSync('public/foliage-data.geojson', JSON.stringify(geojson));
console.log(`Done! Wrote ${(fs.statSync('public/foliage-data.geojson').size / 1024 / 1024).toFixed(2)} MB file.`);
