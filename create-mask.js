import fs from 'fs';
import https from 'https';
import { difference, bboxPolygon } from '@turf/turf';

// A basic bounding box for the world
const world = bboxPolygon([-180, -90, 180, 90]);

https.get('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const usData = JSON.parse(data);
    
    // Combine all states into one feature collection
    // For a mask, we can just difference each state from the world polygon iteratively
    let mask = world;
    for (const state of usData.features) {
      if (state.properties.name !== 'Alaska' && state.properties.name !== 'Hawaii' && state.properties.name !== 'Puerto Rico') {
        try {
          mask = difference(mask, state);
        } catch(e) {
          // ignore topology errors for now
        }
      }
    }
    
    fs.writeFileSync('public/us-mask.geojson', JSON.stringify(mask));
    console.log('Created inverted mask at public/us-mask.geojson');
  });
}).on('error', err => console.log(err.message));
