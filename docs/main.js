// Main data loading and rendering logic
d3.json("data.geojson")
  .then((data) => {
    geoData = data;
    const groupedData = groupDataByLocation(geoData);
    renderCircles(groupedData);
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

const PaletteDescription = d3.select("body").append("div");
PaletteDescription.attr("id", "section")
  .append("h3")
  .style("padding-top", "20px")
  .text("Unveiling the Vibrant Palette of Nudies")
  .append("p")
  .text(
    "Using Vibrant.js to extract color palettes from images of nudibranchs, I then grouped each swatch from the palettes by a dominant color category. Each image had a palette of six swatches generated: Vibrant, Muted, DarkVibrant, DarkMuted, LightVibrant, LightMuted. Hover over a color to see what nudibranch image it's generated from. Click on any color palette to view the colors extracted from the image."
  );

  const palettesDiv = d3.select("body").append("div");
  palettesDiv.attr("id", "palettesDiv");


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


  const imageFolder = "./image-data/images"; // The folder where your images are stored


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
        kingdom: feature.properties.tax_kingdom,
        phylum: feature.properties.tax_phylum,
        class: feature.properties.tax_class,
        order: feature.properties.tax_order,
        family: feature.properties.tax_family,
        sci_name: feature.properties.sci_name,
        SI_info: feature.properties.image_content,
      };
    })
    .filter((item) => item.url !== null);
}
// This function extracts color palettes using Vibrant.js
async function extractPalettes(palettesDiv, paletteTooltip) {
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
  displayPalettes(groupedPalettes, palettesDiv);
}

// This function displays the images and their color palettes
function displayPalettes(groupedPalettes, palettesDiv) {
  // Clear the palettesDiv before appending new content
  palettesDiv.selectAll("*").remove();

  // Create a container for each image and its swatches
  groupedPalettes.forEach(({ url, title, Nudi_id, swatch }) => {
    const paletteContainer = palettesDiv.append("div")
      .attr("class", Nudi_id.replace(/\s+/g, "_")) // Use Nudi_id for class
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
    Object.values(swatch).forEach(color => {
      if (color) {
        swatchesDiv.append("div")
          .style("background-color", color.getHex())
          .style("width", "30px")
          .style("height", "30px")
          .style("margin", "2px")
          .style("border", "1px solid #000");
      }
    });
  });
}