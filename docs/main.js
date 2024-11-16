let geoData = []; // Declare geoData in a higher scope
let groupedData = []; // Declare groupedData in a higher scope
let groupedPalettes = []; // Declare groupedPalettes in a higher scope
// Global variable to track which circles are currently displayed
let currentRendering = 'circles'; // Default to renderCircles

// Load GeoJSON data
d3.json("data.geojson").then((data) => {
  // Store geoData globally or in an accessible scope
  geoData = data; // Remove const to avoid creating a new variable

  // Group the data by location
  groupedData = groupDataByLocation(geoData);

  // Render circles (if you have a function for this)
  renderCircles(groupedData);

  // Load image files and extract palettes
  const NudiDivs = d3.select("#NudiDivs"); // Assuming you have a div for displaying palettes
  extractPalettes(NudiDivs, geoData); // Pass geoData here

/*   // Display the palettes WHAT AM I DOING WRONG HERE?
  const NudiColors = d3.select("#NudiColors"); // Assuming you have a div for displaying palettes
  CategorizedSwatches(NudiColors, geoData); // Pass geoData here */

  // Call the initialize function somewhere in your code
  initializeVisualization(NudiDivs, NudiColors, geoData);
});

const ProjectTitle = d3.select("header").append("div");


ProjectTitle.attr("id", "title")
  .style("margin-left", "0px")
  .style("background-color", "lightgray") // Optional: Add background color for styling
  .style("text-align", "left") // Optional: Center text
  .style("padding", "10px");

ProjectTitle.append("h1")
  .text("Know Your Nudibranchs")
  .style("padding-left", "15px")
  .style("display", "inline");

ProjectTitle.append("h2")
  .text("A Scuba Diver's Guide to Sea Slugs")
  .style("display", "inline");

// Create a new div for displaying palettes
const NudiDivs = d3
  .select("body")
  .append("div")
  .attr("id", "NudiDivs")
  .style("background", "black")
  .style("margin-bottom", "15px")
  .transition()
  .duration(3500)
  .style("opacity", 1);

const NudiColors = d3
  .select("body")
  .append("div")
  .attr("id", "NudiColors")
  .style("background", "white")
  .style("margin-bottom", "15px")
  .style("opacity", 1);  

// Initial dimensions
let mapwidth = window.innerWidth; // Width of the viewport
let mapheight = window.innerHeight; // Height of the viewport

const Nudiprojection = d3
  .geoMercator()
  .scale(mapwidth / 6.25)
  .center([0, 0])
  .translate([mapwidth / 2, mapheight / 2]);

const Nudipath = d3.geoPath(Nudiprojection);

// Create the graticule
const graticule = d3.geoGraticule10();

// Set up the SVG container
const mapsvg = d3
  .select("body")
  .append("svg")
  .attr("class", "map")
  .attr("width", mapwidth)
  .attr("height", mapheight);

// Style the SVG
mapsvg.style("opacity", 1);
mapsvg.style("margin-top", "10px");
mapsvg.style("display", "block");

// Append a group element to hold map layers (like graticule lines)
const graticuleGroup = mapsvg.append("g").attr("class", "map-layers").attr("class", "graticule");

// Draw the graticule lines
graticuleGroup
  .append("path")
  .datum(graticule) // Bind the graticule data
  .attr("d", Nudipath); // Generate the path using the projection


// Create a single SVG element
const svg = d3
  .select("body")
  .append("svg")
  .attr("class", "map")
  .attr("width", mapwidth)
  .attr("height", mapheight);

svg.style("opacity", 0);
svg.style("margin-top", "10px");
svg.style("display", "block");

// Create a group for the map layers
const mapGroup = svg.append("g").attr("class", "map-layers");

// Load and render the ocean map
d3.json("ne_10m_ocean.json").then((data) => {
  mapGroup
    .append("g")
    .attr("class", "ocean-layer")
    .selectAll("path.ocean")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class", "ocean")
    .attr("d", Nudipath)
    .attr("fill", "gray");

  svg.transition().duration(1000).style("opacity", 1);
});

// Create a group for the circles
const circlesGroup = svg.append("g").attr("class", "circles-layer");

// Update projection function
function updateProjection() {
  const mapwidth = window.innerWidth;
  const mapheight = window.innerHeight;

  Nudiprojection.scale(mapwidth / 6.25).translate([
    mapwidth / 2,
    mapheight / 2,
  ]);

  svg.selectAll("path.country").attr("d", Nudipath);
  svg.selectAll("path.ocean").attr("d", Nudipath);

  // Call renderCircles to update their positions and sizes
  renderCircles(groupedData); // Make sure groupedData is accessible
}

