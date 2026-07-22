const fs = require('fs');
const path = require('path');

const locationsPath = path.join(__dirname, '../src/data/locations.json');
const outPath = path.join(__dirname, '../src/data/hub-boundaries.json');

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));

// Extract unique hubs
const hubs = [];
const seen = new Set();
locations.forEach(loc => {
  const key = `${loc.cityName}|${loc.stateSlug}`;
  if (!seen.has(key)) {
    seen.add(key);
    hubs.push({ city: loc.cityName, state: loc.stateSlug });
  }
});

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchBoundaries() {
  const results = {};
  
  // Load existing to avoid re-fetching
  if (fs.existsSync(outPath)) {
    try {
      Object.assign(results, JSON.parse(fs.readFileSync(outPath, 'utf8')));
    } catch(e) {}
  }

  console.log(`Found ${hubs.length} unique hubs.`);

  for (let i = 0; i < hubs.length; i++) {
    const hub = hubs[i];
    const key = `${hub.city}-${hub.state}`;
    
    if (results[key]) {
      console.log(`[${i+1}/${hubs.length}] Skipping ${hub.city}, ${hub.state} (already cached)`);
      continue;
    }

    console.log(`[${i+1}/${hubs.length}] Fetching boundary for ${hub.city}, ${hub.state}...`);
    
    const query = encodeURIComponent(`${hub.city}, ${hub.state}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&polygon_geojson=1&limit=1`;
    
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'LeafPeeper/1.0 (test@example.com)' } // Nominatim requires a user agent
      });
      const data = await response.json();
      
      if (data && data.length > 0 && data[0].geojson) {
        results[key] = data[0].geojson;
        console.log(`  -> Success! Found ${data[0].type}`);
      } else {
        console.log(`  -> No GeoJSON found.`);
      }
    } catch (e) {
      console.error(`  -> Error fetching ${hub.city}:`, e.message);
    }
    
    // Respect Nominatim's 1 request per second rule
    await sleep(1500);
  }

  fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
  console.log('Finished writing hub-boundaries.json');
}

fetchBoundaries();
