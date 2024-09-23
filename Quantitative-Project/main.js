/*
  myNudies.push({
    id: objectData.id,
    title: objectData.title,
    link: objectData.content.descriptiveNonRepeating.record_link,
    place: currentPlace,
    depth: depthData,
    sci_name: objectData.content.indexedStructured.scientific_name,
    tax_kingdom: objectData.content.indexedStructured.tax_kingdom,
    tax_phylum: objectData.content.indexedStructured.tax_phylum,
    tax_class: objectData.content.indexedStructured.tax_class,
    tax_order: objectData.content.indexedStructured.tax_order,
    tax_family: objectData.content.indexedStructured.tax_family,
    latitude: objectData.content.indexedStructured.geoLocation[0].points.point.latitude,
    longitude: objectData.content.indexedStructured.geoLocation[0].points.point.longitude,
    image: image_url
    })
// https://d3js.org/d3-geo/cylindrical (for the geographic map) https://github.com/d3/d3-geo/blob/main/src/projection/equirectangular.js
// https://observablehq.com/@d3/equirectangular?intent=fork

*/
const ProjectTitle = d3.select("body").append("div");
ProjectTitle.attr("id", "section")
  .append("h1")
  .text("Know Your Nudibranchs")
  .append("h2")
  .text("A Scuba Diver's Guide to Sea Slugs");

const ProjectOverview = d3.select("body").append("div");
ProjectOverview.attr("id", "section")
  .append("h3")
  .text("Project Overview")
  .append("p")
  .text(
    "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others)–some of these aspects are explored in my data visualization. Four highlights are visible here–a geographical map for location, a dot plot for illustrating depth at which these marine slugs can be found, its taxonomic name, and an image from the Smithsonian's collection."
  );

const mapwidth = 1920; // Set the width for your SVG
const mapheight = 800; // Set the height for your SVG

let myNudies;
const Nudiprojection = d3
  .geoEquirectangular()
  .scale(250)
  .translate([mapwidth / 2, mapheight / 2]);
const Nudipath = d3.geoPath(Nudiprojection);

// Create a single SVG element
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", mapwidth)
  .attr("height", mapheight);

// Load and render the ocean map
d3.json("ne_10m_ocean.json")
  .then((data) => {
    svg
      .selectAll("path.ocean") // Use a specific class for oceans
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "ocean") // Set class for oceans
      .attr("d", Nudipath) // Use the path generator
      .attr("fill", "#1C75BC"); // Set a fill color
  })
  .catch((error) => {
    console.error("Error loading the GeoJSON data:", error);
  });


// Load and render the countries map
d3.json("ne_110m_admin_0_countries.json")
  .then((data) => {
    svg
      .selectAll("path.country") // Use a specific class for countries
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "country") // Set class for countries
      .attr("d", Nudipath) // Use the path generator
      .attr("fill", "white") // Set a fill color
      .attr("stroke", "#262262") // Set a stroke color
      .attr("z-index", 1001) // Optional: set z-index for countries
      .attr("stroke-width", 0.5); // Set stroke width for countries
  })
  .catch((error) => {
    console.error("Error loading the GeoJSON data:", error);
  });

// Load and render the GeoJSON data with dots
d3.json("data.geojson")
  .then((data) => {
    // Draw the points on the same SVG
    svg
      .selectAll("circle")
      .data(data.features)
      .enter()
      .append("circle")
      .attr("cx", (d) => Nudiprojection(d.geometry.coordinates)[0]) // Get x coordinate
      .attr("cy", (d) => Nudiprojection(d.geometry.coordinates)[1]) // Get y coordinate
      .attr("r", 5) // Set radius for the dots
      .attr("fill", "#FF0000") // Set a fill color for the dots
      .attr("stroke", "white") // Optional: set a stroke color for visibility
      .attr("stroke-width", 1) // Optional: set stroke width for circles
      .attr("z-index", 1005); // Optional: set z-index for circles
  })
  .catch((error) => {
    console.error("Error loading the GeoJSON data:", error);
  });

const descriptionTaxonomy = d3.select("body").append("div");
descriptionTaxonomy
  .attr("id", "section")
  .append("h3")
  .text("Taxonomy")
  .append("p")
  .text(
    "The scientific system of classification for these lovely little sea slugs. You’ll see changes starting with the Suborder. Please note that the taxonomic name usually consists of two parts, the Genus (capitalized) and the species epithet."
  );

// Load the data from the JSON file
d3.json("data.json").then((data) => {
  myNudies = data; // Assign fetched data to myNudies
  console.log(myNudies.length);
  displayTaxonomy(); // Call displayTaxonomy after data is loaded
});

// Set up margins and dimensions for the SVG
const margin = { top: 20, right: 50, bottom: 20, left: 80 };
const width = 1920 - margin.left - margin.right;
const rectangleHeight = 30; // Height of each rectangle
// const labelSpacing = 20;

