const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/india_states.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    if (json.features) {
        console.log("Found " + json.features.length + " features.");
        const stateNames = json.features.map(f => f.properties.NAME_1).sort();
        console.log("State Names in GeoJSON:");
        stateNames.forEach(name => console.log(name));
    } else {
        console.log("No features found in GeoJSON.");
    }
} catch (err) {
    console.error("Error reading or parsing file:", err);
}
