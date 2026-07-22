const fs = require('fs');
const path = require('path');
const https = require('https');

const drivesPath = path.join(__dirname, '../src/data/drives.json');
let drives = require(drivesPath);

const driveCoords = {
  "san-juan-skyway": {
    waypoints: [
      [-107.8801, 37.2753], // Durango
      [-108.5003, 37.4733], // Dolores
      [-107.8123, 37.9375], // Telluride
      [-107.7562, 38.1528], // Ridgway
      [-107.6714, 38.0228], // Ouray
      [-107.6645, 37.8119], // Silverton
      [-107.8801, 37.2753]  // Durango (Back to start for loop)
    ],
    center: [37.6, -107.8]
  },
  "vermont-route-100": {
    waypoints: [
      [-72.8712, 42.8698], // Wilmington
      [-72.7562, 44.3378]  // Waterbury
    ],
    center: [43.6, -72.8]
  },
  "skyline-drive": {
    waypoints: [
      [-78.1944, 38.9182], // Front Royal
      [-78.8596, 38.0326]  // Rockfish Gap
    ],
    center: [38.5, -78.5]
  },
  "historic-columbia-river-highway": {
    waypoints: [
      [-122.3898, 45.5398], // Troutdale
      [-121.5215, 45.7054]  // Hood River
    ],
    center: [45.6, -121.9]
  }
};

const fetchRoute = (waypoints) => {
  return new Promise((resolve, reject) => {
    const waypointsStr = waypoints.map(wp => `${wp[0]},${wp[1]}`).join(';');
    const url = `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?geometries=geojson&overview=full`;
    
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
  for (let i = 0; i < drives.length; i++) {
    const drive = drives[i];
    const coords = driveCoords[drive.slug];
    
    if (coords) {
      console.log(`Generating route for ${drive.name}...`);
      drive.center = coords.center;
      
      await new Promise(r => setTimeout(r, 1000));
      const geometry = await fetchRoute(coords.waypoints);
      
      if (geometry) {
        drive.routeGeoJSON = {
          type: "Feature",
          properties: {},
          geometry: geometry
        };
        console.log(`  Success! Route has ${geometry.coordinates.length} points.`);
      } else {
        console.log(`  Failed to get route for ${drive.name}`);
      }
    }
  }

  fs.writeFileSync(drivesPath, JSON.stringify(drives, null, 2));
  console.log('drives.json updated!');
}

main();
