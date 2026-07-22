const fs = require('fs');

const stateMap = {
    'alabama': 'al', 'alaska': 'ak', 'arizona': 'az', 'arkansas': 'ar', 'california': 'ca',
    'colorado': 'co', 'connecticut': 'ct', 'delaware': 'de', 'florida': 'fl', 'georgia': 'ga',
    'hawaii': 'hi', 'idaho': 'id', 'illinois': 'il', 'indiana': 'in', 'iowa': 'ia',
    'kansas': 'ks', 'kentucky': 'ky', 'louisiana': 'la', 'maine': 'me', 'maryland': 'md',
    'massachusetts': 'ma', 'michigan': 'mi', 'minnesota': 'mn', 'mississippi': 'ms',
    'missouri': 'mo', 'montana': 'mt', 'nebraska': 'ne', 'nevada': 'nv', 'new-hampshire': 'nh',
    'new-jersey': 'nj', 'new-mexico': 'nm', 'new-york': 'ny', 'north-carolina': 'nc',
    'north-dakota': 'nd', 'ohio': 'oh', 'oklahoma': 'ok', 'oregon': 'or', 'pennsylvania': 'pa',
    'rhode-island': 'ri', 'south-carolina': 'sc', 'south-dakota': 'sd', 'tennessee': 'tn',
    'texas': 'tx', 'utah': 'ut', 'vermont': 'vt', 'virginia': 'va', 'washington': 'wa',
    'west-virginia': 'wv', 'wisconsin': 'wi', 'wyoming': 'wy'
};

const locs = require('../src/data/locations.json');

let updated = 0;
locs.forEach(l => {
    if (l.stateSlug.length > 2 && stateMap[l.stateSlug]) {
        l.stateSlug = stateMap[l.stateSlug];
        updated++;
    }
});

fs.writeFileSync('./src/data/locations.json', JSON.stringify(locs, null, 4));
console.log(`Updated ${updated} locations to use state abbreviations.`);
