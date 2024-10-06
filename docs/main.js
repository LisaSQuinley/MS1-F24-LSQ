let geoData;
d3.json("data.geojson").then(data => {
    geoData = data;
    const groupedData = groupDataByLocation(geoData);
    renderCircles(groupedData);
    displayTaxonomy(); // Call this once the data is loaded
}).catch(error => {
    console.error("Error loading GeoJSON data:", error);
});

const ProjectTitle = d3.select("body").append("div");
ProjectTitle.attr("id", "section")
  .style("margin-left", "50px")
  .append("h1")
  .text("Know Your Nudibranchs")
  .style("margin-top", "20px")
  .append("h2")
  .text("A Scuba Diver's Guide to Sea Slugs");

const ProjectOverview = d3.select("body").append("div");
ProjectOverview.attr("id", "section")
  .style("margin-left", "50px")
  .append("h3")
  .text("Project Overview")
  .append("p")
  .style("padding-bottom", "20px")
  .text(
    "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others)–some of these aspects are explored in my data visualization. Four highlights are visible here–a geographical map for location, a dot plot for illustrating depth at which these marine slugs can be found, its taxonomic name, and an image from the Smithsonian's collection."
  );

const mapwidth = 1920; // Set the width for your SVG
const mapheight = 800; // Set the height for your SVG

const Nudiprojection = d3
  .geoEquirectangular()
  .scale(400)
  .translate([mapwidth / 1.5, mapheight / 1.5]);
const Nudipath = d3.geoPath(Nudiprojection);


// Create a single SVG element
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", mapwidth)
  .attr("height", mapheight);

// Create a group for map layers
const mapGroup = svg.append("g").attr("class", "map-layer");

// Load and render the countries map
d3.json("ne_110m_admin_0_countries.json")
  .then((data) => {
    mapGroup
      .selectAll("path.country")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "country")
      .attr("d", Nudipath)
      .attr("fill", "white")
      .attr("stroke", "#262262")
      .attr("stroke-width", 0.5);
  });

// Load and render the ocean map
d3.json("ne_10m_ocean.json")
  .then((data) => {
    mapGroup
      .selectAll("path.ocean")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "ocean")
      .attr("d", Nudipath)
      .attr("fill", "#1C75BC")
      .attr("opacity", 0.2);
  });

function groupDataByLocation(data, threshold = 2) {
  const grouped = [];

  data.features.forEach(feature => {
    const latitude = feature.geometry.coordinates[1]; // GeoJSON is [lon, lat]
    const longitude = feature.geometry.coordinates[0];
    const sciName = feature.properties.sci_name || "No Scientific Name Available"; // Use placeholder if blank

    const existingGroup = grouped.find(group => {
      const latDiff = Math.abs(group.latitude - latitude);
      const longDiff = Math.abs(group.longitude - longitude);
      return latDiff < threshold && longDiff < threshold;
    });

    if (existingGroup) {
      existingGroup.count += 1; // Increase the count for the existing group
      existingGroup.scientificNames.push(sciName); // Add scientific name or placeholder
    } else {
      grouped.push({
        latitude: latitude,
        longitude: longitude,
        count: 1, // Start a new group
        scientificNames: [sciName] // Start with the current scientific name or placeholder
      });
    }
  });

  return grouped;
}

// Create a tooltip div
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "white")
  .style("border", "1px solid black")
  .style("padding", "5px")
  .style("font-family", '"Kodchasan", sans-serif')
  .style("font-weight", "600");

