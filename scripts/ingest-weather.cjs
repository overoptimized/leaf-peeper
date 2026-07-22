const fs = require('fs');
const path = require('path');

const LOCATIONS_PATH = path.join(__dirname, '../src/data/locations.json');

// Sleep function to respect API limits
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWeatherData(lat, lng) {
  // Open-Meteo API: past 30 days of daily data for accumulation, plus current day for sunrise/sunset
  // We use temperature_2m_min for cold accumulation and precipitation_sum for moisture.
  // timezone=auto ensures the dates align with the local time of the coordinates.
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=sunrise,sunset,daylight_duration,temperature_2m_min,precipitation_sum&past_days=30&forecast_days=1&timezone=auto&temperature_unit=fahrenheit&precipitation_unit=inch`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

function processWeather(data) {
  const daily = data.daily;
  if (!daily || !daily.time || daily.time.length === 0) return null;

  // Last index is today (forecast_days=1 means it includes today)
  const todayIndex = daily.time.length - 1;

  // Extract today's astronomical data
  const sunrise = daily.sunrise[todayIndex];
  const sunset = daily.sunset[todayIndex];
  const daylightSeconds = daily.daylight_duration[todayIndex];
  
  // Format daylight duration into hours and minutes
  const daylightHours = Math.floor(daylightSeconds / 3600);
  const daylightMinutes = Math.floor((daylightSeconds % 3600) / 60);

  // Calculate Accumulations (looking at the past 30 days, which are indices 0 to todayIndex - 1)
  let coldAccumulationDays = 0;
  let totalPrecipitation = 0;

  for (let i = 0; i < todayIndex; i++) {
    const minTemp = daily.temperature_2m_min[i];
    const precip = daily.precipitation_sum[i];

    if (minTemp !== null && minTemp <= 40.0) {
      coldAccumulationDays++;
    }
    if (precip !== null) {
      totalPrecipitation += precip;
    }
  }

  // Calculate 14-day cold accumulation specifically for faster trigger detection
  let recentColdAccumulationDays = 0;
  const start14 = Math.max(0, todayIndex - 14);
  for (let i = start14; i < todayIndex; i++) {
    const minTemp = daily.temperature_2m_min[i];
    if (minTemp !== null && minTemp <= 40.0) {
      recentColdAccumulationDays++;
    }
  }

  return {
    lastUpdated: new Date().toISOString(),
    sunrise: sunrise ? new Date(sunrise).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null,
    sunset: sunset ? new Date(sunset).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : null,
    daylightDuration: `${daylightHours}h ${daylightMinutes}m`,
    coldDaysPast30: coldAccumulationDays,
    coldDaysPast14: recentColdAccumulationDays,
    precipitationPast30Inches: parseFloat(totalPrecipitation.toFixed(2))
  };
}

async function run() {
  console.log("Starting weather ingestion for locations...");
  const rawData = fs.readFileSync(LOCATIONS_PATH, 'utf-8');
  let locations = JSON.parse(rawData);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < locations.length; i++) {
    const loc = locations[i];
    if (loc.coordinates && loc.coordinates.lat && loc.coordinates.lng) {
      try {
        console.log(`[${i+1}/${locations.length}] Fetching weather for ${loc.name}, ${loc.stateName}...`);
        const weatherData = await fetchWeatherData(loc.coordinates.lat, loc.coordinates.lng);
        const stats = processWeather(weatherData);
        
        if (stats) {
          loc.weatherStats = stats;
          successCount++;
        }
      } catch (err) {
        console.error(`  -> Failed to fetch weather for ${loc.name}: ${err.message}`);
        errorCount++;
      }
      
      // Sleep for 200ms to avoid overwhelming the Open-Meteo API
      await sleep(200);
    }
  }

  fs.writeFileSync(LOCATIONS_PATH, JSON.stringify(locations, null, 2));
  console.log(`\nIngestion complete. Success: ${successCount}, Errors: ${errorCount}`);
  console.log(`Data saved to ${LOCATIONS_PATH}`);
}

run();
