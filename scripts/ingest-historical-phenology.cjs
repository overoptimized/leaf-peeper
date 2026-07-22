const fs = require('fs');
const path = require('path');
const turf = require('@turf/turf');

const locationsPath = path.resolve(__dirname, '../src/data/locations.json');
const squaresPath = path.resolve(__dirname, '../public/foliage-squares.geojson');
const outPath = path.resolve(__dirname, '../src/data/historical-phenology.json');

const locations = JSON.parse(fs.readFileSync(locationsPath, 'utf8'));
const squares = JSON.parse(fs.readFileSync(squaresPath, 'utf8'));

// Helper to get the baseline peak day from the GeoJSON squares
function getBaselinePeakDay(lat, lng) {
  const pt = turf.point([lng, lat]);
  let minDistance = Infinity;
  let bestDay = 288; // Default to mid-Oct (day 288)

  // Fast spatial search - check bounding box first or just iterate (it's only a few thousand squares)
  for (const feature of squares.features) {
    if (turf.booleanPointInPolygon(pt, feature)) {
      return feature.properties.peakDay;
    }
    // Fallback: find nearest centroid if point falls outside exact boundaries
    const centroid = turf.centroid(feature);
    const dist = turf.distance(pt, centroid);
    if (dist < minDistance) {
      minDistance = dist;
      bestDay = feature.properties.peakDay;
    }
  }
  return bestDay;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const results = {};

  if (fs.existsSync(outPath)) {
    try {
      Object.assign(results, JSON.parse(fs.readFileSync(outPath, 'utf8')));
    } catch(e) {}
  }

  console.log(`Starting historical phenology calculation for ${locations.length} locations...`);

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    
    if (results[loc.slug]) {
      console.log(`[${i+1}/${locations.length}] Skipping ${loc.name} (already cached)`);
      continue;
    }

    const baselineDay = getBaselinePeakDay(loc.coordinates.lat, loc.coordinates.lng);
    console.log(`[${i+1}/${locations.length}] Fetching 20-year weather for ${loc.name} (Baseline Peak: Day ${baselineDay})`);

    // Fetch 20 years of weather (Aug 1 to Nov 30 for each year)
    // We can fetch the whole block from 2004-08-01 to 2023-11-30
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${loc.coordinates.lat}&longitude=${loc.coordinates.lng}&start_date=2004-08-01&end_date=2023-11-30&daily=temperature_2m_min,temperature_2m_max,precipitation_sum&timezone=auto`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (!data.daily || !data.daily.time) {
        console.error(`  -> Failed to fetch weather for ${loc.name}`);
        continue;
      }

      // We need to calculate the variance for each year.
      // A simple model: Calculate average September temperatures across the 20 years.
      // For a specific year, if September was warmer than average, peak is delayed. 
      // If colder, peak is early. (roughly 2 days delay per 1 degree C warmer)
      
      const yearlySeptTemps = {};
      let totalSeptTemp = 0;
      let septDayCount = 0;

      for (let j = 0; j < data.daily.time.length; j++) {
        const dateStr = data.daily.time[j];
        const month = parseInt(dateStr.substring(5, 7));
        const year = parseInt(dateStr.substring(0, 4));
        const tmin = data.daily.temperature_2m_min[j];
        const tmax = data.daily.temperature_2m_max[j];
        
        if (tmin === null || tmax === null) continue;
        const tavg = (tmin + tmax) / 2;

        if (month === 9) { // September is the critical month for triggering senescence
          if (!yearlySeptTemps[year]) {
            yearlySeptTemps[year] = { sum: 0, count: 0 };
          }
          yearlySeptTemps[year].sum += tavg;
          yearlySeptTemps[year].count += 1;
          
          totalSeptTemp += tavg;
          septDayCount += 1;
        }
      }

      const overallSeptAvg = totalSeptTemp / septDayCount;

      const yearlyPeaks = {};
      for (let year = 2004; year <= 2023; year++) {
        if (yearlySeptTemps[year] && yearlySeptTemps[year].count > 0) {
          const yearSeptAvg = yearlySeptTemps[year].sum / yearlySeptTemps[year].count;
          
          // Variance: If this year was 1°C warmer than the 20-year average, delay by 2 days.
          const tempDiff = yearSeptAvg - overallSeptAvg;
          const shiftDays = Math.round(tempDiff * 2);
          
          let predictedPeakDay = baselineDay + shiftDays;
          
          // Cap the shift at +/- 14 days
          if (predictedPeakDay > baselineDay + 14) predictedPeakDay = baselineDay + 14;
          if (predictedPeakDay < baselineDay - 14) predictedPeakDay = baselineDay - 14;
          
          yearlyPeaks[year] = predictedPeakDay;
        }
      }

      results[loc.slug] = {
        baselinePeakDay: baselineDay,
        yearlyPeaks: yearlyPeaks
      };
      
      console.log(`  -> Calculated variance (e.g. 2023 was shifted ${yearlyPeaks[2023] - baselineDay} days)`);
      
      // Save progressively
      fs.writeFileSync(outPath, JSON.stringify(results, null, 2));

    } catch (e) {
      console.error(`  -> Error calculating for ${loc.name}:`, e.message);
    }

    await sleep(500); // Be polite to Open-Meteo
  }

  console.log('Finished generating historical-phenology.json!');
}

main().catch(console.error);
