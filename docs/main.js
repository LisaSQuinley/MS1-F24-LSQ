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
  .style("background-color", "#f1f1f1") // Optional: Add background color for styling
  .style("text-align", "center") // Optional: Center text
  .style("padding", "10px");

ProjectTitle.append("h1")
  .text("Know Your Nudibranchs")
  .style("display", "inline");

ProjectTitle.append("h2")
  .text("A Scuba Diver's Guide to Sea Slugs")
  .style("display", "inline");

// Create a new div for displaying palettes
const NudiDivs = d3.select("body").append("div").attr("id", "NudiDivs");

const ProjectOverview = d3
  .select("body")
  .append("div")
  .attr("id", "section")
  .style("padding-top", "90px")
  .style("margin", "0 auto") // Center the div horizontally
  .append("h3")
  .text("Project Overview")
  .append("p")
  .style("padding-bottom", "20px")
  .text(
    "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others) – some of these aspects are explored in my data visualization. Four highlights are visible here – a geographical map for location, a dot plot for illustrating depth at which these marine slugs can be found, its taxonomic name, and an image from the Smithsonian's collection."
  );

// Initial dimensions
let mapwidth = window.innerWidth; // Width of the viewport
let mapheight = window.innerHeight; // Height of the viewport

const Nudiprojection = d3
  .geoEquirectangular()
  .scale(mapwidth / 6.25) // Set initial scale based on width
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

// Add a group for the map layers (countries and ocean)
const mapGroup = svg.append("g").attr("class", "map-layers");

