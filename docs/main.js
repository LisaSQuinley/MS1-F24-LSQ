function displayTaxonomy() {
  return new Promise((resolve, reject) => {
    // Your existing logic to render taxonomy levels

    // At the end of your processing
    resolve(); // Resolve the promise when done
  });
}

// Main data loading and rendering logic
d3.json("data.geojson")
  .then((data) => {
    geoData = data;
    const groupedData = groupDataByLocation(geoData);
    renderCircles(groupedData);

    // Call displayTaxonomy and extractPalettes in order
    displayTaxonomy()
      .then(() => {
        return extractPalettes(palettesDiv);
      })
      .then(() => {
        // Now append the footer
        appendFooter();
      })
      .catch((error) => {
        console.error("Error during rendering:", error);
      });
  })
  .catch((error) => {
    console.error("Error loading GeoJSON data:", error);
  });

const ProjectTitle = d3.select("header").append("div");

ProjectTitle.attr("id", "title")
  .style("margin-left", "0px")
  .style("background-color", "#f1f1f1") // Optional: Add background color for styling
  .style("text-align", "center") // Optional: Center text
  .style("padding", "10px");

ProjectTitle.append("h1")
  .text("Know Your Nudibranchs")
  .style("display", "inline");

ProjectTitle.append("h2")
  .text("A Scuba Diver's Guide to Sea Slugs")
  .style("display", "inline");