// Add resize event listener
window.addEventListener("resize", updateProjection);


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
  .style("padding", "5px");

function renderCircles(groupedData) {
  groupedData.forEach((d) => {
    d.selected = false; // New property to track selection
  });

  const circleScale = d3
    .scaleSqrt()
    .domain([0, d3.max(groupedData, (d) => d.count)])
    .range([5, Math.max(60, window.innerWidth / 50)]);

  // Join data for circles
  const circles = circlesGroup
    .selectAll("circle") // Use circlesGroup
    .data(groupedData);

  // Enter new circles
  circles
    .enter()
    .append("circle")
    .attr("cx", (d) => Nudiprojection([d.longitude, d.latitude])[0])
    .attr("cy", (d) => Nudiprojection([d.longitude, d.latitude])[1])
    .attr("r", (d) => circleScale(d.count))
    .attr("fill", "red")
    .attr("opacity", 0.7)
    .attr("class", (d) => d.Nudi_id.join(" "))
    .attr("stroke", (d) => (d.selected ? "#FFC000" : "none")) // Set initial stroke based on selection
    .on("mouseover", function (event, d) {
      const images = d.Nudi_id.map((id) => {
        const nudi = geoData.features.find((f) => f.properties.Nudi_id === id);
        return nudi && nudi.properties.image_content
          ? nudi.properties.image_content
          : null;
      }).filter(Boolean); // Filter out any null values

      const randomImages = images.sort(() => 0.5 - Math.random()).slice(0, 10);
      const imageHTML = randomImages
        .map(
          (image_content) =>
            `<img src="${image_content}" style="width: 100px; height: auto; margin: 2px;" alt="Image">`
        )
        .join("");

      mapTooltip
        .html(imageHTML)
        .style("visibility", "visible")
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px");

      d3.select(this).attr("stroke-width", 3).attr("stroke", "#FFC000");
    })
    .on("mouseout", function () {
      // Always hide the tooltip when the mouse leaves the circle
      mapTooltip.style("visibility", "hidden");
      // Reset stroke for the circle if it is not selected
      if (!d3.select(this).datum().selected) {
        d3.select(this).attr("stroke", "none");
      }
    })
    .on("click", function (event, d) {
      // Clear selected state of all circles
      groupedData.forEach((item) => {
        item.selected = false;

        // Reset background color for associated divs
        item.Nudi_id.forEach((i) => {
          d3.selectAll(`div.${i}`)
            .style("border", "20px solid black")
            .style("background-color", "black");
          d3.selectAll(`div.${i} h4`).style("color", "white");
          d3.selectAll(`div.${i} .AddDetails h5`).style("color", "white");
          d3.selectAll(`div.${i} p`).style("color", "white");
          d3.selectAll(`div.${i} .AddDetails`).style("border-top", "15px solid black");
          d3.selectAll(`div.${i} .NudiTaxonomy`).style("border-top", "15px solid black");
        });

        // Reset stroke for all circles
        d3.select(`circle.${item.Nudi_id.join(".")}`)
          .attr("stroke-width", 0)
          .attr("stroke", "none")
          .attr("opacity", 0.7);
      });

      // Select the clicked circle
      d.selected = true;
      d3.select(this)
        .attr("stroke-width", 3)
        .attr("stroke", "#FFC000")
        .attr("fill", "red")
        .attr("opacity", 1);

      // Update background color for associated divs of the selected circle
      d.Nudi_id.forEach((i) => {
        d3.selectAll(`div.${i}`)
          .style("border", "20px solid #FFC000")
          .style("background-color", "#FFC000");
        d3.selectAll(`div.${i} h4`).style("color", "black");
        d3.selectAll(`div.${i} .AddDetails h5`).style("color", "black");
        d3.selectAll(`div.${i} p`).style("color", "black");
        d3.selectAll(`div.${i} .AddDetails`).style("border-top", "15px solid #FFC000");
        d3.selectAll(`div.${i} .NudiTaxonomy`).style("border-top", "15px solid #FFC000");
      });
      // Reorder the associated divs to the top (move them to the top in the DOM)
      d.Nudi_id.forEach((id) => {
        const divs = d3.selectAll(`div.${id}`).nodes(); // Get all divs with class Nudi_id
        divs.forEach((div) => {
          const parent = div.parentNode; // Get the parent element
          parent.insertBefore(div, parent.firstChild); // Move div to the beginning of its parent's child list (top in the visual order)
        });
      });
    });

  // Update existing circles
  circles
    .attr("cx", (d) => Nudiprojection([d.longitude, d.latitude])[0])
    .attr("cy", (d) => Nudiprojection([d.longitude, d.latitude])[1])
    .attr("r", (d) => circleScale(d.count)); // Update radius

  // Remove any circles that are no longer needed
  circles.exit().remove();

  // Add or update text labels for each circle
  const texts = svg.selectAll("text").data(groupedData);

  // Enter new text labels
  texts
    .enter()
    .append("text")
    .attr("class", "count-label")
    .attr("x", (d) => Nudiprojection([d.longitude, d.latitude])[0])
    .attr("y", (d) => Nudiprojection([d.longitude, d.latitude])[1])
    .attr("dy", ".35em") // Vertical alignment
    .attr("text-anchor", "middle") // Center text horizontally
    .style("fill", "white") // Text color
    .style("font-size", "12px") // Font size
    .style("font-family", '"Kodchasan", sans-serif') // Font family
    .style("font-weight", "800") // Font weight
    .text((d) => d.count); // Set the text to the count

  // Update existing text labels
  texts
    .attr("x", (d) => Nudiprojection([d.longitude, d.latitude])[0])
    .attr("y", (d) => Nudiprojection([d.longitude, d.latitude])[1])
    .text((d) => d.count); // Update text to reflect new count

  // Remove any text labels that are no longer needed
  texts.exit().remove();
}


