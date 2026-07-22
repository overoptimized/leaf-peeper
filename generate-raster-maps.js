import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

// Output Map Bounds (Web Mercator alignment)
const minLng = -126;
const maxLng = -65;
const minLat = 23;
const maxLat = 52;
// Massive 4K resolution for microscopic topographic detail!
const width = 4000;
const height = 2000;

// Web Mercator Math
function mercY(lat) {
  return Math.log(Math.tan(Math.PI/4 + (lat * Math.PI / 180)/2));
}
const maxMercY = mercY(maxLat);
const minMercY = mercY(minLat);

function pxToLatLng(px, py) {
  const lng = minLng + (px / width) * (maxLng - minLng);
  const mY = maxMercY - (py / height) * (maxMercY - minMercY);
  const lat = (2 * Math.atan(Math.exp(mY)) - Math.PI/2) * 180 / Math.PI;
  return [lng, lat];
}

async function main() {
  console.log("Loading US Boundaries...");
  const usStates = JSON.parse(fs.readFileSync('public/us-states.json', 'utf8'));

  console.log("Pre-rendering 4K US Border Mask...");
  const maskCanvas = createCanvas(width, height);
  const mctx = maskCanvas.getContext('2d');
  mctx.fillStyle = '#000';
  mctx.beginPath();
  usStates.features.forEach(feature => {
    if (['Alaska', 'Hawaii', 'Puerto Rico'].includes(feature.properties.NAME)) return;
    const geom = feature.geometry;
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
    polys.forEach(rings => {
      rings.forEach((ring, index) => {
        ring.forEach(([lng, lat], i) => {
          const px = ((lng - minLng) / (maxLng - minLng)) * width;
          const py = ((maxMercY - mercY(lat)) / (maxMercY - minMercY)) * height;
          if (i === 0) mctx.moveTo(px, py);
          else mctx.lineTo(px, py);
        });
      });
    });
  });
  mctx.fill();
  const maskData = mctx.getImageData(0, 0, width, height).data;

  console.log("Loading Real USGS DEM Data...");
  const demImage = await loadImage('public/us-elevation-dem.png');
  const demCanvas = createCanvas(demImage.width, demImage.height);
  const dctx = demCanvas.getContext('2d');
  dctx.drawImage(demImage, 0, 0);
  const demData = dctx.getImageData(0, 0, demImage.width, demImage.height).data;
  
  // DEM was downloaded at Zoom Level 7
  const demMinX = 19;
  const demMinY = 43;

  console.log("Calculating exact topographic peak days for 8,000,000 pixels...");
  const peakGrid = new Float32Array(width * height);
  
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const idx = (py * width + px) * 4;
      // Skip if pixel is in the ocean or Canada
      if (maskData[idx + 3] === 0) continue;

      const [lng, lat] = pxToLatLng(px, py);

      // Find the exact pixel in the DEM image using Zoom 7 math
      const globalX = ((lng + 180) / 360) * 128 * 256;
      const latRad = lat * Math.PI / 180;
      const globalY = (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * 128 * 256;
      
      const demPx = Math.floor(globalX - demMinX * 256);
      const demPy = Math.floor(globalY - demMinY * 256);
      
      let elevation = 0;
      if (demPx >= 0 && demPx < demImage.width && demPy >= 0 && demPy < demImage.height) {
        const dIdx = (demPy * demImage.width + demPx) * 4;
        const R = demData[dIdx];
        const G = demData[dIdx + 1];
        const B = demData[dIdx + 2];
        elevation = (R * 256 + G + B / 256) - 32768;
      }

      // True Base Math: Relaxed latitude slope (pushes baseline peaks back 1-2 weeks)
      let peakDay = 335 - (lat - 25) * 2.1;
      
      // True Topography Math: Stronger elevation modifier to keep mountains popping
      if (elevation > 0) {
        peakDay -= (elevation / 100) * 1.5;
      }
      
      peakGrid[py * width + px] = Math.max(244, Math.min(349, peakDay));
    }
  }

  console.log("Skipping micro-blur to keep raw pixelated terrain data...");
  const blurredGrid = peakGrid;

  console.log("Generating 122 Ultra-HD Frames (Fast Pixel Mode)...");
  if (!fs.existsSync('public/maps')) fs.mkdirSync('public/maps');

  const outCanvas = createCanvas(width, height);
  const outCtx = outCanvas.getContext('2d');
  
  function drawFrame(currentDay, outputPath, isPeak = false) {
    const outData = outCtx.createImageData(width, height);
    const data = outData.data;

    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const i = py * width + px;
        const idx = i * 4;
        
        // Skip pixels outside US borders instantly
        if (maskData[idx + 3] === 0) continue;
        
        const peakDay = blurredGrid[i];
        if (peakDay === 0) continue;

        let r=0, g=0, b=0, a=0;
        
        if (isPeak) {
          a = 255;
          if (peakDay < 254) { r=31; g=42; b=64; }
          else if (peakDay < 264) { r=42; g=58; b=85; }
          else if (peakDay < 274) { r=56; g=67; b=93; }
          else if (peakDay < 285) { r=61; g=92; b=59; }
          else if (peakDay < 295) { r=103; g=144; b=96; }
          else if (peakDay < 305) { r=162; g=179; b=124; }
          else if (peakDay < 315) { r=220; g=198; b=126; }
          else if (peakDay < 325) { r=174; g=140; b=83; }
          else if (peakDay < 335) { r=115; g=77; b=49; }
          else { r=224; g=224; b=224; }
        } else {
          const diff = currentDay - peakDay;
          if (diff < -15) { r=117; g=154; b=84; a=255; } // Green (No Color)
          else if (diff < -6) { r=232; g=230; b=111; a=255; } // Yellow (Low Color)
          else if (diff < 0) { r=224; g=154; b=63; a=255; } // Orange (Moderate)
          else if (diff < 7) { r=185; g=101; b=42; a=255; } // Dark Orange (High)
          else if (diff < 14) { r=151; g=43; b=33; a=255; } // Red (Peak)
          else { r=85; g=54; b=33; a=255; } // Brown (Past Peak indefinitely)
        }
        
        data[idx] = r;
        data[idx+1] = g;
        data[idx+2] = b;
        data[idx+3] = a;
      }
    }
    outCtx.putImageData(outData, 0, 0);
    fs.writeFileSync(outputPath, outCanvas.toBuffer('image/png', { compressionLevel: 3 }));
  }

  drawFrame(0, 'public/maps/peakdate.png', true);

  for (let sliderValue = 0; sliderValue <= 121; sliderValue++) {
    const currentDay = 244 + sliderValue;
    const currentDate = new Date(2026, 8, 1 + sliderValue);
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    const dateString = `${yyyy}${mm}${dd}`;
    
    drawFrame(currentDay, `public/maps/${dateString}.png`, false);
    if (sliderValue % 20 === 0) console.log(`Generated frame ${sliderValue}/121`);
  }

  console.log('All 4K topographic maps generated successfully!');
}

main().catch(console.error);
