const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const startYear = 2015;
const endYear = 2025;
const outDir = path.join(__dirname, '../public/maps');

// Create directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Map coordinates to 4000x2000 canvas
const canvasWidth = 4000;
const canvasHeight = 2000;
const minLng = -126;
const maxLng = -65;
const minLat = 23;
const maxLat = 52;

function lngToX(lng) {
  return ((lng - minLng) / (maxLng - minLng)) * canvasWidth;
}

function latToY(lat) {
  return ((maxLat - lat) / (maxLat - minLat)) * canvasHeight; // Y is inverted in canvas
}

function pad(num) {
  return num.toString().padStart(2, '0');
}

function getColorsForDay(peakDay, currentDay) {
  const diff = currentDay - peakDay;
  if (diff < -20) return 'rgba(74, 153, 49, 0.4)'; // Green
  if (diff < -10) return 'rgba(234, 219, 58, 0.5)'; // Yellow
  if (diff < -3) return 'rgba(249, 115, 22, 0.6)'; // Orange
  if (diff < 5) return 'rgba(220, 38, 38, 0.7)'; // Red (Peak)
  return 'rgba(100, 60, 40, 0.6)'; // Brown (Past Peak)
}

function generateDatesForYear(year) {
  const dates = [];
  for (let d = 15; d <= 31; d++) dates.push(`${year}08${pad(d)}`);
  for (let d = 1; d <= 30; d++) dates.push(`${year}09${pad(d)}`);
  for (let d = 1; d <= 31; d++) dates.push(`${year}10${pad(d)}`);
  for (let d = 1; d <= 30; d++) dates.push(`${year}11${pad(d)}`);
  for (let d = 1; d <= 15; d++) dates.push(`${year}12${pad(d)}`);
  return dates;
}

async function run() {
  console.log("Loading foliage squares GeoJSON...");
  const geojsonPath = path.join(__dirname, '../public/foliage-squares.geojson');
  let features = [];
  if (fs.existsSync(geojsonPath)) {
    const raw = fs.readFileSync(geojsonPath, 'utf8');
    const data = JSON.parse(raw);
    features = data.features || [];
  } else {
    console.log("No foliage-squares.geojson found, using empty set.");
  }
  
  // Calculate average cell size to draw rectangles
  const cellWidth = canvasWidth / ((maxLng - minLng) * 2); // Approximation
  const cellHeight = canvasHeight / ((maxLat - minLat) * 2); // Approximation

  console.log(`Starting Canvas map generation (${startYear}-${endYear})...`);

  for (let year = startYear; year <= endYear; year++) {
    const dates = generateDatesForYear(year);
    console.log(`\nProcessing Year ${year}...`);
    
    // Simulate some variance for the whole year (-5 to +5 days)
    const yearVariance = Math.floor(Math.random() * 11) - 5; 

    for (let i = 0; i < dates.length; i++) {
      const dateString = dates[i];
      const filename = path.join(outDir, `${dateString}.png`);
      
      if (fs.existsSync(filename)) continue;

      const currentDayOfYear = 227 + i; // Aug 15 is approx day 227

      const canvas = createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext('2d');
      
      // Clear with transparent
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw each feature
      for (const feature of features) {
        if (!feature.geometry || feature.geometry.type !== 'Point') continue;
        
        const [lng, lat] = feature.geometry.coordinates;
        const baselinePeak = feature.properties.peakDay || 280; // default Mid Oct
        
        // Apply our spatial variance model
        const actualPeak = baselinePeak + yearVariance; 
        
        const color = getColorsForDay(actualPeak, currentDayOfYear);
        
        const x = lngToX(lng);
        const y = latToY(lat);
        
        ctx.fillStyle = color;
        ctx.fillRect(x - cellWidth/2, y - cellHeight/2, cellWidth * 1.5, cellHeight * 1.5);
      }

      // Save to disk
      const buffer = canvas.toBuffer('image/png', { compressionLevel: 3 });
      fs.writeFileSync(filename, buffer);
      
      if (i % 20 === 0) {
        console.log(`Generated ${dateString}.png`);
      }
    }
  }
  console.log(`\nFinished generating all images!`);
}

run().catch(err => console.error(err));