// Create a container for the toggleable sections
const toggleContainer = d3
  .select("body")
  .append("div")
  .attr("id", "toggleContainer")
  .style("position", "fixed")
  .style("left", "10px")
  .style("bottom", "80px"); // Adjust top margin

// Create each section with a toggle button
const sections = [
  {
    title: "Project Overview",
    content:
      "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others) – some of these aspects are explored in my data visualization. A few highlights are visible here – a geographical map for location which is also viewable by the most vibrant color in the nudie image (as analyzed through Vibrant.js), the taxonomic name of these marine slugs, and an image from the Smithsonian's collection.",
  },
  {
    title: "The Many Faces and Names of Marine Slugs",
    content:
      "This displays the scientific system of classification for these lovely little sea slugs. Included are their taxonomic levels and a brief overview. Click on any image to toggle down for more information. Hover over each label within the taxonomy to see the scientific name and the specific level.",
  },
  {
    title: "Unveiling the Vibrant Palette of Nudies",
    content:
      "Using Vibrant.js to extract color palettes from images of nudibranchs, I took the Vibrant swatch of each nudie and displayed it on the geographical map. Each image has a palette of six swatches generated: Vibrant, Muted, Dark Vibrant, Dark Muted, Light Vibrant, Light Muted. Hover over a color to see what nudibranch image it's generated from.",
  },
];

// Iterate through sections to create toggles
sections.forEach((section) => {
  const sectionDiv = toggleContainer
    .append("div")
    .attr("class", "toggle-section")
    .style("margin-bottom", "5px");

  sectionDiv
    .append("button")
    .text(section.title)
    .style("text-align", "left")
    .style("padding-top", "10px")
    .style("padding-bottom", "10px")
    .style("padding-left", "15px")
    .style("padding-right", "15px")
    .style("border", "none")
    .style("background", "white")
    .style("cursor", "pointer")
    .on("click", function () {
      const contentDiv = d3.select(this.parentNode).select(".content");
      const isVisible = contentDiv.style("display") === "block";
      contentDiv.style("display", isVisible ? "none" : "block");
    });

  sectionDiv
    .append("div")
    .attr("class", "content")
    .style("display", "none") // Initially hidden
    .style("margin-top", "0px")
    .style("padding-top", "10px")
    .style("padding-bottom", "10px")
    .style("padding-left", "15px")
    .style("padding-right", "15px")
    .style("background", "#f9f9f9")
    .text(section.content);
});

const ResetButton = d3
  .select("header")
  .append("button")
  .attr("id", "resetButton")
  .text("Clear Selections")
  .on("click", clearSelections)
  .style("transition", "background-color 0.3s, transform 0.2s") // Transition for hover effect
  .on("mouseover", function () {
    d3.select(this).style("background-color", "#ffcc00"); // Darker shade on hover
    d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
  })
  .on("mouseout", function () {
    d3.select(this).style("background-color", "#FFC000"); // Original color
    d3.select(this).style("transform", "scale(1)"); // Reset scale
  });

