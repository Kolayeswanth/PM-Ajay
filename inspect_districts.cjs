const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/india_districts.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);

    if (json.features && json.features.length > 0) {
        // Search for Andhra
        const andhra = json.features.find(f => f.properties.NAME_1 && f.properties.NAME_1.includes('Andhra'));
        console.log("Found Andhra Feature:", andhra ? andhra.properties : "Not Found");

        // Search for Telangana (just in case)
        const telangana = json.features.find(f => f.properties.NAME_1 && f.properties.NAME_1.includes('Telangana'));
        console.log("Found Telangana Feature:", telangana ? telangana.properties : "Not Found");

        console.log("Total Features:", json.features.length);
    } else {
        console.log("No features found.");
    }
} catch (err) {
    console.error("Error:", err);
}