function renderCircles(groupedData) {
  const circleScale = d3.scaleSqrt()
    .domain([0, d3.max(groupedData, d => d.count)])
    .range([5, 60]);

  svg.selectAll("circle")
    .data(groupedData)
    .enter()
    .append("circle")
    .attr("cx", d => Nudiprojection([d.longitude, d.latitude])[0])
    .attr("cy", d => Nudiprojection([d.longitude, d.latitude])[1])
    .attr("r", d => circleScale(d.count))
    .attr("fill", "red")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("opacity", 0.7)
    .on("mouseover", function (event, d) {
      // Get the image content for the scientific names
      const images = d.scientificNames.map(sciName => {
          const nudi = geoData.features.find(f => f.properties.sci_name === sciName);
          return nudi && nudi.properties.image ? nudi.properties.image.content : null; // Adjust to your data structure
      }).filter(Boolean); // Filter out any null values
  
      // Shuffle and slice to get a random set of 10
      const randomImages = images.sort(() => 0.5 - Math.random()).slice(0, 10);
      
      // Create HTML for the images
      const imageHTML = randomImages.map(image => 
          `<img src="${image}" style="width: 100px; height: auto; margin: 2px; " alt="Image">`
      ).join('');
  
      tooltip.html(imageHTML) // Use the HTML with images
          .style("visibility", "visible")
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      
      d3.select(this).attr("stroke-width", 3).attr("stroke", "yellow");
  })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke-width", 1).attr("stroke", "white");
    });

  // Add text labels for each circle
  svg.selectAll("text")
    .data(groupedData)
    .enter()
    .append("text")
    .attr("x", d => Nudiprojection([d.longitude, d.latitude])[0]) // Center text on the circle
    .attr("y", d => Nudiprojection([d.longitude, d.latitude])[1]) // Center text on the circle
    .attr("dy", ".35em") // Vertical alignment
    .attr("text-anchor", "middle") // Center text horizontally
    .style("fill", "white") // Text color
    .style("font-size", "12px") // Font size
    .style("font-family", '"Kodchasan", sans-serif') // Font family
    .style("font-weight", "800") // Font weight
    .text(d => d.count); // Set the text to the count
}

const descriptionTaxonomy = d3.select("body").append("div");
descriptionTaxonomy
  .attr("id", "section")
  .style("margin-left", "50px")
  .append("h3")
  .style("padding-top", "20px")
  .text("Taxonomy")
  .append("p")
  .text(
    "The scientific system of classification for these lovely little sea slugs–their taxonomic levels and a brief overview. Click on any dot to view associated taxonomic names, that will highlight the levels in yellow."
  );

// Set up margins and dimensions for the SVG
const margin = { top: 20, right: 50, bottom: 20, left: 80 };
const width = 1920 - margin.left - margin.right;
const rectangleHeight = 40; // Height of each rectangle
// const labelSpacing = 20;

const taxonomicLevels = ['tax_kingdom', 'tax_phylum', 'tax_class', 'tax_subclass', 'tax_order', 'tax_family', 'title'];


// Define custom x-coordinates for each column
const columnPositions = [
  0, // First column
  90, // Second column (adjust as needed)
  184, // Third column
  295, // Fourth column
  428, // Fifth column
  547, // Sixth column
  733, // Seventh column
];

const TaxonomicHeaders = d3.select("body").append("div")
  .attr("id", "TaxHeaders")
  .attr("width", width + margin.left + margin.right)
  .style("margin-left", "40px")  // Margin to the left
  .style("margin-bottom", "0px")
  .style("margin-top", "0px")
  .style("display", "flex") // Use flex to arrange items in a row
  .style("justify-content", "flex-start") // Align items to the start
  .style("align-items", "center"); // Align items vertically in the center

// Define specific widths for each Tax Header
const headerWidths = [
  "83.1328px", // Kingdom
  "100.6406px",  // Phylum
  "105.6797px",  // Class
  "137.438px",  // Subclass
  "112.82px",  // Order
  "173.016px",  // Family
  "160.367px",   // Genus & Species
  "1040.94px"  // Empty column
];

// Append headers with specific widths
["Kingdom", "Phylum", "Class", "Subclass", "Order", "Family", "Genus & Species", ""].forEach((text, index) => {
  TaxonomicHeaders.append("h4")
    .style("margin", "0") // Remove margin to prevent spacing issues
    .style("width", headerWidths[index]) // Set specific width for each header
    .style("text-align", "center") // Center text within the header
    .style("text-transform", "uppercase") // Convert text to uppercase
    .text(text);
});

// Create a container for taxonomic levels
const taxonomicContainer = d3.select("body")
  .append("div")
  .attr("id", "taxonomy-container")
  .style("display", "none") // Initially hidden
  .style("margin-left", "50px");

