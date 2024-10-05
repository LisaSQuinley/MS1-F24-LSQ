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

// Load your additional JSON data
d3.json("data.json").then((nudiData) => {
  // Create a mapping from id to nudi object
  const nudiMap = {};
  nudiData.forEach(nudi => {
    nudiMap[nudi.id] = nudi; // Assuming nudi has an "id" field
  });

  // Now load your GeoJSON data
  d3.json("data.geojson").then((geoData) => {
    // Enrich the GeoJSON features with additional data
    geoData.features.forEach(feature => {
      const nudiId = feature.properties.Nudi_id; // Assuming Nudi_id is in properties
      const nudiInfo = nudiMap[nudiId];

      if (nudiInfo) {
        // Add additional properties to the feature from nudiInfo
        feature.properties = { ...feature.properties, ...nudiInfo };
      }
    });

    // Now you can use geoData with enriched properties
    const groupedData = groupDataByLocation(geoData);
    renderCircles(groupedData);
  });
}).catch(error => {
  console.error("Error loading data:", error);
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
  .text(
    "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others)–some of these aspects are explored in my data visualization. Four highlights are visible here–a geographical map for location, a dot plot for illustrating depth at which these marine slugs can be found, its taxonomic name, and an image from the Smithsonian's collection."
  );

const mapwidth = 1920; // Set the width for your SVG
const mapheight = 800; // Set the height for your SVG

let myNudies;
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
// Create a group for the circles and text
const dataGroup = svg.append("g").attr("class", "data-layer");

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

// Load GeoJSON data and render circles and text
d3.json("data.geojson").then((data) => {
  const groupedData = groupDataByLocation(data);
  renderCircles(groupedData);
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
      tooltip.html(d.scientificNames.join(", ")) // List scientific names
        .style("visibility", "visible")
        .style("top", (event.pageY - 10) + "px")
        .style("left", (event.pageX + 10) + "px");
      d3.select(this).attr("stroke-width", 3).attr("stroke", "yellow");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
      d3.select(this).attr("stroke-width", 1).attr("stroke", "white");
    })
    .on("click", function (event, d) {
      const nudiId = d.nudi_id; // Change to d.properties.Nudi_id if necessary
      console.log("Clicked Nudi ID:", nudiId);
      highlightTaxonomy(nudiId);
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


function highlightTaxonomy(nudiId) {
  // Clear previous highlights
  d3.selectAll('.tax-level').style('background-color', 'transparent');

  // Highlight all taxonomic levels associated with the nudiId
  const nudi = myNudies.find(n => n.id === nudiId);
  if (nudi) {
    d3.selectAll(`.${nudi.tax_kingdom}, .${nudi.tax_phylum}, .${nudi.tax_class}, .${nudi.tax_order}, .${nudi.tax_family}`)
      .style('background-color', 'yellow');
  }
}


// Load your GeoJSON data and call the functions
d3.json("data.geojson").then((data) => {
  const groupedData = groupDataByLocation(data);
  renderCircles(groupedData);
}).catch(error => {
  console.error("Error loading GeoJSON data:", error);
});

const descriptionTaxonomy = d3.select("body").append("div");
descriptionTaxonomy
  .attr("id", "section")
  .style("margin-left", "50px")
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
const rectangleHeight = 40; // Height of each rectangle
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





/* 
// only keep this if I want the xScale even
const xScale = d3
  .scaleLinear()
  .domain([0, taxonomicLevels.length - 1]) // Corrected domain
  .range([0, width - margin.left - margin.right - 15 * taxonomicLevels.length]); // Account for spacing
 */

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
    .attr("transform", `translate(25,${margin.top})`);

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
      }
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
      .attr("x", columnPositions[index]) // Use custom column positions
      //      .attr("x", xScale(index) + index * 5) // Add spacing for each rectangle
      //            .attr('x', xScale(index)) // Use xScale to determine x position
      .attr(
        "y",
        (d, i) => i * rectangleHeight - RectMargin.top - RectMargin.bottom - 2
      )
      .attr(
        "width",
        (d, i) => textWidths[i] + RectMargin.left * 4 + RectMargin.right * 4
      ) // Set width based on text
      .attr("height", rectangleHeight - RectMargin.top - RectMargin.bottom)
      .on("mouseover", function () {
        d3.select(this)
          .attr("stroke-width", 3) // Change stroke-width on mouseover
          .attr("stroke", "white"); // Change stroke color on mouseover
      })
      .on("mouseout", function () {
        d3.select(this).attr("stroke-width", 0); // Reset stroke-width on mouseout
      })
      .on("click", function (event, d) {
        showNudi(d); // Pass the whole object instead of just d.image
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
      .attr(
        "x",
        columnPositions[index] + 5 + RectMargin.left + RectMargin.right
      ) // Use custom column positions

      //      .attr("x",(d, i) =>xScale(index) + index * 5 + 5 + RectMargin.left + RectMargin.right) // Adjust label position with spacing
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
    .style("transform", "translate(95%, -50%)")
    .style("display", "flex") // Use flexbox
    .style("flex-direction", "column") // Stack items vertically
    .style("align-items", "flex-end") // Align items to the right
    .style("z-index", 1000);

  // Append the image
  const image = NudiContainer.append("img")
    .attr("src", nudi.image.content) // Adjust as needed for the image path
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
    .text("Coordinates");

  // Add the latitude and longitude coordinates
  extraNudiInfo
    .append("p")
    .style("color", "white")
    .style("padding-top", "0")
    .text(
      `Latitude: ${nudi.latitude.content || "Not Available"} | Longitude: ${nudi.longitude.content || "Not Available"
      }`
    );

  // Create close button
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
