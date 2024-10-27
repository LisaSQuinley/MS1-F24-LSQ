let geoData = []; // Declare geoData in a higher scope
let groupedData = []; // Declare groupedData in a higher scope

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
});

const ProjectTitle = d3.select("header").append("div");

ProjectTitle.attr("id", "title")
  .style("margin-left", "0px")
  .style("background-color", "lightgray") // Optional: Add background color for styling
  .style("text-align", "center") // Optional: Center text
  .style("padding", "10px");

ProjectTitle.append("h1")
  .text("Know Your Nudibranchs")
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

// Initial dimensions
let mapwidth = window.innerWidth; // Width of the viewport
let mapheight = window.innerHeight; // Height of the viewport

const Nudiprojection = d3
  .geoEquirectangular()
  .scale(mapwidth / 6.25)
  .center([0, 0])
  .translate([mapwidth / 2, mapheight / 2]);

const Nudipath = d3.geoPath(Nudiprojection);

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

// Load and render the countries map
// d3.json("ne_110m_admin_0_countries.json").then((data) => {
//   mapGroup
//     .append("g")
//     .attr("class", "country-layer")
//     .selectAll("path.country")
//     .data(data.features)
//     .enter()
//     .append("path")
//     .attr("class", "country")
//     .attr("d", Nudipath)
//     .attr("fill", "white");
// });

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
  .style("padding", "5px")
  .style("font-family", '"Kodchasan", sans-serif')
  .style("font-weight", "600");

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
  .style("bottom", "30px") // Adjust top margin
  .style("width", "42%"); // Width of the toggle container

// Create each section with a toggle button
const sections = [
  {
    title: "Project Overview",
    content:
      "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others) – some of these aspects are explored in my data visualization. Four highlights are visible here – a geographical map for location, a dot plot for illustrating depth at which these marine slugs can be found, its taxonomic name, and an image from the Smithsonian's collection.",
  },
  {
    title: "The Many Faces and Names of Marine Slugs",
    content:
      "This displays the scientific system of classification for these lovely little sea slugs. Included are their taxonomic levels and a brief overview. Click on any dot to view associated taxonomic names, that will highlight the levels in yellow.",
  },
  {
    title: "Unveiling the Vibrant Palette of Nudies",
    content:
      "Using Vibrant.js to extract color palettes from images of nudibranchs, I then grouped each swatch from the palettes by a dominant color category. Each image had a palette of six swatches generated: Vibrant, Muted, Dark Vibrant, Dark Muted, Light Vibrant, Light Muted. Hover over a color to see what nudibranch image it's generated from. Click on any color palette to view the colors extracted from the image.",
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

const Credits = d3.select("body").append("footer");
Credits.attr("id", "footer")
  .style("text-align", "left")
  .style("padding", "10px")
  .style("padding-left", "35px")
  .style("padding-right", "35px");

Credits.append("h3")
  .text("Credits ")
  .style("font-weight", "700")
  .style("margin-top", "0px")
  .style("display", "inline");

Credits.append("p")
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
async function extractPalettes(NudiDivs, geoData) {
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
    } catch (err) {
      console.error(`Error processing image ${url}:`, err);
    }
  }

  // Call the function to display the images and swatches
  displayPalettes(groupedPalettes, NudiDivs, geoData); // Ensure geoData is passed
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// This function displays the images and their color palettes
function displayPalettes(groupedPalettes, NudiDivs, geoData) {
  //console.log(groupedPalettes);

  const shuffledFeatures = shuffle(geoData.features);

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
          .text(formattedPaletteKey)
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