// Load and render the countries map
d3.json("ne_110m_admin_0_countries.json").then((data) => {
  mapGroup
    .append("g")
    .attr("class", "country-layer")
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
    .append("g")
    .attr("class", "ocean-layer")
    .selectAll("path.ocean")
    .data(data.features)
    .enter()
    .append("path")
    .attr("class", "ocean")
    .attr("d", Nudipath)
    .attr("fill", "#1C75BC")
    .attr("opacity", 0.2);
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

      d3.select(this).attr("stroke-width", 3).attr("stroke", "white");
    })
    .on("mouseout", function () {
      mapTooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke", "none");
    })
    .on("click", function (event, d) {
      d3.selectAll("rect").attr("stroke", "none");
      d3.selectAll("circle").attr("stroke", "none");
      d3.selectAll("div").style("border", "none");

      d3.select(this).attr("stroke-width", 3).attr("stroke", "yellow");

      d.Nudi_id.forEach((i) => {
        d3.selectAll(`rect.${i}`)
          .attr("stroke-width", 3)
          .attr("stroke", "yellow");
        d3.selectAll(`div.${i}`).style("border", "3px solid yellow");
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

const PaletteDescription = d3.select("body").append("div");
PaletteDescription.attr("id", "section")
  .append("h3")
  .style("padding-top", "20px")
  .text("Unveiling the Vibrant Palette of Nudies")
  .append("p")
  .text(
    "Using Vibrant.js to extract color palettes from images of nudibranchs, I then grouped each swatch from the palettes by a dominant color category. Each image had a palette of six swatches generated: Vibrant, Muted, DarkVibrant, DarkMuted, LightVibrant, LightMuted. Hover over a color to see what nudibranch image it's generated from. Click on any color palette to view the colors extracted from the image."
  );

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

// This function displays the images and their color palettes
function displayPalettes(groupedPalettes, NudiDivs, geoData) {
  //console.log(groupedPalettes);
  // Assuming groupedPalettes is already an array, no need to flatten
  geoData.features.forEach((d) => {
    const nudiBranchImageURL = `${imageFolder}/${d.properties.Nudi_id}.jpg`; // Use global imageFolder
    const correspondingImageSwatches = groupedPalettes.filter(
      (image) => image.url === nudiBranchImageURL
    );
    // console.log(correspondingImageSwatches);
    if (correspondingImageSwatches.length > 0) {
      const NudiContainer = NudiDivs.append("div")
        .attr("class", d.properties.Nudi_id)
        .attr("id", "NudiContainers")
        .style("padding", "20px")
        .style("margin", "10px")
        .style("display", "inline-block")
        .style("text-align", "center")
        .style("cursor", "pointer") // Change cursor to pointer on hover

        // Add click event to toggle the details view
        .on("click", function () {
          const NudiTaxonomy = d3.select(this).select(".NudiTaxonomy");
          const isVisible = NudiTaxonomy.style("display") === "block";
          NudiTaxonomy.style("display", isVisible ? "none" : "block");
        });

      NudiContainer.append("h4").text(d.properties.sci_name);

      NudiContainer.append("img")
        .attr("src", nudiBranchImageURL)
        .attr("alt", d.properties.title);

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

      // Create a details div to hold additional information
      const NudiTaxonomy = NudiContainer.append("div")
        .attr("class", "NudiTaxonomy")
        .style("display", "none") // Initially hidden
        .style("margin-top", "10px")
        .style("padding", "10px");

      // Populate the details div with additional information
      NudiTaxonomy.append("h5").text("Taxonomy");
      NudiTaxonomy.append("div")
        .attr("class", "tax_kingdom")
        .text(d.properties.tax_kingdom || "No data available");

      NudiTaxonomy.append("div")
        .attr("class", "tax_phylum")
        .text(d.properties.tax_phylum || "No data available");

      NudiTaxonomy.append("div")
        .attr("class", "tax_class")
        .text(d.properties.tax_class || "No data available");

      NudiTaxonomy.append("div")
        .attr("class", "tax_subclass")
        .text(d.properties.tax_subclass || "No data available");

      NudiTaxonomy.append("div")
        .attr("class", "tax_order")
        .text(d.properties.tax_order || "No data available");

      NudiTaxonomy.append("div")
        .attr("class", "tax_family")
        .text(d.properties.tax_family || "No data available");

      NudiTaxonomy.append("div")
        .attr("class", "title")
        .text(d.properties.title || "No title available");
    }
  });
}

/* 
// This function displays the images and their color palettes
function displayPalettes(groupedPalettes, palettesDiv) {
  // Create a container for each image and its swatches


  groupedPalettes.forEach(({ url, title, Nudi_id, swatch }) => {
    const paletteContainer = palettesDiv.append("div")
      .attr("class", Nudi_id) // Use Nudi_id for class
      .style("margin", "10px")
      .style("display", "inline-block")
      .style("text-align", "center");

    // Add the image
    paletteContainer.append("img")
      .attr("src", url)
      .attr("alt", title)
      .style("width", "500px")
      .style("height", "auto");

    // Add title
    paletteContainer.append("p")
      .text(title)
      .style("font-weight", "bold");

    // Add swatches
    const swatchesDiv = paletteContainer.append("div").style("display", "flex");
    
    // Loop through the swatch object for the relevant keys
    const paletteKeys = [
      "Vibrant",
      "DarkVibrant",
      "LightVibrant",
      "Muted",
      "DarkMuted",
      "LightMuted",
    ];
    
    paletteKeys.forEach(key => {
      const color = swatch[key];
      if (color) {
        // Use the color's hex property directly
        const hexColor = color.rgb; // or color.rgb if you're using that format
        swatchesDiv.append("div")
          .style("background-color", hexColor) // Set background color
          .style("width", "30px")
          .style("height", "30px")
          .style("margin", "2px")
          .style("border", "1px solid #000");
      }
    });
  });

//console.log(groupedPalettes)  
const valuesOfGroupedPalettes = Object.values(groupedPalettes); 
// flattens the valuesOfGroupedPalettes into a single array
const concatGroupedPalettes = valuesOfGroupedPalettes.flat();

// traverses over geoData to access every image using Nudi_ID and filters the concatArray to find the corresponding swatch matches based on image ID
geoData.features.forEach((d, i) => {
  const nudiBranchImageURL = `./image-data/images/${d.properties.Nudi_id}.jpg`;
  const correspondingImageSwatches = concatGroupedPalettes.filter(image => image.url === nudiBranchImageURL);
  // console.log(correspondingImageSwatches)
})
}



 */
