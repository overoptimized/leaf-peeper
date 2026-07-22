const fs = require('fs');
const path = require('path');

const locationsPath = path.join(__dirname, '../src/data/locations.json');
let locations = require(locationsPath);

const newLocations = [
  {
    "slug": "ozark-national-forest",
    "name": "Ozark National Forest, Arkansas",
    "stateSlug": "ar",
    "stateName": "Arkansas",
    "citySlug": "fayetteville",
    "cityName": "Fayetteville",
    "description": "Experience sweeping views of vibrant fall foliage stretching across the rolling mountains of the Ozarks.",
    "coordinates": { "lat": 35.7190, "lng": -93.6393 },
    "historicalPeak": "Late October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Fayetteville, AR", "distanceEstimate": "1 hour" }]
  },
  {
    "slug": "porcupine-mountains",
    "name": "Porcupine Mountains, Michigan",
    "stateSlug": "mi",
    "stateName": "Michigan",
    "citySlug": "ontonagon",
    "cityName": "Ontonagon",
    "description": "Known as the 'Porkies', this rugged wilderness offers some of the most spectacular fall colors in the Upper Peninsula.",
    "coordinates": { "lat": 46.8123, "lng": -89.6644 },
    "historicalPeak": "Early October",
    "currentStatus": "Near Peak",
    "nearbyCities": [{ "name": "Ontonagon, MI", "distanceEstimate": "30 minutes" }]
  },
  {
    "slug": "tahquamenon-falls",
    "name": "Tahquamenon Falls, Michigan",
    "stateSlug": "mi",
    "stateName": "Michigan",
    "citySlug": "paradise",
    "cityName": "Paradise",
    "description": "Stunning copper-colored waterfalls surrounded by brilliant autumnal hardwood forests.",
    "coordinates": { "lat": 46.5772, "lng": -85.2530 },
    "historicalPeak": "Early October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Paradise, MI", "distanceEstimate": "20 minutes" }]
  },
  {
    "slug": "north-shore-duluth",
    "name": "North Shore Scenic Drive, Minnesota",
    "stateSlug": "mn",
    "stateName": "Minnesota",
    "citySlug": "duluth",
    "cityName": "Duluth",
    "description": "Hugging Lake Superior, this drive boasts stunning views of birch and maple trees erupting in yellow and red.",
    "coordinates": { "lat": 46.7867, "lng": -92.1005 },
    "historicalPeak": "Late September to Early October",
    "currentStatus": "Patchy to Near Peak",
    "nearbyCities": [{ "name": "Duluth, MN", "distanceEstimate": "0 minutes" }]
  },
  {
    "slug": "boston-common",
    "name": "Boston Common & Public Garden",
    "stateSlug": "ma",
    "stateName": "Massachusetts",
    "citySlug": "boston",
    "cityName": "Boston",
    "description": "An iconic urban leaf-peeping destination featuring weeping willows, maples, and historic monuments.",
    "coordinates": { "lat": 42.3551, "lng": -71.0656 },
    "historicalPeak": "Late October",
    "currentStatus": "Just Starting",
    "nearbyCities": [{ "name": "Boston, MA", "distanceEstimate": "0 minutes" }]
  },
  {
    "slug": "mount-greylock",
    "name": "Mount Greylock, Massachusetts",
    "stateSlug": "ma",
    "stateName": "Massachusetts",
    "citySlug": "adams",
    "cityName": "Adams",
    "description": "The highest point in Massachusetts offers incredible panoramic views of foliage across three states.",
    "coordinates": { "lat": 42.6376, "lng": -73.1662 },
    "historicalPeak": "Early October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "North Adams, MA", "distanceEstimate": "30 minutes" }]
  },
  {
    "slug": "adirondack-mountains",
    "name": "Adirondack Mountains, New York",
    "stateSlug": "ny",
    "stateName": "New York",
    "citySlug": "lake-placid",
    "cityName": "Lake Placid",
    "description": "One of the most famous foliage destinations in the US, featuring vibrant sugar maples and serene mountain lakes.",
    "coordinates": { "lat": 44.2795, "lng": -73.9799 },
    "historicalPeak": "Late September",
    "currentStatus": "Near Peak",
    "nearbyCities": [{ "name": "Lake Placid, NY", "distanceEstimate": "0 minutes" }]
  },
  {
    "slug": "letchworth-state-park",
    "name": "Letchworth State Park, New York",
    "stateSlug": "ny",
    "stateName": "New York",
    "citySlug": "castile",
    "cityName": "Castile",
    "description": "Known as the 'Grand Canyon of the East', the gorge and waterfalls look spectacular amidst autumn colors.",
    "coordinates": { "lat": 42.5801, "lng": -78.0435 },
    "historicalPeak": "Mid October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Rochester, NY", "distanceEstimate": "1 hour" }]
  },
  {
    "slug": "poconos",
    "name": "Pocono Mountains, Pennsylvania",
    "stateSlug": "pa",
    "stateName": "Pennsylvania",
    "citySlug": "jim-thorpe",
    "cityName": "Jim Thorpe",
    "description": "Historic towns and sweeping valleys covered in a vibrant blanket of red, orange, and gold.",
    "coordinates": { "lat": 40.8665, "lng": -75.7383 },
    "historicalPeak": "Mid October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Scranton, PA", "distanceEstimate": "45 minutes" }]
  },
  {
    "slug": "pine-creek-gorge",
    "name": "Pine Creek Gorge (PA Grand Canyon)",
    "stateSlug": "pa",
    "stateName": "Pennsylvania",
    "citySlug": "wellsboro",
    "cityName": "Wellsboro",
    "description": "A deeply cut gorge offering spectacular views of autumnal forests lining the canyon walls.",
    "coordinates": { "lat": 41.7481, "lng": -77.3000 },
    "historicalPeak": "Early October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Wellsboro, PA", "distanceEstimate": "15 minutes" }]
  },
  {
    "slug": "delaware-water-gap",
    "name": "Delaware Water Gap, New Jersey",
    "stateSlug": "nj",
    "stateName": "New Jersey",
    "citySlug": "columbia",
    "cityName": "Columbia",
    "description": "Breathtaking views of the Delaware River winding through forested mountains bursting with color.",
    "coordinates": { "lat": 40.9723, "lng": -75.1299 },
    "historicalPeak": "Mid October",
    "currentStatus": "Just Starting",
    "nearbyCities": [{ "name": "Stroudsburg, PA", "distanceEstimate": "15 minutes" }]
  },
  {
    "slug": "starved-rock",
    "name": "Starved Rock State Park, Illinois",
    "stateSlug": "il",
    "stateName": "Illinois",
    "citySlug": "utica",
    "cityName": "Utica",
    "description": "Famous for its steep sandstone canyons and waterfalls surrounded by brilliant fall foliage.",
    "coordinates": { "lat": 41.3206, "lng": -88.9926 },
    "historicalPeak": "Mid October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Chicago, IL", "distanceEstimate": "1.5 hours" }]
  },
  {
    "slug": "brown-county-state-park",
    "name": "Brown County State Park, Indiana",
    "stateSlug": "in",
    "stateName": "Indiana",
    "citySlug": "nashville",
    "cityName": "Nashville",
    "description": "Nicknamed the 'Little Smokies', this park is famous for its rolling hills and sweeping autumn vistas.",
    "coordinates": { "lat": 39.1678, "lng": -86.2308 },
    "historicalPeak": "Mid October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Bloomington, IN", "distanceEstimate": "30 minutes" }]
  },
  {
    "slug": "hocking-hills",
    "name": "Hocking Hills State Park, Ohio",
    "stateSlug": "oh",
    "stateName": "Ohio",
    "citySlug": "logan",
    "cityName": "Logan",
    "description": "Deep gorges, recess caves, and waterfalls illuminated by towering yellow and red hardwood trees.",
    "coordinates": { "lat": 39.4312, "lng": -82.5393 },
    "historicalPeak": "Late October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Columbus, OH", "distanceEstimate": "1 hour" }]
  },
  {
    "slug": "zion-national-park",
    "name": "Zion National Park, Utah",
    "stateSlug": "ut",
    "stateName": "Utah",
    "citySlug": "springdale",
    "cityName": "Springdale",
    "description": "Vibrant cottonwoods and maples contrast stunningly against the towering red sandstone cliffs.",
    "coordinates": { "lat": 37.2982, "lng": -113.0263 },
    "historicalPeak": "Early November",
    "currentStatus": "Just Starting",
    "nearbyCities": [{ "name": "St. George, UT", "distanceEstimate": "1 hour" }]
  },
  {
    "slug": "alpine-loop",
    "name": "Alpine Loop Scenic Byway, Utah",
    "stateSlug": "ut",
    "stateName": "Utah",
    "citySlug": "sundance",
    "cityName": "Sundance",
    "description": "A winding mountain road featuring spectacular golden aspens with Mount Timpanogos in the background.",
    "coordinates": { "lat": 40.3916, "lng": -111.5832 },
    "historicalPeak": "Late September",
    "currentStatus": "Near Peak",
    "nearbyCities": [{ "name": "Provo, UT", "distanceEstimate": "30 minutes" }]
  },
  {
    "slug": "seattle-japanese-garden",
    "name": "Seattle Japanese Garden, Washington",
    "stateSlug": "wa",
    "stateName": "Washington",
    "citySlug": "seattle",
    "cityName": "Seattle",
    "description": "A stunning urban oasis showcasing vibrant Japanese maples during the fall season.",
    "coordinates": { "lat": 47.6293, "lng": -122.2965 },
    "historicalPeak": "Late October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Seattle, WA", "distanceEstimate": "0 minutes" }]
  },
  {
    "slug": "portland-japanese-garden",
    "name": "Portland Japanese Garden, Oregon",
    "stateSlug": "or",
    "stateName": "Oregon",
    "citySlug": "portland",
    "cityName": "Portland",
    "description": "Famous for its intricately maintained maples that turn a fiery red each autumn.",
    "coordinates": { "lat": 45.5188, "lng": -122.7083 },
    "historicalPeak": "Late October",
    "currentStatus": "Patchy",
    "nearbyCities": [{ "name": "Portland, OR", "distanceEstimate": "0 minutes" }]
  }
];

// Add the new locations if they don't already exist
let addedCount = 0;
for (const newLoc of newLocations) {
  if (!locations.find(l => l.slug === newLoc.slug)) {
    locations.push(newLoc);
    addedCount++;
  }
}

if (addedCount > 0) {
  fs.writeFileSync(locationsPath, JSON.stringify(locations, null, 2));
  console.log(`Added ${addedCount} new locations for SEO expansion.`);
} else {
  console.log('No new locations added. They may already exist.');
}
