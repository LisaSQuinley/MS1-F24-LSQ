
import fs from 'fs/promises';
import path from 'path';
import Vibrant from 'node-vibrant';

const imageFolder = "./image-data/images";
// d3.json("data.geojson").then((data) => {
//     geoData = data;
  
  // const NudiDivs = d3.select("#NudiDivs");
  const groupedPalettes = await extractPalettes();
  console.log("GROUPED PALETTE ", groupedPalettes); 
  const groupedPaletterString = JSON.stringify(groupedPalettes);
  // console.log("GROUPED PALETTE STRINGS", groupedPaletterString); 
  // const fs = require('fs');
  // fetchData();

  fs.writeFile("vibrant.json", groupedPaletterString, (err) => {
    if(err){
      // console.log("error writing file", err);
      console.log("error")
    }
});
  
    // initializeVisualization(NudiDivs, geoData);
  // });




async function fetchData() {
  const filePath = path.resolve('./data.geojson');  // Get the absolute file path
  try {
    const data = await fs.readFile(filePath, 'utf8');  // Read the file content as string
    const jsonData = JSON.parse(data);  // Parse the string into JSON
    // console.log(jsonData);  // Do something with the parsed JSON data
    return jsonData;
  } catch (err) {
    console.error('Error reading file:', err);
  }
}


async function fetchImageData() {
  console.log("fetching data");
  const response = await fetchData(); 
  return await response;
}

async function getImageFiles() {
  const imageData = await fetchImageData();
  return imageData.features
    .map((feature) => {
      const id = feature.properties.Nudi_id;
      return {
        url: id ? `${imageFolder}/${id}.jpg` : null,
        title: feature.properties.title,
        id: id,
      };
    })
    .filter((item) => item.url !== null);
}

async function extractPalettes() {
  const imageFiles = await getImageFiles();
  const groupedPalettes = [];

  for (const { url, title, Nudi_id } of imageFiles) {
    try {
      const vibrant = new Vibrant(url);
      const palette = await vibrant.getPalette();

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
          // console.log("pushed ", swatch); 
          groupedPalettes.push({
            url,
            title,
            Nudi_id,
            key,
            swatch,
          });
        }
      }

    } catch (err) {
      console.error(`Error processing image ${url}:`);
    }
  }
  // console.log(groupedPalettes); 
  return groupedPalettes;
}