// Function to render taxonomic levels based on scientific names
function displayTaxonomyLevels(scientificNames) {
  taxonomicContainer.html(""); // Clear previous content

  scientificNames.forEach(sciName => {
    const nudi = geoData.features.find(f => f.properties.sci_name === sciName);
    if (nudi) {
      const levels = `
        <h4>${nudi.properties.tax_kingdom}</h4>
        <h4>${nudi.properties.tax_phylum}</h4>
        <h4>${nudi.properties.tax_class}</h4>
        <h4>${nudi.properties.tax_subclass}</h4>
        <h4>${nudi.properties.tax_order}</h4>
        <h4>${nudi.properties.tax_family}</h4>
      `;
      taxonomicContainer.append("div")
        .html(levels)
        .style("background-color", "yellow") // Highlight background
        .style("margin-bottom", "10px");
    }
  });

  taxonomicContainer.style("display", "block"); // Show the container
}


function displayTaxonomy() {
  const totalHeight = geoData.features.length * rectangleHeight + margin.top + margin.bottom;
  const svg = d3.select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", totalHeight)
    .append("g")
    .attr("transform", `translate(25,${margin.top})`);

  const RectMargin = { top: 3, right: 3, bottom: 3, left: 3 };

  taxonomicLevels.forEach((level, index) => {
    const textWidths = geoData.features.map(feature => {
      // Access the specific property dynamically
      const textValue = feature.properties[level] || "No information available"; // Default if missing
    
      // Create a temporary text element to measure width
      const textElement = svg.append("text")
        .attr("class", `${level}-label`)
        .style("font-size", "12px")
        .style("font-family", '"Kodchasan", sans-serif')
        .style("font-weight", "600")
        .text(textValue);
      
      // Get the width of the text
      const width = textElement.node().getBBox().width;
      textElement.remove(); // Remove the temporary text element
      
      return width;
    });
  
    svg.selectAll(`.${level}`)
      .data(geoData.features)
      .enter()
      .append("rect")
      .attr("class", level)
      .attr("x", columnPositions[index])
      .attr("y", (feature, i) => i * rectangleHeight - RectMargin.top - RectMargin.bottom - 2)
      .attr("width", (feature, i) => textWidths[i] + RectMargin.left * 4 + RectMargin.right * 4)
      .attr("height", rectangleHeight - RectMargin.top - RectMargin.bottom)
      .on("mouseover", function () {
        // Highlight only if it's a title rectangle
        if (d3.select(this).classed('title')) {
          d3.select(this)
            .attr("stroke-width", 3)
            .attr("stroke", "white");
        }
      })
      .on("mouseout", function () {
        // Remove highlight only if it's a title rectangle
        if (d3.select(this).classed('title')) {
          d3.select(this).attr("stroke-width", 0);
        }
      })
      .on("click", function (event, feature) {
        // Check if the clicked element has the class 'title'
        if (d3.select(this).classed('title')) {
          showNudi(feature.properties); // Pass the properties of the feature only for 'title' class
        }
      });
  });
  
  

  // Create labels for each taxonomic level
  taxonomicLevels.forEach((level, index) => {
    svg.selectAll(`.${level}-label`)
      .data(geoData.features)
      .enter()
      .append("text")
      .attr("class", `${level}-label`)
      .attr("x", columnPositions[index] + 5 + RectMargin.left + RectMargin.right)
      .attr("y", (feature, i) => i * rectangleHeight + 2 + RectMargin.top + RectMargin.bottom)
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "white")
      .style("font-family", '"Kodchasan", sans-serif')
      .style("font-weight", "600")
      .text(feature => {
        const value = feature.properties[level];
        if (level === "tax_family" && value === null) {
          return "No information available";
        }
        return level === "tax_subclass" ? "Heterobranchia " : value || "No information available"; // Handle nulls
      });
  });




  const Credits = d3.select("body").append("div");
  Credits.attr("id", "section")
    .style("margin-left", "50px");

  Credits.append("h3")
    .text("Credits")
    .style("margin-top", "0px");

  // Append the first paragraph
  Credits.append("p")
    .text("Images and Nudibranch Data from the Smithsonian Institution");

  // Append the second paragraph
  Credits.append("p")
    .text("Map polygons from Natural Earth");

  Credits.append("p")
    .text("Visualization created by Lisa Sakai Quinley");


}

