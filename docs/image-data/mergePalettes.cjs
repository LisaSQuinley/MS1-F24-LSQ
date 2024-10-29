const fs = require('fs');
const path = require('path');

// Function to read a JSON file and return its content
function readJsonFile(filePath) {
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

// Function to write a JSON object to a file
function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Main function to merge palettes into GeoJSON
function mergePalettesIntoGeoJSON(geojsonPath, palettesPath, outputPath) {
  const geoData = readJsonFile(geojsonPath);
  const palettesData = readJsonFile(palettesPath);

  // Create a map from palettes data for quick lookup
  const palettesMap = {};
  for (const palette of palettesData) {
    palettesMap[palette.Nudi_id] = palette.palettes;
  }

  // Iterate through the features in the GeoJSON and add palettes if available
  for (const feature of geoData.features) {
    const nudiId = feature.properties.Nudi_id;
    if (palettesMap[nudiId]) {
      feature.properties.palettes = palettesMap[nudiId]; // Add palettes to properties
    }
  }

  // Write the updated GeoJSON to a new file
  writeJsonFile(outputPath, geoData);
  console.log(`Updated GeoJSON has been written to ${outputPath}`);
}

// Specify the paths to your files
const geojsonPath = path.resolve(__dirname, 'data.geojson');
const palettesPath = path.resolve(__dirname, 'palettes.json');
const outputPath = path.resolve(__dirname, 'updated_data.geojson');

// Run the merging function
mergePalettesIntoGeoJSON(geojsonPath, palettesPath, outputPath);