function clearSelections() {
  // Clear selected state of all circles in the data
  groupedData.forEach((item) => {
    item.selected = false;

    // Reset background color for associated divs
    item.Nudi_id.forEach((id) => {
      d3.selectAll(`div.${id}`)
        .style("border", "20px solid black")
        .style("background-color", "black");
      d3.selectAll(`div.${id} h4`).style("color", "white");
      d3.selectAll(`div.${id} .AddDetails h5`).style("color", "white");
      d3.selectAll(`div.${id} p`).style("color", "white");
      d3.selectAll(`div.${id} .AddDetails`).style("border-top", "15px solid black");
      d3.selectAll(`div.${id} .NudiTaxonomy`).style("border-top", "15px solid black");
    });

    // Reset stroke for all circles associated with this Nudi_id
    d3.select(`circle.${item.Nudi_id.join(".")}`)
      .attr("stroke-width", 0)
      .attr("stroke", "none")
      .attr("opacity", 0.7);
  });

  // Reset stroke and opacity for all circles with the class "single-circle"
  d3.selectAll('circle.single-circle')
    .attr("stroke-width", 0)
    .attr("stroke", "none");

  // Hide the tooltip if it's visible
  mapTooltip.style("visibility", "hidden");
}

const Credits = d3.select("body").append("footer");
Credits.attr("id", "footer")
  .style("text-align", "left");

const creditsDiv = Credits.append("div").attr("id", "creditsDiv");

creditsDiv.append("h3")
  .text("Credits ")
  .style("font-weight", "700")
  .style("margin-top", "0px")
  .style("display", "inline");

creditsDiv.append("p")
  .text(
    "Images and Nudibranch Data from the Smithsonian Institution  |  Map polygons from Natural Earth  |  Visualization created by Lisa Sakai Quinley"
  )
  .style("display", "inline");

// Define the image folder globally
const imageFolder = "./image-data/images";

// This function fetches image data from the GeoJSON
async function fetchImageData() {
  const response = await fetch("./data.geojson");
  return await response.json();
}

// This function gets image files and their titles
async function getImageFiles() {
  const imageData = await fetchImageData();
  return imageData.features
    .map((feature) => {
      const id = feature.properties.Nudi_id;
      return {
        url: id ? `${imageFolder}/${id}.jpg` : null,
        title: feature.properties.title,
        id: id,
        // Additional properties...
      };
    })
    .filter((item) => item.url !== null);
}

// This function extracts color palettes using Vibrant.js
async function extractPalettes() {
  // Ensure geoData is passed
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
          groupedPalettes.push({
            url,
            title,
            Nudi_id,
            key,
            swatch,
          });
        }
      }

    } 
    catch (err) {
    //   console.error(`Error processing image ${url}:`, err);
    }
  }
  return groupedPalettes; // Return the palettes for further use
}

