const fs = require('fs');
const content = fs.readFileSync('explorefall-map.js', 'utf8');
const urls = content.match(/['"`][a-zA-Z0-9_/:.-]+(?:json|pbf|mvt|png|jpg)['"`]/g);
if (urls) console.log(Array.from(new Set(urls)).join('\n'));