const ProjectOverview = d3
  .select("body")
  .append("div")
  .attr("id", "section")
  .style("padding-top", "90px")
  .style("margin", "0 auto") // Center the div horizontally
  .style("max-width", "1920px") // Set a maximum width
  .append("h3")
  .text("Project Overview")
  .append("p")
  .style("padding-bottom", "20px")
  .text(
    "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others) – some of these aspects are explored in my data visualization. Four highlights are visible here – a geographical map for location, a dot plot for illustrating depth at which these marine slugs can be found, its taxonomic name, and an image from the Smithsonian's collection."
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
d3.json("ne_110m_admin_0_countries.json").then((data) => {
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
d3.json("ne_10m_ocean.json").then((data) => {
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

  data.features.forEach((feature) => {
    const latitude = feature.geometry.coordinates[1]; // GeoJSON is [lon, lat]
    const longitude = feature.geometry.coordinates[0];
    const id = feature.properties.Nudi_id || "No Scientific Name Available"; // Use placeholder if blank

    const existingGroup = grouped.find((group) => {
      const latDiff = Math.abs(group.latitude - latitude);
      const longDiff = Math.abs(group.longitude - longitude);
      return latDiff < threshold && longDiff < threshold;
    });

    if (existingGroup) {
      existingGroup.count += 1; // Increase the count for the existing group
      existingGroup.Nudi_id.push(id); // Push id to the existing group
    } else {
      grouped.push({
        latitude: latitude,
        longitude: longitude,
        count: 1, // Start a new group
        Nudi_id: [id], // Start with the current scientific name or placeholder
      });
    }
  });

  return grouped;
}

// Create a tooltip div
const mapTooltip = d3
  .select("body")
  .append("div")
  .attr("class", "mapTooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "black")
  .style("padding", "5px")
  .style("font-family", '"Kodchasan", sans-serif')
  .style("font-weight", "600");

function renderCircles(groupedData) {
  console.log(groupedData);
  const circleScale = d3
    .scaleSqrt()
    .domain([0, d3.max(groupedData, (d) => d.count)])
    .range([5, 60]);

  svg
    .selectAll("circle")
    .data(groupedData)
    .enter()
    .append("circle")
    .attr("cx", (d) => Nudiprojection([d.longitude, d.latitude])[0])
    .attr("cy", (d) => Nudiprojection([d.longitude, d.latitude])[1])
    .attr("r", (d) => circleScale(d.count))
    .attr("fill", "red")
    .attr("opacity", 0.7)
    .attr("class", (d) => {
      return d.Nudi_id.map((id) => {
        const nudi = geoData.features.find((f) => f.properties.sci_name === id);
        return nudi
          ? nudi.properties.Nudi_id.replace(/\s+/g, "_").replace(/[()]/g, "")
          : null;
      })
        .filter(Boolean)
        .join(" ");
    })

    .on("mouseover", function (event, d) {
      // Get the image content for the scientific names
      // console.log(d.Nudi_id);
      const images = d.Nudi_id.map((id) => {
        const nudi = geoData.features.find((f) => f.properties.Nudi_id === id);
        return nudi && nudi.properties.image_content
          ? nudi.properties.image_content
          : null; // Adjust to your data structure
      }).filter(Boolean); // Filter out any null values

      // Shuffle and slice to get a random set of 10
      const randomImages = images.sort(() => 0.5 - Math.random()).slice(0, 10);

      // Create HTML for the images
      const imageHTML = randomImages
        .map(
          (image_content) =>
            `<img src="${image_content}" style="width: 100px; height: auto; margin: 2px; " alt="Image">`
        )
        .join("");

      mapTooltip
        .html(imageHTML) // Use the HTML with images
        .style("visibility", "visible")
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");

      d3.select(this).attr("stroke-width", 3).attr("stroke", "white");
    })
    .on("mouseout", function () {
      mapTooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke", "none");
    })
    .on("click", function (event, d) {
      // Remove existing highlights first
      d3.selectAll("rect").attr("stroke", "none");
      d3.selectAll("circle").attr("stroke", "none");
      d3.selectAll("div").style("border", "none");

      // Highlight the clicked rectangle
      d3.select(this).attr("stroke-width", 3).attr("stroke", "yellow");

      d.Nudi_id.forEach((i) => {
        //console.log(i);
        d3.selectAll(`rect.${i}`).attr("stroke-width", 3).attr("stroke", "yellow");
        d3.selectAll(`div.${i}`).style("border", "3px solid yellow"); 
      }) 
    });

  // Add text labels for each circle
  svg
    .selectAll("text")
    .data(groupedData)
    .enter()
    .append("text")
    .attr("x", (d) => Nudiprojection([d.longitude, d.latitude])[0]) // Center text on the circle
    .attr("y", (d) => Nudiprojection([d.longitude, d.latitude])[1]) // Center text on the circle
    .attr("dy", ".35em") // Vertical alignment
    .attr("text-anchor", "middle") // Center text horizontally
    .style("fill", "white") // Text color
    .style("font-size", "12px") // Font size
    .style("font-family", '"Kodchasan", sans-serif') // Font family
    .style("font-weight", "800") // Font weight
    .text((d) => d.count); // Set the text to the count
}

const descriptionTaxonomy = d3.select("body").append("div");
descriptionTaxonomy
  .attr("id", "section")
  .append("h3")
  .style("padding-top", "20px")
  .text("The Many Faces and Names of Marine Slugs")
  .append("p")
  .text(
    "This displays the scientific system of classification for these lovely little sea slugs. Included are their taxonomic levels and a brief overview. Click on any dot to view associated taxonomic names, that will highlight the levels in yellow."
  );

// Set up margins and dimensions for the SVG
const margin = { top: 20, right: 50, bottom: 10, left: 80 };
const width = 1920 - margin.left - margin.right;
const rectangleHeight = 40; // Height of each rectangle
// const labelSpacing = 20;

const taxonomicLevels = [
  "tax_kingdom",
  "tax_phylum",
  "tax_class",
  "tax_subclass",
  "tax_order",
  "tax_family",
  "title",
];

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

const TaxonomicHeaders = d3
  .select("body")
  .append("div")
  .attr("id", "TaxHeaders")
  .attr("width", width + margin.left + margin.right)
  .style("margin-left", "82px") // Margin to the left
  .style("margin-bottom", "0px")
  .style("margin-top", "0px")
  .style("display", "flex") // Use flex to arrange items in a row
  .style("justify-content", "flex-start") // Align items to the start
  .style("align-items", "center"); // Align items vertically in the center

// Define specific widths for each Tax Header
const headerWidths = [
  "83.1328px", // Kingdom
  "100.6406px", // Phylum
  "105.6797px", // Class
  "137.438px", // Subclass
  "112.82px", // Order
  "173.016px", // Family
  "160.367px", // Genus & Species
  "1040.94px", // Empty column
];

// Append headers with specific widths
[
  "Kingdom",
  "Phylum",
  "Class",
  "Subclass",
  "Order",
  "Family",
  "Genus & Species",
  "",
].forEach((text, index) => {
  TaxonomicHeaders.append("h4")
    .style("margin", "0") // Remove margin to prevent spacing issues
    .style("width", headerWidths[index]) // Set specific width for each header
    .style("text-align", "center") // Center text within the header
    .text(text);
});

// Create a container for taxonomic levels
const taxonomicContainer = d3
  .select("body")
  .append("div")
  .attr("id", "taxonomy-container")
      // CHANGE THIS BACK TO VISIBLE
  .style("display", "visible")
  .style("margin-left", "50px");

const PaletteDescription = d3.select("body").append("div");
PaletteDescription.attr("id", "section")
  .append("h3")
  .style("padding-top", "20px")
  .text("Unveiling the Vibrant Palette of Nudies")
  .append("p")
  .text(
    "Using Vibrant.js to extract color palettes from images of nudibranchs, I then grouped each swatch from the palettes by a dominant color category. Each image had a palette of six swatches generated: Vibrant, Muted, DarkVibrant, DarkMuted, LightVibrant, LightMuted. Hover over a color to see what nudibranch image it's generated from. Click on any color palette to view the colors extracted from the image."
  );
// Create a container for palettes
const paletteContainer = d3
  .select("body")
  .append("div")
  .attr("id", "palette-container")
  .style("display", "block");
// Append a footer with credits
const Credits = d3.select("body").append("footer"); // Change 'div' to 'footer'
Credits.attr("id", "footer")
  .style("margin-left", "0px")
  .style("background-color", "#f1f1f1") // Optional: Add background color for styling
  .style("text-align", "center") // Optional: Center text
  .style("padding", "10px"); // Optional: Add padding

Credits.append("h3")
  .text("Credits ")
  .style("font-weight", "700")
  .style("margin-top", "0px")
  .style("margin-left", "0px")
  .style("margin-right", "0px")
  .style("display", "inline");

Credits.append("p")
  .text(
    "Images and Nudibranch Data from the Smithsonian Institution  |  Map polygons from Natural Earth  |  Visualization created by Lisa Sakai Quinley"
  )
  .style("margin-left", "0px")
  .style("margin-right", "0px")
  .style("display", "inline");

// Function to render taxonomic levels based on scientific names
function displayTaxonomyLevels(Nudi_id) {
  taxonomicContainer.html(""); // Clear previous content

  Nudi_id.forEach((id) => {
    const nudi = geoData.features.find((f) => f.properties.sci_name === id);
    if (nudi) {
      const levels = `
        <h4>${nudi.properties.tax_kingdom}</h4>
        <h4>${nudi.properties.tax_phylum}</h4>
        <h4>${nudi.properties.tax_class}</h4>
        <h4>${nudi.properties.tax_subclass}</h4>
        <h4>${nudi.properties.tax_order}</h4>
        <h4>${nudi.properties.tax_family}</h4>
      `;
      taxonomicContainer
        .append("div")
        .html(levels)
        .style("background-color", "yellow"); // Highlight background
    }
  });

  taxonomicContainer.style("display", "block"); // Show the container
}

function displayTaxonomy() {
  const totalHeight =
    geoData.features.length * rectangleHeight + margin.top + margin.bottom;
  const svg = d3
    .select("#taxonomy-container")
    .append("svg")
    .attr("class", "taxonomy")
    .attr("width", width + margin.left + margin.right)
    .attr("height", totalHeight)
    .append("g")
    .attr("transform", `translate(25,${margin.top})`);

  const RectMargin = { top: 3, right: 3, bottom: 3, left: 3 };

  taxonomicLevels.forEach((level, index) => {
    const textWidths = geoData.features.map((feature) => {
      // Access the specific property dynamically
      const textValue = feature.properties[level] || "No information available"; // Default if missing

      // Create a temporary text element to measure width
      const textElement = svg
        .append("text")
        .attr("class", `${level} ${feature.properties.Nudi_id}`)
        .style("font-size", "12px")
        .style("font-family", '"Kodchasan", sans-serif')
        .style("font-weight", "600")
        .text(textValue);

      // Get the width of the text
      const width = textElement.node().getBBox().width;
      textElement.remove(); // Remove the temporary text element

      return width;
    });

    svg
      .selectAll(`.${level}`)
      .data(geoData.features)
      .enter()
      .append("rect")
      .attr("class", (d) => `${level} ${d.properties.Nudi_id}`)
      .attr("x", columnPositions[index])
      .attr(
        "y",
        (feature, i) =>
          i * rectangleHeight - RectMargin.top - RectMargin.bottom - 2
      )
      .attr(
        "width",
        (feature, i) =>
          textWidths[i] + RectMargin.left * 4 + RectMargin.right * 4
      )
      .attr("height", rectangleHeight - RectMargin.top - RectMargin.bottom)

      .on("click", function (event, feature) {
        // Reset previous selections
        svg.selectAll("rect").attr("stroke", "none");
        d3.selectAll("div").style("border", "none")

        // Highlight the clicked rectangle
        d3.select(this).attr("stroke-width", 3).attr("stroke", "yellow");

        // Call a function to display additional info, if needed
        showNudi(feature.properties);

        console.log(feature.properties.Nudi_id);

        d3.selectAll(`rect.${feature.properties.Nudi_id}`).attr("stroke-width", 3).attr("stroke", "yellow");
        d3.selectAll(`div.${feature.properties.Nudi_id}`).style("border", "3px solid yellow"); 

});
  });
// Create labels for each taxonomic level
taxonomicLevels.forEach((level, index) => {
  svg
    .selectAll(`.${level}-label`)
    .data(geoData.features)
    .enter()
    .append("text")
    .attr("class", (feature) => `${level} ${feature.properties.Nudi_id}`) // Add Nudi_id as a second class
    .attr(
      "x",
      columnPositions[index] + 5 + RectMargin.left + RectMargin.right
    )
    .attr(
      "y",
      (feature, i) =>
        i * rectangleHeight + 2 + RectMargin.top + RectMargin.bottom
    )
    .attr("dy", "0.35em")
    .style("font-size", "12px")
    .style("fill", "white")
    .style("font-family", '"Kodchasan", sans-serif')
    .style("font-weight", "600")
    .text((feature) => {
      const value = feature.properties[level];
      if (level === "tax_family" && value === null) {
        return "No information available";
      }
      return level === "tax_subclass"
        ? "Heterobranchia "
        : value || "No information available"; // Handle nulls
    });
});
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
    .attr("src", nudi.Nudi_id ? `${imageFolder}/${nudi.Nudi_id}.jpg` : "")
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
      d3.selectAll("rect").attr("stroke", "none");
      d3.selectAll("div").style("border", "none");
    });
}

document.addEventListener("DOMContentLoaded", async () => {
  const palettesDiv = paletteContainer.node();

  // Create a tooltip element
  const paletteTooltip = document.createElement("div");
  paletteTooltip.style.position = "absolute";
  paletteTooltip.style.fontFamily = "Kodchasan, sans-serif";
  paletteTooltip.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  paletteTooltip.style.color = "#fff";
  paletteTooltip.style.padding = "5px 10px";
  paletteTooltip.style.visibility = "hidden"; // Initially hidden
  paletteTooltip.style.pointerEvents = "none"; // Prevent mouse events
  document.body.appendChild(paletteTooltip);

  await extractPalettes(palettesDiv, paletteTooltip); // Pass the tooltip to the function
});

const imageFolder = "./image-data/images"; // The folder where your images are stored

async function fetchImageData() {
  const response = await fetch("./data.geojson");
  return await response.json();
}

async function getImageFiles() {
  const imageData = await fetchImageData();
  return imageData.features
    .map((feature) => {
      const id = feature.properties.Nudi_id;
      return {
        url: id ? `${imageFolder}/${id}.jpg` : null, // Construct the URL from the id
        title: feature.properties.title, // Use the title from the JSON
      };
    })
    .filter((item) => item.url !== null); // Filter out items with null URLs
}

async function extractPalettes(palettesDiv, paletteTooltip) {
  const imageFiles = await getImageFiles();
  const groupedPalettes = {};

  for (const { url, title } of imageFiles) {
    try {
      const vibrant = new Vibrant(url);
      const palette = await vibrant.getPalette();
      //console.log(palette); // Log the palette for debugging

      // Define the palette keys based on Vibrant.js classification
      const paletteKeys = [
        "Vibrant",
        "DarkVibrant",
        "LightVibrant",
        "Muted",
        "DarkMuted",
        "LightMuted",
      ];

      // Loop through palette keys to group by color category
      for (const key of paletteKeys) {
        const swatch = palette[key];
        if (swatch) {
          const colorCategory = getColorCategory(swatch); // Get the color category

          // Initialize the color category if it doesn't exist
          if (!groupedPalettes[colorCategory]) {
            groupedPalettes[colorCategory] = [];
          }

          // Add swatch to the corresponding category
          groupedPalettes[colorCategory].push({
            url,
            title,
            key, // Include the key for class assignment
            swatch,
          });
        }
      }
    } catch (err) {
      console.error(`Error processing image ${url}:`, err);
    }
  }

  // Now render the grouped palettes
  for (const [colorCategory, swatches] of Object.entries(groupedPalettes)) {
    const categoryContainer = document.createElement("div");
    categoryContainer.style.margin = "20px"; // Spacing around each category
    const categoryTitle = document.createElement("h4");
    categoryTitle.textContent = colorCategory; // Display the color category
    categoryContainer.appendChild(categoryTitle);

    const swatchContainer = document.createElement("div");
    swatchContainer.style.display = "flex";
    swatchContainer.style.flexWrap = "wrap";

    for (const { url, title, key, swatch } of swatches) {
      const colorBox = document.createElement("div");

      // Add classes: one for the Vibrant.js classification and one for the color category
      colorBox.classList.add(key.toLowerCase()); // e.g., 'vibrant', 'darkvibrant'
      colorBox.classList.add(colorCategory.toLowerCase()); // e.g., 'reds', 'greens'

      const imageId = url.split("/").pop().split(".")[0]; // Extract image ID from URL
      colorBox.classList.add(imageId); // Assign the ID as a class

      colorBox.style.backgroundColor = `rgb(${swatch.rgb.join(",")})`; // Use the RGB values
      colorBox.style.setProperty('box-sizing', 'border-box');
      colorBox.style.width = "50px";
      colorBox.style.height = "50px";
      colorBox.style.margin = "1px";
      colorBox.style.cursor = "pointer"; // Change cursor to pointer for clickable swatches

      // Show tooltip on mouse over
      colorBox.addEventListener("mouseover", (event) => {
        paletteTooltip.textContent = `${key} color for: ${title}`;
        paletteTooltip.style.visibility = "visible";
        paletteTooltip.style.left = `${event.pageX + 10}px`; // Position the tooltip
        paletteTooltip.style.top = `${event.pageY + 10}px`;
      });

      // Hide tooltip on mouse out
      colorBox.addEventListener("mouseout", () => {
        paletteTooltip.style.visibility = "hidden";
      });

      swatchContainer.appendChild(colorBox);
    }

    categoryContainer.appendChild(swatchContainer);
    palettesDiv.appendChild(categoryContainer);
  }

  return Promise.resolve();
}

function getColorCategory(swatch) {
  const rgb = swatch.getRgb(); // Get the RGB values
  const hsl = swatch.hsl; // Get the HSL values
  const [r, g, b] = rgb;
  const [h, s, l] = hsl;

  // Check for Whites
  if (s < 0.1 && l > 0.9) return "Whites"; // High lightness, low saturation
  if (r > 220 && g > 220 && b > 220) return "Whites"; // Almost white

  // Check for Blacks
  if (s < 0.1 && l < 0.1) return "Blacks"; // Low lightness, low saturation
  if (r < 40 && g < 40 && b < 40) return "Blacks"; // Almost black

  // Check for Reds
  if (r > 200 && g < 100 && b < 100) return "Reds"; // Brights like ketchup

  if (r < 160 && r > 100 && g < 130 && b < 100) return "Browns"; // Dark
  if (r < 200 && r > 150 && g > 130 && g < 190 && b > 100 && b < 160) return "Browns"; // Light

  if (r > 220 && g > 180 && b < 45) return "Yellows"; // Brights and Mustards

  if (r < 100 && g > 80 && g < 140 && b < 60) return "Greens"; // Dark

  //if (r < 200 && g < 200 && b > 100) return "Blues";

  if (r > 90 && r < 195 && g > 120 && g < 140 && b > 120) return "Purples";
  if (r > 90 && r < 195 && g < 100 && b > 120) return "Purples";


/* 
  // Check for Whites
  if (s < 0.1 && l > 0.9) return "Whites"; // High lightness, low saturation
  if (r > 220 && g > 220 && b > 220) return "Whites"; // Almost white

  // Check for Blacks
  if (s < 0.1 && l < 0.1) return "Blacks"; // Low lightness, low saturation
  if (r < 40 && g < 40 && b < 40) return "Blacks"; // Almost black

  // Check for Browns
  if (r > 100 && g < 100 && b < 100 && l < 0.5) return "Browns"; // Dark reds/browns
  if (r > 100 && g > 70 && b < 50) return "Browns"; // Brownish reds

  // Use HSL for main color categorization
  if (l > 0.5) {
    // Light colors
    if (h >= 0 && h < 15 / 360) return "Reds"; // Light red range
    if (h >= 15 / 360 && h < 45 / 360) return "Yellows"; // Light yellow range
    if (h >= 45 / 360 && h < 75 / 360) return "Oranges"; // Light orange range
    if (h >= 75 / 360 && h < 165 / 360) return "Greens"; // Light green range
    if (h >= 165 / 360 && h < 240 / 360) return "Blues"; // Light blue range
    if (h >= 240 / 360 && h < 300 / 360) return "Purples"; // Light purple range
  } else {
    // Dark colors
    if (h >= 0 && h < 15 / 360) return "Reds"; // Dark red range
    if (h >= 15 / 360 && h < 45 / 360) return "Yellows"; // Dark yellow range
    if (h >= 45 / 360 && h < 75 / 360) return "Oranges"; // Dark orange range
    if (h >= 75 / 360 && h < 165 / 360) return "Greens"; // Dark green range
    if (h >= 165 / 360 && h < 240 / 360) return "Blues"; // Dark blue range
    if (h >= 240 / 360 && h < 300 / 360) return "Purples"; // Dark purple range
  }
 */
  return "Other"; // Fallback if no category matches
}