const NudiTooltip = d3
  .select("body")
  .append("div")
  .attr("class", "NudiTooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "black")
  .style("padding", "5px")
  .style("font-family", '"Kodchasan", sans-serif')
  .style("font-weight", "600");

function renderColorCircles(geoData) {
  const imageFolder = './image-data/images'; // Set your image folder path here

  const colorData = geoData.features.map(features => {
    const nudiId = features.properties.Nudi_id;

    // Use Nudi_id directly to construct the image URL
    const imageUrl = nudiId ? `${imageFolder}/${nudiId}.jpg` : null;

    const swatch = (features.properties.palettes && features.properties.palettes.length > 0)
      ? features.properties.palettes[0].swatch
      : [0, 0, 0];

    return {
      Nudi_id: nudiId,
      title: features.properties.title,
      longitude: features.geometry.coordinates[0],
      latitude: features.geometry.coordinates[1],
      swatch: swatch,
      image: imageUrl
    };
  });

  const colorCircles = circlesGroup
    .selectAll(".color-circle")
    .data(colorData, d => d.Nudi_id);

  const positions = new Set();

  colorCircles.enter().each(function (d) {
    let [x, y] = Nudiprojection([d.longitude, d.latitude]);
    const radius = 10;

    let colliding = true;
    while (colliding) {
      colliding = false;

      for (let pos of positions) {
        const [px, py] = pos.split(',').map(Number);
        const distance = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (distance < radius * 2) {
          colliding = true;
          x += Math.random() * 20 - 10;
          y += Math.random() * 20 - 10;
          break;
        }
      }
    }

    positions.add(`${x},${y}`);

    d3.select(this)
      .append("circle")
      .attr("class", `${d.Nudi_id} single-circle`) // Correctly use template literals
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", radius)
      .attr("fill", `rgb(${d.swatch.join(",")})`)
      .attr("opacity", 0)
      .on("mouseover", function (event) {
        d3.select(this).attr("opacity", 1); // Change opacity to 1

        // Check if title is "Nudibranchia" or "Dexiarchia"
        const titleText = (d.title === "Nudibranchia" || d.title === "Dexiarchia")
          ? "No information available"
          : d.title;

        const tooltipContent = `<span class="tooltip-title">${titleText}</span>`; // Use CSS class for title

        // Show the image thumbnail, using CSS class
        const thumbnail = d.image ? `<img src="${d.image}" class="tooltip-image"/>` : '';

        NudiTooltip
          .html(tooltipContent + thumbnail)
          .style("visibility", "visible")
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        NudiTooltip.style("visibility", "hidden");
      })

      .on("click", function (event, d) {
        // Clear selected state of all circles
        colorData.forEach((item) => {
          // Reset selected state for each item
          item.selected = false;

          // Reset background color for associated divs
          d3.selectAll(`div.${item.Nudi_id}`)
            .style("border", "20px solid black")
            .style("background-color", "black");
          d3.selectAll(`div.${item.Nudi_id} h4`).style("color", "white");
          d3.selectAll(`div.${item.Nudi_id} .AddDetails h5`).style("color", "white");
          d3.selectAll(`div.${item.Nudi_id} p`).style("color", "white");
          d3.selectAll(`div.${item.Nudi_id} .AddDetails`).style("border-top", "15px solid black");
          d3.selectAll(`div.${item.Nudi_id} .NudiTaxonomy`).style("border-top", "15px solid black");

          // Reset stroke for all circles
          d3.select(`circle.${item.Nudi_id}`)
            .attr("stroke-width", 0)
            .attr("stroke", "none")
            .attr("opacity", 1); // Reset opacity for unselected circles
        });

        // Select the clicked circle
        d.selected = true;
        d3.select(this)
          .attr("stroke-width", 3)
          .attr("stroke", "white")
          .attr("opacity", 1); // Set opacity to 1 for the selected circle

        // Update background color for associated divs of the selected circle
        d3.selectAll(`div.${d.Nudi_id}`)
          .style("border", "20px solid white")
          .style("background-color", "white");
        d3.selectAll(`div.${d.Nudi_id} h4`).style("color", "black");
        d3.selectAll(`div.${d.Nudi_id} .AddDetails h5`).style("color", "black");
        d3.selectAll(`div.${d.Nudi_id} p`).style("color", "black");
        d3.selectAll(`div.${d.Nudi_id} .AddDetails`).style("border-top", "15px solid white");
        d3.selectAll(`div.${d.Nudi_id} .NudiTaxonomy`).style("border-top", "15px solid white");
        // Move the associated divs to the beginning of the parent container
        const divs = d3.selectAll(`div.${d.Nudi_id}`).nodes(); // Get all divs with class Nudi_id
        divs.forEach((div) => {
          const parent = div.parentNode; // Get the parent element
          parent.insertBefore(div, parent.firstChild); // Move div to the beginning of the parent's child list (top in the visual order)

        });
      });

  });

    colorCircles.attr("fill", (d) => `rgb(${d.swatch.join(",")})`);

    colorCircles.exit().remove();
  }


// Initialize the visualization
async function initializeVisualization(NudiDivs, NudiColors, geoData) {
  // Wait for extractPalettes to resolve before continuing
  const groupedData = await extractPalettes(NudiDivs, geoData);
  // I was calling displayPalettes here, but it should be called after the promise resolves
  // Once the promise resolves, call displayPalettes
  displayPalettes(groupedData, NudiDivs, geoData);
  CategorizedSwatches(NudiColors, geoData); // Pass geoData here
}


// Function to show the circles
function showCircles() {
      if (currentRendering === 'circles') return; // No action if already rendering circles

      // Clear existing circles and text
      circlesGroup.selectAll("circle").remove();
      circlesGroup.selectAll("text").remove(); // Clear any existing text


      // Render the circles
      renderCircles(groupedData); // Pass the appropriate data
      currentRendering = 'circles'; // Update current rendering state

    }

// Update the showColorCircles function
function showColorCircles() {
      if (currentRendering === 'colorCircles') return;

      // Clear existing circles and text
      circlesGroup.selectAll("circle").remove();
      circlesGroup.selectAll(".count-label, circle").remove();
      circlesGroup.selectAll(".count-label").attr("opacity", 0); // Set opacity to 0

      // Render the color circles
      renderColorCircles(geoData);

      // Make circles visible
      circlesGroup.selectAll("circle").attr("opacity", 1); // Set opacity to 1

      currentRendering = 'colorCircles';
    }

const showCirclesButton = d3
    .select("header")
    .append("button")
    .attr("id", "showCirclesButton")
    .text("Show Locations")
    .on("click", showCircles) // Call the showCircles function
    .style("transition", "background-color 0.3s, transform 0.2s") // Transition for hover effect
    .on("mouseover", function () {
      d3.select(this).style("background-color", "#ffcc00"); // Darker shade on hover
      d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
    })
    .on("mouseout", function () {
      d3.select(this).style("background-color", "#FFC000"); // Original color
      d3.select(this).style("transform", "scale(1)"); // Reset scale
    });

  const showColorCirclesButton = d3
    .select("header")
    .append("button")
    .attr("id", "showColorCirclesButton")
    .text("Show Vibrant Swatches")
    .on("click", showColorCircles) // Call the showColorCircles function
    .style("transition", "background-color 0.3s, transform 0.2s") // Transition for hover effect
    .on("mouseover", function () {
      d3.select(this).style("background-color", "#ffcc00"); // Darker shade on hover
      d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
    })
    .on("mouseout", function () {
      d3.select(this).style("background-color", "#FFC000"); // Original color
      d3.select(this).style("transform", "scale(1)"); // Reset scale
    });

  // Event listeners for buttons
  document.getElementById("showCircles").addEventListener("click", showCircles);
  document.getElementById("showColorCircles").addEventListener("click", showColorCircles);

  // Initial rendering
  showCircles(); // Show circles by default



  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  const CategorizedSwatches = (geoData, NudiColors) => {
    //console.log(NudiColors);
    // Loop through each feature in the GeoJSON
    geoData.features.forEach((feature) => {
      // Check if this feature has palettes, and if it does, process each swatch
      const swatches = feature.properties.palettes ? feature.properties.palettes.map((palette) => {
        return {
          Nudi_id: feature.properties.Nudi_id,
          swatch: palette.swatch, // RGB color values
          tax_family: feature.properties.tax_family, // Taxonomy family
          key: palette.key // Key for the palette (e.g., 'Vibrant', 'DarkVibrant')
        };
      }) : []; // Return an empty array if no palettes exist
  
      // For each swatch, create a rectangle and append it to the #NudiColors div
      swatches.forEach((swatch) => {
        const ColorContainer = NudiColors
          .append("rect")
          .attr("class", `${swatch.tax_family}-${swatch.Nudi_id}-${swatch.key}`) // Class includes tax_family, Nudi_id, and key
          .style("fill", `rgb(${swatch.swatch.join(",")})`)         // Set the fill color using RGB
          .style("width", "50px")                                   // Set the width of each swatch
          .style("height", "50px")                                  // Set the height of each swatch
          .style("margin", "5px")                                   // Add margin between swatches
          .style("display", "inline-block")                         // Arrange swatches horizontally
          .attr("title", `Nudi ID: ${swatch.Nudi_id}, Key: ${swatch.key}`); // Tooltip shows Nudi ID and key
      });
    });
  };

  // This function displays the images and their color palettes
  function displayPalettes(groupedPalettes, NudiDivs, geoData) {
    //console.log(groupedPalettes); 

    const shuffledFeatures = shuffle(geoData.features);

    //console.log(shuffledFeatures.length)

    shuffledFeatures.forEach((d) => {
      // Assuming groupedPalettes is already an array, no need to flatten
      //  geoData.features.forEach((d) => {
      const nudiBranchImageURL = `${imageFolder}/${d.properties.Nudi_id}.jpg`; // Use global imageFolder
      const correspondingImageSwatches = groupedPalettes.filter(
        (image) => image.url === nudiBranchImageURL
      );
      //console.log(correspondingImageSwatches);
      if (correspondingImageSwatches.length > 0) {
        const NudiContainer = NudiDivs.append("div")
          .attr("class", d.properties.Nudi_id)
          .attr("id", "NudiContainers")
          .style("display", "inline-block")
          .style("text-align", "center")
          .style("border", "20px solid black")
          .style("box-sizing", "border-box")
          .style("cursor", "pointer"); // Change cursor to pointer on hover

        setTimeout(() => {
          NudiContainer.style("opacity", 1); // Change opacity to 1 for fade-in
          NudiContainer.style("transition", "opacity 1.5s ease-in"); // Add transition effect
        }, 0);

        // Add click event to toggle the details view
        NudiContainer.on("click", function () {
          const NudiTaxonomy = d3.select(this).select(".NudiTaxonomy");
          const isTaxVisible = NudiTaxonomy.style("display") === "block";
          NudiTaxonomy.style("display", isTaxVisible ? "none" : "block");
          const AddDetails = d3.select(this).select(".AddDetails");
          const isAddDVisible = AddDetails.style("display") === "block";
          AddDetails.style("display", isAddDVisible ? "none" : "block");
        });

        NudiContainer.append("h4")
          .style("padding-bottom", "15px")
          .text(d.properties.sci_name)
          .style("color", "white");

        NudiContainer.append("img")
          .attr("src", nudiBranchImageURL)
          .attr("alt", d.properties.title)
          .style("display", "block");

        const swatchesDiv = NudiContainer.append("div").style("display", "flex");

        correspondingImageSwatches.forEach((swatch) => {
          const keys = Object.keys(swatch.swatch);

          const rgbColor = swatch.swatch._rgb;

          const formattedPaletteKey = swatch.key
            .replace(/([A-Z])/g, " $1") // Adds space before capital letters
            .replace(/_/g, " ") // Replaces underscores with spaces
            .trim(); // Removes leading/trailing spaces

          swatchesDiv
            .append("div")
            .style(
              "background-color",
              `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
            )
            .style("flex", "1 1 auto")
            .style("height", "30px")
            //.text(formattedPaletteKey)
            .style("display", "flex") // Enable flexbox
            .style("justify-content", "center") // Center horizontally
            .style("align-items", "center"); // Center vertically
        });

        const TaxTooltip = d3
          .select("body")
          .append("div")
          .attr("class", "TaxTooltip")
          .style("position", "absolute") // Ensure it's positioned absolutely
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("visibility", "hidden")
          .style("opacity", 0)
          .style("pointer-events", "none");

        // Create a flex container for NudiTaxonomy and AddDetails
        const detailsContainer = NudiContainer.append("div")
          .style("display", "flex");

        // Create the NudiTaxonomy div
        const NudiTaxonomy = detailsContainer
          .append("div")
          .attr("class", "NudiTaxonomy")
          .style("border-top", "15px solid black")
          .style("flex", "1")
          .style("display", "none");

        // Populate the details div with additional information
        NudiTaxonomy.append("h4")
          .text("Taxonomy")
          .style("padding-bottom", "7px")
          .style("color", "white");



        const taxKingdomDiv = NudiTaxonomy.append("div")
          .attr("class", "tax_kingdom")
          .style("position", "relative"); // Ensure it can contain absolute positioned tooltip

        taxKingdomDiv.append("h5").text(d.properties.tax_kingdom);

        // Attach mouse events to the parent div
        taxKingdomDiv
          .on("mouseover", function (event) {
            TaxTooltip.html("Kingdom: " + d.properties.tax_kingdom) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });



        const taxPhylumDiv = NudiTaxonomy.append("div")
          .attr("class", "tax_phylum")
          .style("position", "relative"); // Ensure it can contain absolute positioned tooltip

        taxPhylumDiv.append("h5").text(d.properties.tax_phylum);

        // Attach mouse events to the parent div
        taxPhylumDiv
          .on("mouseover", function (event) {
            TaxTooltip.html("Phylum: " + d.properties.tax_phylum) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });



        const taxClassDiv = NudiTaxonomy.append("div")
          .attr("class", "tax_class")
          .style("position", "relative"); // Ensure it can contain absolute positioned tooltip

        taxClassDiv.append("h5").text(d.properties.tax_class);

        // Attach mouse events to the parent div
        taxClassDiv
          .on("mouseover", function (event) {
            TaxTooltip.html("Class: " + d.properties.tax_class) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });



        const taxSubClassDiv = NudiTaxonomy.append("div")
          .attr("class", "tax_subclass")
          .style("position", "relative"); // Ensure it can contain absolute positioned tooltip

        taxSubClassDiv.append("h5").text(d.properties.tax_subclass);

        // Attach mouse events to the parent div
        taxSubClassDiv
          .on("mouseover", function (event) {
            TaxTooltip.html("Subclass: " + d.properties.tax_subclass) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });



        const taxOrderDiv = NudiTaxonomy.append("div")
          .attr("class", "tax_order")
          .style("position", "relative"); // Ensure it can contain absolute positioned tooltip

        taxOrderDiv.append("h5").text(d.properties.tax_order);

        // Attach mouse events to the parent div
        taxOrderDiv
          .on("mouseover", function (event) {
            TaxTooltip.html("Order: " + d.properties.tax_order) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });


        const currentFeature = d; // Store the current feature context

        const taxFamilyDiv = NudiTaxonomy.append("div")
          .attr("class", "tax_family")
          .style("position", "relative"); // Ensure it can contain absolute positioned tooltip

        const familyText = taxFamilyDiv.append("h5").text(function () {
          if (
            currentFeature.properties.tax_family === "No information available" &&
            currentFeature.properties.title === "Dexiarchia"
          ) {
            return currentFeature.properties.title;
          } else {
            return currentFeature.properties.tax_family;
          }
        });

        // Attach mouse events to the parent div
        taxFamilyDiv
          .on("mouseover", function (event) {
            const familyContent = familyText.text();
            TaxTooltip.html("Family: " + familyContent) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });


        const taxTitleDiv = NudiTaxonomy.append("div")
          .attr("class", "title")
          .style("position", "relative");

        const titleText = taxTitleDiv.append("h5").text(function () {
          // Check both conditions in the same level
          if (
            (currentFeature.properties.title === "Nudibranchia" &&
              currentFeature.properties.sci_name === "Nudibranchia") ||
            currentFeature.properties.sci_name === "No information available" ||
            currentFeature.properties.title === "Dexiarchia"
          ) {
            return "No information available"; // Return this if any condition is met
          } else {
            return currentFeature.properties.title; // Return the scientific name otherwise
          }
        });

        taxTitleDiv
          .on("mouseover", function (event) {
            const titleContent = titleText.text();
            TaxTooltip.html("Genus and Species: " + titleContent) // Set tooltip content
              .style("left", event.pageX + 5 + "px") // Position tooltip
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          })
          .on("mousemove", function (event) {
            TaxTooltip.style("left", event.pageX + 5 + "px") // Update position on mouse move
              .style("top", event.pageY + 5 + "px");
          })
          .on("mouseout", function () {
            TaxTooltip.style("visibility", "hidden").style("opacity", 0);
          });

        // Create the AddDetails div to the right of NudiTaxonomy
        const AddDetails = detailsContainer
          .append("div")
          .attr("class", "AddDetails")
          .style("border-top", "15px solid black")
          .style("flex", "1")
          .style("display", "none");

        // Add content to AddDetails as needed
        AddDetails.append("h4")
          .style("padding-bottom", "10px")
          .text("Additional Details")
          .style("color", "white");

        const depthValue = d.properties.depth;

        // Use regex to check for valid number formats
        const numberPattern = /-?\d+(\.\d+)?/; // Matches integers and decimals

        if (!depthValue || depthValue.trim() === "") {
          // If there are no entries or depthValue is empty
          AddDetails.append("div")
            .attr("class", "depth")
            .append("h5")
            .text("Depth: ")
            .append("p")
            .text("No information available")
            .style("color", "white")
            .style("display", "inline-block");
        } else if (depthValue.match(numberPattern)) {
          const depths = depthValue.split(" - ").map(Number); // Split and convert to numbers
          const uniqueDepths = [...new Set(depths)]; // Remove duplicates

          // Check if there's only one unique depth
          if (uniqueDepths.length === 1) {
            // If it's a single number, display it without a range
            AddDetails.append("div")
              .attr("class", "depth")
              .append("h5")
              .text("Depth: ")
              .append("p")
              .text(`${uniqueDepths[0].toFixed(2)} meters`) // Show one time with 2 decimals
              .style("color", "white")
              .style("display", "inline-block");
          } else if (uniqueDepths.length > 1) {
            // If there are multiple depths, check for a range
            const minDepth = Math.min(...uniqueDepths);
            const maxDepth = Math.max(...uniqueDepths);

            // If the range is more than one digit, show it
            if (maxDepth - minDepth > 1) {
              AddDetails.append("div")
                .attr("class", "depth")
                .append("h5")
                .text("Depth: ")
                .append("p")
                .text(`${minDepth.toFixed(2)} - ${maxDepth.toFixed(2)} meters`) // Show the range with 2 decimals
                .style("color", "white")
                .style("display", "inline-block");
            } else {
              // If the difference is 1 or less, just show the first unique value
              AddDetails.append("div")
                .attr("class", "depth")
                .append("h5")
                .text("Depth: ")
                .append("p")
                .text(`${uniqueDepths[0].toFixed(2)} meters`) // Show the first unique value
                .style("color", "white")
                .style("display", "inline-block");
            }
          }
        } else {
          // Handle cases where depthValue does not match the expected format
          AddDetails.append("div")
            .attr("class", "depth")
            .append("h5")
            .text("Depth: ")
            .append("p")
            .text("No valid depth available")
            .style("color", "white")
            .style("display", "inline-block");
        }

        AddDetails.append("div")
          .attr("class", "place")
          .append("h5")
          .text("Location: ")
          .append("p")
          .text(d.properties.place)
          .style("color", "white")
          .style("display", "inline-block");
      }
    });
  }

