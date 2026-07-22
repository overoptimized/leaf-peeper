const fs = require('fs');
const path = require('path');

const markdownPath = 'C:\\Users\\L\\.gemini\\antigravity\\brain\\d3d90b10-454a-43d4-9e1b-53b541ef89f4\\fall_foliage_byways.md';
const drivesPath = path.join(__dirname, '../src/data/drives.json');
const statesPath = path.join(__dirname, '../src/data/states.json');

const markdown = fs.readFileSync(markdownPath, 'utf-8');
const drives = require(drivesPath);
const statesData = require(statesPath);

// Create a mapping of state names to slugs
const stateMap = {};
statesData.forEach(state => {
  stateMap[state.stateName.toLowerCase()] = state.stateSlug;
  stateMap[state.stateSlug.toLowerCase()] = state.stateSlug;
});

const lines = markdown.split('\n');
let currentRegion = '';
const existingSlugs = new Set(drives.map(d => d.slug));
let addedCount = 0;

for (const line of lines) {
  if (line.startsWith('## ')) {
    currentRegion = line.replace('## ', '').trim();
    // Clean up emojis from region name
    currentRegion = currentRegion.replace(/^[\p{Emoji}\s]+/u, '').trim();
  } else if (line.startsWith('* **')) {
    const match = line.match(/^\* \*\*(.*?)\s*\((.*?)\)\*\*: (.*)$/);
    if (match) {
      const name = match[1].trim();
      const statesStr = match[2].trim();
      const description = match[3].trim();
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      if (!existingSlugs.has(slug)) {
        // Parse states
        const stateRawArr = statesStr.split(',').map(s => s.trim().toLowerCase().replace('etc.', '').trim()).filter(s => s.length > 0);
        const states = [];
        
        for (const raw of stateRawArr) {
          if (stateMap[raw]) {
            states.push(stateMap[raw]);
          } else {
            // Check if it's a known abbreviation
            if (raw.length === 2) {
              states.push(raw);
            } else {
              console.warn(`Unmapped state: ${raw} for ${name}`);
            }
          }
        }
        
        const newDrive = {
          slug,
          name,
          region: currentRegion,
          states,
          description,
          highlights: [],
          locations: []
        };
        
        drives.push(newDrive);
        existingSlugs.add(slug);
        addedCount++;
      }
    }
  }
}

fs.writeFileSync(drivesPath, JSON.stringify(drives, null, 2));
console.log(`Successfully added ${addedCount} new byways to drives.json`);
