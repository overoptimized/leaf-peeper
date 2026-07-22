import fs from 'fs';
import * as turf from '@turf/turf';

console.log("Loading US Boundaries...");
const usStates = JSON.parse(fs.readFileSync('public/us-states.json', 'utf8'));
const contiguousStates = usStates.features.filter(f => 
  !['Alaska', 'Hawaii', 'Puerto Rico'].includes(f.properties.NAME)
);
console.log("Unioning states into a single US boundary mask...");
let usBoundary = contiguousStates[0];
for (let i = 1; i < contiguousStates.length; i++) {
  try {
    usBoundary = turf.union(usBoundary, contiguousStates[i]);
  } catch (e) {
    // some geometries might fail union, just skip or handle
  }
}

const extent = [-125, 25, -66, 49];
const cellSide = 25; // 25 miles
const options = {units: 'miles'};

console.log("Generating point grid...");
const grid = turf.pointGrid(extent, cellSide, options);

// Mountain Ranges
const rockies = turf.lineString([[-114, 49], [-105, 35]]);
const cascades = turf.lineString([[-121.5, 49], [-121.5, 40]]);
const sierraNevada = turf.lineString([[-121, 40], [-118, 35]]);
const appalachians = turf.lineString([[-84, 34], [-77, 40], [-70, 45]]);
const adirondacks = turf.point([-74, 44]);
const ozarks = turf.point([-92, 36]);

console.log("Calculating peak days...");
grid.features.forEach(pt => {
  const [lng, lat] = pt.geometry.coordinates;
  let peakDay = 324 - (lat - 25) * 2.54;

  const distRockies = turf.pointToLineDistance(pt, rockies, {units: 'miles'});
  if (distRockies < 200) peakDay -= (1 - distRockies / 200) * 35;

  const distCascades = turf.pointToLineDistance(pt, cascades, {units: 'miles'});
  if (distCascades < 100) peakDay -= (1 - distCascades / 100) * 25;

  const distSierra = turf.pointToLineDistance(pt, sierraNevada, {units: 'miles'});
  if (distSierra < 100) peakDay -= (1 - distSierra / 100) * 25;

  const distAppalachians = turf.pointToLineDistance(pt, appalachians, {units: 'miles'});
  if (distAppalachians < 150) peakDay -= (1 - distAppalachians / 150) * 20;

  peakDay += (Math.random() * 4) - 2; // small noise
  pt.properties.peakDay = peakDay;
});

console.log("Generating isobands...");
const breaks = [240, 254, 264, 274, 285, 295, 305, 315, 325, 335, 350];
const isobands = turf.isobands(grid, breaks, {zProperty: 'peakDay'});

console.log(`Generated ${isobands.features.length} isoband polygons. Clipping to US boundary...`);
const clippedFeatures = [];

isobands.features.forEach(band => {
  try {
    const clipped = turf.intersect(band, usBoundary);
    if (clipped) {
      clipped.properties = band.properties;
      clippedFeatures.push(clipped);
    }
  } catch (e) {
    console.error("Intersection failed for a band");
  }
});

const output = turf.featureCollection(clippedFeatures);
fs.writeFileSync('public/foliage-contours.geojson', JSON.stringify(output));
console.log(`Done! Wrote ${(fs.statSync('public/foliage-contours.geojson').size / 1024).toFixed(2)} KB file.`);
