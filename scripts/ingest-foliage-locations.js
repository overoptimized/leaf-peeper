import fs from 'fs';
import path from 'path';

const MD_PATH = 'C:/Users/L/.gemini/antigravity/brain/8b0bd822-83fa-45c5-9e44-9fe5a01e119d/best_fall_foliage_by_state.md';
const OUT_PATH = path.resolve('src/data/locations.json');

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function geocode(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&addressdetails=1`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'LeafPeeperApp/1.0' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      return data[0];
    }
  } catch (err) {
    console.error("Error geocoding", query, err);
  }
  return null;
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function main() {
  const content = fs.readFileSync(MD_PATH, 'utf8');
  const lines = content.split('\n');
  
  let currentStateName = '';
  let currentStateSlug = '';
  const newLocations = [];

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('### ')) {
      currentStateName = line.replace('### ', '').trim();
      currentStateSlug = slugify(currentStateName);
      continue;
    }

    const match = line.match(/^[\*\-]\s+\*\*(.*?):\*\*\s*(.*)/);
    if (match && currentStateName) {
      const locName = match[1].trim();
      const desc = match[2].trim();
      const cleanLocName = locName.split('(')[0].replace(/&/g, 'and').trim();
      
      newLocations.push({
        stateName: currentStateName,
        stateSlug: currentStateSlug,
        rawName: locName,
        queryName: cleanLocName,
        desc: desc
      });
    }
  }

  console.log(`Parsed ${newLocations.length} locations. Starting geocoding...`);

  const existingLocs = JSON.parse(fs.readFileSync(OUT_PATH, 'utf8'));
  const existingSlugs = new Set(existingLocs.map(l => l.slug));

  let addedCount = 0;

  for (const loc of newLocations) {
    const slug = slugify(loc.stateSlug + '-' + loc.rawName);
    if (existingSlugs.has(slug)) {
      continue;
    }

    console.log(`Geocoding: ${loc.queryName}, ${loc.stateName}`);
    const geo = await geocode(`${loc.queryName}, ${loc.stateName}`);
    await delay(1200);

    let lat = 0, lng = 0, cityName = 'Unknown', citySlug = 'unknown';

    if (geo) {
      lat = parseFloat(geo.lat);
      lng = parseFloat(geo.lon);
      const addr = geo.address || {};
      cityName = addr.city || addr.town || addr.village || addr.county || loc.stateName;
      citySlug = slugify(cityName);
    } else {
      console.log(`  -> Failed to geocode ${loc.queryName}. Skipping.`);
      continue;
    }

    existingLocs.push({
      slug,
      name: loc.rawName,
      stateSlug: loc.stateSlug,
      stateName: loc.stateName,
      citySlug,
      cityName,
      description: loc.desc,
      coordinates: { lat, lng },
      historicalPeak: "Mid October",
      currentStatus: "No Color",
      nearbyCities: [
        { name: cityName + " Center", distanceEstimate: "Less than an hour" },
        { name: "Regional Hub", distanceEstimate: "1-2 hours" },
        { name: "Distant Hub", distanceEstimate: "3-4 hours" }
      ],
      routeGeoJSON: null
    });
    addedCount++;
  }

  fs.writeFileSync(OUT_PATH, JSON.stringify(existingLocs, null, 4));
  console.log(`Successfully added ${addedCount} new locations.`);
}

main().catch(console.error);
