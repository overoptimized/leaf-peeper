const fs = require('fs');
const path = require('path');
const https = require('https');

const locationsPath = path.join(__dirname, '../src/data/locations.json');
let locations = require(locationsPath);

const fetchRoute = (startLng, startLat, endLng, endLat) => {
  return new Promise((resolve, reject) => {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&overview=full`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.routes && parsed.routes.length > 0) {
            resolve(parsed.routes[0].geometry);
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', (e) => resolve(null));
  });
};

async function main() {
  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    console.log(`Generating route for ${loc.name}...`);
    
    // Create a rough start and end point by offsetting coordinates
    // roughly ~10-15 miles offset to create a route going through the point
    const startLng = loc.coordinates.lng - 0.15;
    const startLat = loc.coordinates.lat - 0.15;
    const endLng = loc.coordinates.lng + 0.15;
    const endLat = loc.coordinates.lat + 0.15;

    // To prevent getting blocked by rate limits, pause 1 second
    await new Promise(r => setTimeout(r, 1000));
    
    const geometry = await fetchRoute(startLng, startLat, endLng, endLat);
    if (geometry) {
      loc.routeGeoJSON = {
        type: "Feature",
        properties: {},
        geometry: geometry
      };
      console.log(`  Success! Route has ${geometry.coordinates.length} points.`);
    } else {
      console.log(`  Failed to get route for ${loc.name}`);
    }
  }

  fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
  console.log('locations.json updated!');
}

main();