function showNudi(nudi) {
  // Remove any existing image
  d3.select("#nudi-dish").remove();
  // Append a new div for the image
  const NudiContainer = d3
    .select("body")
    .append("div")
    .attr("id", "nudi-dish")
    .style("position", "fixed")
    .style("top", "50%")
    .style("right", "50%")
    .style("transform", "translate(99%, -50%)")
    .style("display", "flex") // Use flexbox
    .style("flex-direction", "column") // Stack items vertically
    .style("align-items", "flex-end") // Align items to the right
    .style("z-index", 1000);

  // Append the image
  const image = NudiContainer.append("img")
    .attr("src", nudi.image.content || "") // Use the image content 
    .attr("alt", "Taxonomic Image")
    .style("font-family", '"Kodchasan", sans-serif')
    .style("max-width", "950px")
    .style("max-height", "900px")
    .style("height", "auto")
    .style("border", "2px solid white")
    .on("load", function () {
      const imageWidth = this.width; // Get the width of the loaded image
      infoDiv.style("width", imageWidth + "px"); // Set the info div width
    })
    .on("error", function () {
      d3.select(this)
        .attr("src", "")
        .style("width", "500px")
        .style("height", "75px")
        .attr("alt", "No available image")
        .style("background-color", "gray")
        .style("display", "flex")
        .style("align-items", "center")
        .style("justify-content", "center")
        .text("No available image")
        .style("color", "white");

      // Set the width of infoDiv even if the image fails to load
      infoDiv.style("width", "500px"); // Set a default width or match the failed image dimensions
    });

  // Append the info div
  const infoDiv = NudiContainer.append("div")
    .attr("id", "nudi-info")
    .style("border", "2px solid white")
    .style("padding-top", "5px")
    .style("padding-bottom", "25px")
    .style("background-color", "black")
    .attr("display", "flex")
    .style("width", image.node().width + "px"); // Set the width to match the image

  // Add the scientific name
  infoDiv
    .append("h2")
    .style("color", "white")
    .style("padding-top", "15px")
    .text(nudi.sci_name || "Scientific Name Not Available");

  // Create a new div for extra info
  const extraNudiInfo = infoDiv
    .append("div") // Correctly reference the new div
    .attr("id", "extra_nudi_info");

  extraNudiInfo
    .append("h3")
    .style("color", "white")
    .style("padding-top", "0")
    .text("Depth");

  // Add depth information
  extraNudiInfo
    .append("p")
    .style("color", "white")
    .style("padding-top", "0")
    .text(`${nudi.depth ? nudi.depth + " meters" : "Not Available"}`);

  extraNudiInfo
    .append("h3")
    .style("color", "white")
    .style("padding-top", "0")
    .text("Place");
    extraNudiInfo
    .append("p")
    .style("color", "white")
    .style("padding-top", "0")
    .text(`${nudi.place || "Not Available"}`);


// Create close button
NudiContainer.append("button")
  .text("Close")
  .style("position", "absolute")
  .style("top", "10px") // Adjusted position
  .style("right", "10px") // Adjusted position
  .style("z-index", 2000) // Increased z-index
  .style("background-color", "white")
  .style("padding", "10px")
  .style("border", "0px")
  .style("cursor", "pointer")
  .style("font-size", "16px")
  .style("font-family", '"Kodchasan", sans-serif')
  .style("font-weight", "600")
  .on("click", function () {
    d3.select("#nudi-dish").remove();
  });

}
/* 
Vibrant.from('./image-data/images/ld1-1643411352667-1643411353012-1.jpg').getPalette()
  .then(palette => {
    console.log(palette);
  })
  .catch(err => {
    console.error('Error:', err);
  });
 */

  const fs = require('fs');
  const path = require('path');
  const Vibrant = require('node-vibrant');
  
  const imagesFolder = './image-data/images';
  
  fs.readdir(imagesFolder, (err, files) => {
    if (err) {
      return console.error('Error reading directory:', err);
    }
  
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
    });
  
    imageFiles.forEach(file => {
      const imagePath = path.join(imagesFolder, file);
  
      Vibrant.from(imagePath).getPalette()
        .then(palette => {
          console.log(`Palette for ${file}:`, palette);
        })
        .catch(err => {
          console.error(`Error processing ${file}:`, err);
        });
    });
  });
  