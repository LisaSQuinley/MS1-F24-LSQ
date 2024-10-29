const fs = require('fs');
const path = require('path'); // Import path for file handling
const Vibrant = require('node-vibrant'); // Import Vibrant

const imageFolder = "./image-data/images"; // Define the image folder globally

async function fetchImageData() {
  const filePath = path.resolve(__dirname, 'data.geojson'); // Get absolute path
  const data = fs.readFileSync(filePath, 'utf-8'); // Read the GeoJSON file
  return JSON.parse(data); // Parse and return JSON
}

async function getImageFiles() {
  const imageData = await fetchImageData();
  return imageData.features.map(feature => {
    const id = feature.properties.Nudi_id;
    return {
      url: id ? `${imageFolder}/${id}.jpg` : null,
      title: feature.properties.title,
      id: id,
    };
  }).filter(item => item.url !== null);
}

async function extractPalettes() {
  const imageFiles = await getImageFiles();
  const groupedPalettes = [];

  for (const { url, title, id: Nudi_id } of imageFiles) {
    console.log(`Fetching image from: ${url}`); // Debugging log

    try {
      const palette = await Vibrant.from(url).getPalette(); // Get the palette from the image

      const paletteData = {
        Nudi_id,
        palettes: []
      };

      const paletteKeys = [
        "Vibrant",
        "DarkVibrant",
        "LightVibrant",
        "Muted",
        "DarkMuted",
        "LightMuted",
      ];

      for (const key of paletteKeys) {
        const swatch = palette[key];
        if (swatch) {
          paletteData.palettes.push({
            key,
            swatch: swatch.getRgb() // Get RGB values
          });
        }
      }

      groupedPalettes.push(paletteData);
    } catch (err) {
      console.error(`Error processing image ${url}:`, err);
    }
  }

  // Write the JSON data to a file
  fs.writeFileSync('palettes.json', JSON.stringify(groupedPalettes, null, 2));
  console.log('palettes.json has been created successfully.');
}

if (require.main === module) {
  extractPalettes();
}
