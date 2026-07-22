import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCATIONS_PATH = path.join(__dirname, '../src/data/locations.json');
const DRIVES_PATH = path.join(__dirname, '../src/data/drives.json');
const OUT_LOCATIONS_PATH = path.join(__dirname, '../src/data/location_images.json');
const OUT_DRIVES_PATH = path.join(__dirname, '../src/data/drive_images.json');

// Helper to delay requests and avoid getting blocked
const delay = ms => new Promise(res => setTimeout(res, ms));

async function fetchWikimediaImages(query) {
  // Use Commons for the widest selection of outdoor and park photography
  // Filter for fall foliage explicitly by adding keywords if desired, but for highly niche places we'll just try to get any good picture first.
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrsearch=${encodeURIComponent(query)}&gsrnamespace=6&gsrlimit=3&prop=imageinfo&iiprop=url|extmetadata`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'LeafPeeperBot/1.0 (https://github.com/overoptimized/leaf-peeper)'
      }
    });
    const data = await response.json();
    
    if (!data.query || !data.query.pages) return [];
    
    const pages = Object.values(data.query.pages);
    return pages.map(page => {
      const info = page.imageinfo && page.imageinfo[0];
      if (!info) return null;
      
      const meta = info.extmetadata || {};
      return {
        url: info.url,
        descriptionUrl: info.descriptionurl,
        title: meta.ObjectName ? meta.ObjectName.value : page.title.replace('File:', ''),
        author: meta.Artist ? meta.Artist.value.replace(/<[^>]+>/g, '') : 'Unknown', // Strip basic HTML from author
        license: meta.LicenseShortName ? meta.LicenseShortName.value : 'Unknown',
        source: 'wikimedia'
      };
    }).filter(Boolean);
  } catch (err) {
    console.error(`Error fetching for query "${query}":`, err.message);
    return [];
  }
}

async function processDataset(inputPath, outputPath, isDrive = false) {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const results = {};
  
  console.log(`Processing ${data.length} items from ${inputPath}...`);
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    // For drives, the name is usually something like "San Juan Skyway"
    // For locations, name + state makes it specific enough (e.g. "Kenosha Pass, Colorado")
    const query = isDrive ? `${item.name}` : `${item.name}, ${item.stateName}`;
    
    console.log(`[${i+1}/${data.length}] Fetching images for: ${query}`);
    let images = await fetchWikimediaImages(query);
    
    // Fallback: If no images found for highly specific park name, try falling back to just the name without the state
    if (images.length === 0 && !isDrive) {
      console.log(`  -> No results for "${query}", trying fallback: "${item.name}"`);
      images = await fetchWikimediaImages(item.name);
    }
    
    results[item.slug] = images;
    
    // Play nice with the API
    await delay(200);
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`Saved ${Object.keys(results).length} results to ${outputPath}`);
}

async function main() {
  if (fs.existsSync(LOCATIONS_PATH)) {
    await processDataset(LOCATIONS_PATH, OUT_LOCATIONS_PATH, false);
  } else {
    console.log(`Locations file not found at ${LOCATIONS_PATH}`);
  }
  
  if (fs.existsSync(DRIVES_PATH)) {
    await processDataset(DRIVES_PATH, OUT_DRIVES_PATH, true);
  } else {
    console.log(`Drives file not found at ${DRIVES_PATH}`);
  }
  
  console.log("Image fetching complete!");
}

main();
