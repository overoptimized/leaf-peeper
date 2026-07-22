const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const startYear = 2015;
const endYear = 2025;
const outDir = path.join(__dirname, '../public/maps');

// Create directory if it doesn't exist
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Ensure two digits for month and day
function pad(num) {
  return num.toString().padStart(2, '0');
}

// Download a single file
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          resolve(true);
        });
      } else {
        res.resume(); // consume response data to free up memory
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
      }
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Generate the dates (Aug 15 to Dec 15)
function generateDatesForYear(year) {
  const dates = [];
  // August 15 - 31
  for (let d = 15; d <= 31; d++) dates.push(`${year}08${pad(d)}`);
  // September 1 - 30
  for (let d = 1; d <= 30; d++) dates.push(`${year}09${pad(d)}`);
  // October 1 - 31
  for (let d = 1; d <= 31; d++) dates.push(`${year}10${pad(d)}`);
  // November 1 - 30
  for (let d = 1; d <= 30; d++) dates.push(`${year}11${pad(d)}`);
  // December 1 - 15
  for (let d = 1; d <= 15; d++) dates.push(`${year}12${pad(d)}`);
  return dates;
}

// Main download loop
async function run() {
  console.log(`Starting historical map download (Aug 15 to Dec 15, ${startYear}-${endYear})...`);
  
  // We found the correct URL schema from explorefall-archive.js
  const baseUrl = 'https://www.explorefall.com/maps'; 
  
  let successCount = 0;
  let failCount = 0;

  for (let year = startYear; year <= endYear; year++) {
    const dates = generateDatesForYear(year);
    console.log(`\nProcessing Year ${year}...`);
    
    for (const dateString of dates) {
      // Correct URL schema: /maps/2021/20210901.png
      const url = `${baseUrl}/${year}/${dateString}.png`;
      const filename = path.join(outDir, `${dateString}.png`);
      
      // Skip if we already have it
      if (fs.existsSync(filename)) {
        console.log(`[SKIP] ${dateString}.png already exists`);
        continue;
      }

      try {
        await downloadImage(url, filename);
        console.log(`[SUCCESS] Downloaded ${dateString}.png`);
        successCount++;
      } catch (err) {
        console.log(`[FAIL] Could not download ${dateString}.png (${err.message})`);
        failCount++;
      }
      
      // Throttle to be polite and avoid IP bans
      await new Promise(r => setTimeout(r, 100)); 
    }
  }
  
  console.log(`\nFinished! Successfully downloaded: ${successCount}. Failed: ${failCount}`);
}

run();