// Define taxonomic levels to be displayed
const taxonomicLevels = [
  "tax_kingdom",
  "tax_phylum",
  "tax_class",
  "tax_subclass",
  "tax_order",
  "tax_family",
  "title",
];

const xScale = d3
  .scaleLinear()
  .domain([0, taxonomicLevels.length - 1]) // Corrected domain
  .range([0, width - margin.left - margin.right - (15 * taxonomicLevels.length)]); // Account for spacing

function displayTaxonomy() {
  if (!myNudies) return; // Ensure myNudies is defined
  const totalHeight =
    myNudies.length * rectangleHeight + margin.top + margin.bottom; // Move this here to use the latest myNudies length
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", totalHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //    const columnWidth = width / taxonomicLevels.length; // Calculate column width
  const RectMargin = { top: 3, right: 3, bottom: 3, left: 3 }; // Margin for rectangles

  // Create rectangles for each taxonomic level
  taxonomicLevels.forEach((level, index) => {
    const textWidths = myNudies.map((d) => {
        let textValueSubclass = d[level]; // Default to the value of the current level
        if (level === "tax_subclass") {
            textValueSubclass = "Heterobranchia "; // Special case for tax_subclass
        } else if (level === "tax_family" && !d[level]) {
            textValueSubclass = "No information available"; // Special case for tax_family
        }; 
      const textElement = svg
        .append("text")
        .attr("class", `${level}-label`)
        .style("font-size", "12px")
        .style("font-family", '"Kodchasan", sans-serif')
        .style("font-weight", "600")
        .text(textValueSubclass); // if level is tax_subclass, display 'Heterobranchia' instead
      const width = textElement.node().getBBox().width; // Get the width of the text
      textElement.remove(); // Remove the temporary text element
      return width;
    });

    // Create rectangles based on calculated text widths
    svg
      .selectAll(`.${level}`)
      .data(myNudies)
      .enter()
      .append("rect")
      .attr("class", level)
      .attr("x", xScale(index) + index * 5) // Add spacing for each rectangle
      //            .attr('x', xScale(index)) // Use xScale to determine x position
      .attr("y", (d, i) => i * rectangleHeight - RectMargin.top)
      .attr(
        "width",
        (d, i) => textWidths[i] + RectMargin.left * 4 + RectMargin.right * 4
      ) // Set width based on text
      .attr("height", rectangleHeight - RectMargin.top - RectMargin.bottom)
      .on("click", function (event, d) {
        showNudi(d.image);
      });
  });
  // Create labels for each taxonomic level
  taxonomicLevels.forEach((level, index) => {
    svg
      .selectAll(`.${level}-label`)
      .data(myNudies)
      .enter()
      .append("text")
      .attr("class", `${level}-label`)
      .attr("x", (d, i) => xScale(index) + index * 5 + 5 + RectMargin.left + RectMargin.right) // Adjust label position with spacing
      //                .attr('x', (d, i) => xScale(index) + (textWidths[i] + (RectMargin.left * 4) + (RectMargin.right * 4)) + labelSpacing)
      // Use xScale for label x position
      .attr(
        "y",
        (d, i) => i * rectangleHeight + 2 + RectMargin.top + RectMargin.bottom
      )
      .attr("dy", "0.35em")
      .style("font-size", "12px")
      .style("fill", "white")
      .style("font-family", '"Kodchasan", sans-serif')
      .style("font-weight", "600")
      .text((d) => {
        if (level === "tax_family" && !d[level]) {
            return "No information available"; // Display this if tax_family is blank
        }
        return level === "tax_subclass" ? "Heterobranchia " : d[level]; // For other levels
    });
  });
}

function showNudi(image) {
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
    .style("transform", "translate(50%, -50%)")
    .style("z-index", 1000);

  // Append the image
  NudiContainer.append("img")
    .attr("src", image.content)
    .attr("alt", "Taxonomic Image")
    .style("font-family", '"Kodchasan", sans-serif')
    .style("max-width", "1000px") // Adjust size as needed
    .style("height", "auto")
    .style("border", "2px solid white")
    .on('error', function() {
        d3.select(this)
          .attr('src', '')
          .style('width', '500px')
          .style('height', '75px')
          .attr("alt", "No available image")
          .style('background-color', 'gray')
          .style('display', 'flex')
          .style('align-items', 'center')
          .style('justify-content', 'center')
          .text('No available image')
          .style('color', 'white');
    });

  NudiContainer.append("button")
    .text("Close")
    .style("position", "absolute")
    .style("top", "0")
    .style("right", "0")
    .style("z-index", 1001)
    .style("background-color", "white")
    .style("color", "black")
    .style("border", "none")
    .style("padding", "10px")
    .style("cursor", "pointer")
    .style("border-radius", "5px")
    .style("font-size", "16px")
    .style("font-family", '"Kodchasan", sans-serif')
    .style("font-weight", "600")
    .style("margin", "20px")
    .on("click", function () {
      d3.select("#nudi-dish").remove();
    });
}
