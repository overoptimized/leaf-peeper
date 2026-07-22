const fs = require('fs');
const path = require('path');
const https = require('https');

const drivesPath = path.join(__dirname, '../src/data/drives.json');
let drives = require(drivesPath);

// Approximate coordinates for the missing routes to force OSRM routing
const driveCoords = {
  "acadia-all-american-road": { waypoints: [[-68.2039, 44.3876], [-68.3242, 44.2798]] },
  "blue-ridge-parkway": { waypoints: [[-78.8596, 38.0326], [-80.2037, 37.1083], [-81.6745, 36.2168], [-83.3206, 35.4760]] },
  "kancamagus-scenic-byway": { waypoints: [[-71.1203, 43.9790], [-71.6706, 44.0456]] },
  "connecticut-river-byway": { waypoints: [[-71.4962, 44.8967], [-72.5573, 42.8509]] },
  "connecticut-state-route-169": { waypoints: [[-71.9740, 41.9515], [-71.9892, 41.5976]] },
  "lakes-to-locks-passage": { waypoints: [[-73.6782, 42.7915], [-73.3662, 44.9859]] },
  "merritt-parkway": { waypoints: [[-73.6674, 41.0265], [-73.1329, 41.1845]] },
  "mohawk-trail-scenic-byway": { waypoints: [[-72.6001, 42.5873], [-73.2032, 42.7120]] },
  "schoodic-scenic-byway": { waypoints: [[-68.2125, 44.5329], [-68.0267, 44.4026]] },
  "white-mountain-trail": { waypoints: [[-71.1270, 44.0537], [-71.4645, 44.2690], [-71.6706, 44.0456]] },
  "cherohala-skyway": { waypoints: [[-84.2938, 35.3626], [-83.8074, 35.3229]] },
  "highland-scenic-highway": { waypoints: [[-80.5340, 38.2237], [-80.0934, 38.2229]] },
  "journey-through-hallowed-ground-byway": { waypoints: [[-77.2311, 39.8309], [-77.6256, 39.1983], [-78.4767, 38.0293]] },
  "russell-brasstown-national-scenic-byway": { waypoints: [[-83.9577, 34.8762], [-83.7335, 34.7015]] },
  "woodlands-trace": { waypoints: [[-88.2323, 37.0017], [-87.8389, 36.4831]] },
  "amish-country-byway": { waypoints: [[-81.9179, 40.5542], [-81.7249, 40.5401]] },
  "door-county-coastal-byway": { waypoints: [[-87.3770, 44.8342], [-87.1658, 45.1842], [-86.9856, 45.2936]] },
  "edge-of-the-wilderness": { waypoints: [[-93.5302, 47.2372], [-93.6394, 47.8388]] },
  "great-river-road": { waypoints: [[-95.2017, 47.2407], [-93.0900, 44.9537], [-90.1890, 38.6270], [-90.0715, 29.9511]] }, // MN to LA
  "gunflint-trail-scenic-byway": { waypoints: [[-90.3343, 47.7504], [-90.8711, 48.1691]] },
  "hocking-hills-scenic-byway": { waypoints: [[-82.4063, 39.5392], [-82.5358, 39.4187]] },
  "north-shore-scenic-drive": { waypoints: [[-92.1005, 46.7867], [-89.6841, 47.9626]] },
  "river-road-scenic-byway": { waypoints: [[-83.3283, 44.4239], [-83.8058, 44.3781]] },
  "beartooth-highway": { waypoints: [[-109.2468, 45.1858], [-109.9329, 45.0202]] },
  "colorado-river-headwaters-byway": { waypoints: [[-105.9395, 40.0861], [-106.6669, 39.8601]] },
  "frontier-pathways-scenic-and-historic-byway": { waypoints: [[-104.6091, 38.2544], [-105.4658, 38.1350]] },
  "grand-mesa-scenic-and-historic-byway": { waypoints: [[-108.1384, 39.1667], [-107.9259, 38.9003]] },
  "logan-canyon-scenic-byway": { waypoints: [[-111.8338, 41.7313], [-111.4174, 41.9567]] },
  "nebo-loop-scenic-byway": { waypoints: [[-111.7322, 39.9912], [-111.8361, 39.7100]] },
  "top-of-the-rockies": { waypoints: [[-106.1481, 39.5019], [-106.3197, 39.2558], [-106.8175, 39.1911]] },
  "trail-ridge-road-beaver-meadow-road": { waypoints: [[-105.5217, 40.3772], [-105.8236, 40.2522]] },
  "cascade-loop": { waypoints: [[-122.2043, 47.9790], [-120.6615, 47.5962], [-119.9572, 48.4777], [-122.3387, 48.4232]] },
  "cascade-lakes-scenic-byway": { waypoints: [[-121.3153, 44.0582], [-121.7323, 43.8348], [-121.9664, 43.5135]] },
  "chinook-scenic-byway": { waypoints: [[-121.9915, 47.2043], [-121.5162, 46.8726], [-120.7001, 46.7301]] },
  "mt-hood-scenic-byway": { waypoints: [[-122.3898, 45.5398], [-121.7104, 45.3023], [-121.5215, 45.7054]] },
  "stevens-pass-greenway": { waypoints: [[-121.9712, 47.8554], [-121.0882, 47.7454], [-120.6615, 47.5962]] },
  "volcanic-legacy-scenic-byway": { waypoints: [[-122.1158, 42.9238], [-121.7770, 42.1950], [-122.3164, 41.3114]] }
};

const fetchRoute = (waypoints) => {
  return new Promise((resolve) => {
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
    }).on('error', () => resolve(null));
  });
};

async function main() {
  let updatedCount = 0;
  for (let i = 0; i < drives.length; i++) {
    const drive = drives[i];
    
    if (!drive.routeGeoJSON && driveCoords[drive.slug]) {
      console.log(`Fetching route for ${drive.name}...`);
      const coords = driveCoords[drive.slug];
      
      // Calculate a rough center from the first waypoint
      drive.center = [coords.waypoints[0][1], coords.waypoints[0][0]];
      
      await new Promise(r => setTimeout(r, 1200)); // Be nice to OSRM
      const geometry = await fetchRoute(coords.waypoints);
      
      if (geometry) {
        drive.routeGeoJSON = {
          type: "Feature",
          properties: {},
          geometry: geometry
        };
        console.log(`  Success! Route has ${geometry.coordinates.length} points.`);
        updatedCount++;
      } else {
        console.log(`  Failed to get route for ${drive.name}`);
      }
    }
  }

  if (updatedCount > 0) {
    fs.writeFileSync(drivesPath, JSON.stringify(drives, null, 2));
    console.log(`Updated ${updatedCount} drives with route geometry.`);
  } else {
    console.log('No new routes fetched.');
  }
}

main();
