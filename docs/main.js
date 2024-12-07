let geoData = []; // Declare geoData in a higher scope
let groupedData = []; // Declare groupedData in a higher scope
let groupedPalettes = []; // Declare groupedPalettes in a higher scope
// Global variable to track which circles are currently displayed
let currentRendering = 'circles'; // Default to renderCircles
//let activeColorSelections = new Map(); // Will store color -> grouped swatches mapping


// Load GeoJSON data
d3.json("data.geojson").then((data) => {
  // Store geoData globally or in an accessible scope
  geoData = data; // Remove const to avoid creating a new variable

  // Group the data by location
  groupedData = groupDataByLocation(geoData);

  // Render circles (if you have a function for this)
  renderCircles(groupedData);

  // Load image files and extract palettes
  const NudiDivs = d3.select("#NudiDivs");
  extractPalettes(NudiDivs, geoData); // Pass geoData here

  // Display the palettes WHAT AM I DOING WRONG HERE?
  const NudiColors = d3.select("#NudiColors");
  CategorizedSwatches(NudiColors, geoData); // Pass geoData here

  // Call the initialize function somewhere in your code
  initializeVisualization(NudiDivs, NudiColors, geoData);

  TaxonomyChart(geoData);

});

const ProjectTitle = d3.select("header").append("div");

const SwatchTooltip = d3
  .select("body")
  .append("div")
  .attr("class", "SwatchTooltip")
  .style("position", "absolute")
  .style("background", "rgba(0, 0, 0, 0.8)")
  .style("visibility", "hidden")
  .style("opacity", 0)
  .style("pointer-events", "none");


ProjectTitle.attr("id", "title")
  .style("margin-left", "0px")
  .style("background-color", "lightgray") // Optional: Add background color for styling
  .style("text-align", "left") // Optional: Center text
  .style("padding", "10px");

ProjectTitle.append("h1")
  .text("Nudibranchs in Full Color")
  .style("padding-left", "15px")
  .style("display", "inline");

ProjectTitle.append("h2")
  .text("Tracing Their Roots and Radiant Hues")
  .style("display", "inline");

// Create a new div for displaying palettes
const NudiDivs = d3
  .select("body")
  .append("div")
  .attr("id", "NudiDivs")
  .style("background", "black")
  .transition()
  .duration(3500)
  .style("opacity", 1);

const NudiColors = d3
  .select("body")
  .append("div")
  .attr("id", "NudiColors")
  .attr("align", "center")
  .style("padding-top", "10px")
  .style("background", "black");

const NudiTaxi = d3
  .select("body")
  .append("div")
  .attr("id", "NudiTaxi")
  .attr("align", "center")
  .style("padding-top", "10px")
  .style("background", "black");

  const radios = NudiColors
  .append("form")
  .selectAll("div")
  .append("md-radio-group")
  .data(["Reds", "Purples", "Blues", "Greens", "Yellows", "Oranges", "Browns", "Blacks", "Whites", "Other"]) 
  .enter()
  .append("div")
  .attr("class", "radio")
  .style("display", "inline-flex") 
  .style("align-items", "center") 
  .style("padding", "5px")
  .style("margin", "5px") 
  .append("label") // Append label first
  .style("display", "inline-flex") // Make label display inline-flex
  .style("align-items", "center") // Align items vertically within label
  .append("md-radio")
  .attr("class", function (d) { return `radio-${d}`; })
  .attr("name", "colorGroup")  // Ensure all radio buttons have the same name
  .on("change", function (event, d) {


/*    
    const checkbox = d3.select(this);
    const isChecked = checkbox.property("checked");
    const nudiColorsDiv = d3.select("#swatchBox");
    const nudiColorsDivNode = nudiColorsDiv.node();

    // Handle all color cases
    if (d === "Reds") {
      const redSwatches = d3.selectAll(".firebrick, .maroon, .crimson, .orangered, .hotpink, .indianred, .lightcoral, .brown, .darkred, .sienna, .lightsalmon, .darksalmon");

      if (isChecked) {
        const groupedRedSwatches = groupSwatchesByNudiId(redSwatches);
        activeColorSelections.set('Reds', groupedRedSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedRedSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Reds');
        redSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Purples") {
      const purpleSwatches = d3.selectAll(".indigo, .plum, .darkorchid, .mediumorchid, .purple, .lightpink");

      if (isChecked) {
        const groupedPurpleSwatches = groupSwatchesByNudiId(purpleSwatches);
        activeColorSelections.set('Purples', groupedPurpleSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedPurpleSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Purples');
        purpleSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }

    }
    else if (d === "Blues") {
      const blueSwatches = d3.selectAll(".darkslateblue, .slategrey, .midnightblue, .steelblue, .lightsteelblue, .cadetblue, .mediumturquoise, .teal, .darkturquoise, .lightblue, .darkcyan, .slateblue, .skyblue, .cornflowerblue, .lightskyblue, .powderblue, .lightslategrey");

      if (isChecked) {
        const groupedBlueSwatches = groupSwatchesByNudiId(blueSwatches);
        activeColorSelections.set('Blues', groupedBlueSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedBlueSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Blues');
        blueSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Greens") {
      const greenSwatches = d3.selectAll(".forestgreen, .darkolivegreen, .yellowgreen, .olive, .seagreen, .olivedrab");

      if (isChecked) {
        const groupedGreenSwatches = groupSwatchesByNudiId(greenSwatches);
        activeColorSelections.set('Greens', groupedGreenSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedGreenSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Greens');
        greenSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    }
    else if (d === "Yellows") {
      const yellowSwatches = d3.selectAll(".sandybrown, .goldenrod, .gold, .darkgoldenrod, .khaki, .palegoldenrod, .burlywood, .darkkhaki");

      if (isChecked) {
        const groupedYellowSwatches = groupSwatchesByNudiId(yellowSwatches);
        activeColorSelections.set('Yellows', groupedYellowSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedYellowSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Yellows');
        yellowSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Oranges") {
      const orangeSwatches = d3.selectAll(".darkorange, .orange, .chocolate, .peru");

      if (isChecked) {
        const groupedOrangeSwatches = groupSwatchesByNudiId(orangeSwatches);
        activeColorSelections.set('Oranges', groupedOrangeSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedOrangeSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Oranges');
        orangeSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Blacks") {
      const blackSwatches = d3.selectAll(".black");

      if (isChecked) {
        const groupedBlackSwatches = groupSwatchesByNudiId(blackSwatches);
        activeColorSelections.set('Blacks', groupedBlackSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedBlackSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Blacks');
        blackSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Whites") {
      const whiteSwatches = d3.selectAll(".silver, .antiquewhite, .floralwhite, .lavender, .wheat, .whitesmoke, .lightgrey, .tan");

      if (isChecked) {
        const groupedWhiteSwatches = groupSwatchesByNudiId(whiteSwatches);
        activeColorSelections.set('Whites', groupedWhiteSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedWhiteSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Whites');
        whiteSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Other") {
      const otherSwatches = d3.selectAll(".darkslategrey, .grey, .darkgrey, .dimgrey");

      if (isChecked) {
        const groupedOtherSwatches = groupSwatchesByNudiId(otherSwatches);
        activeColorSelections.set('Other', groupedOtherSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedOtherSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Other');
        otherSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    } else if (d === "Browns") {
      const brownSwatches = d3.selectAll(".saddlebrown, .rosybrown");

      if (isChecked) {
        const groupedBrownSwatches = groupSwatchesByNudiId(brownSwatches);
        activeColorSelections.set('Browns', groupedBrownSwatches);

        if (activeColorSelections.size > 1) {
          const intersectingNudis = findIntersectingNudis(activeColorSelections);
          intersectingNudis.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        } else {
          groupedBrownSwatches.forEach((swatch) => {
            swatch[1].forEach((s) => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      } else {
        activeColorSelections.delete('Browns');
        brownSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node());
        });

        if (activeColorSelections.size > 0) {
          const remainingIntersections = findIntersectingNudis(activeColorSelections);
          remainingIntersections.forEach(nudiGroup => {
            nudiGroup[1].forEach(s => {
              const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
              const parent = currentSwatch.node().parentNode;
              parent.insertBefore(currentSwatch.node(), parent.firstChild);
            });
          });
        }
      }
    }



  })
  .each(function (d) {
    d3.select(this.parentNode)
      .append("span")
      .style("margin-left", "5px")
      .style("color", "white")
      .text(d);
  });

function findIntersectingNudis(activeSelections) {
  const allGroups = Array.from(activeSelections.values());

  // If only one color is selected, return its groups
  if (allGroups.length === 1) return allGroups[0];

  // Get all Nudi IDs from first color group
  const firstGroupNudiIds = new Set(allGroups[0].map(group => group[0]));

  // Find Nudi IDs that appear in all other color groups
  const commonNudiIds = new Set(
    Array.from(firstGroupNudiIds).filter(nudiId =>
      allGroups.every(colorGroup =>
        colorGroup.some(group => group[0] === nudiId)
      )
    )
  );

  // Return the full grouped data for common Nudi IDs
  return allGroups[0].filter(group => commonNudiIds.has(group[0]));
}

function groupSwatchesByNudiId(swatchesArray) {
  const groupedByNudiId = d3.rollup(
    swatchesArray.data(),  // The bound data
    v => v,  // Extract the nudi_id from each element
    d => d.Nudi_id  // Group by nudi_id
  );

  const sortedByGroupLength = Array.from(groupedByNudiId)  // Convert Map to array
    .sort(([, a], [, b]) => a.length - b.length);

  return sortedByGroupLength;
}

*/   

// THIS WAS IN THE SETUP WHERE IT WORKS JUST FOR HIGHLIGHTING COLORS
    const radio = d3.select(this);
    const isChecked = radio.property("checked");
    const nudiColorsDiv = d3.select("#swatchBox");
    const nudiColorsDivNode = nudiColorsDiv.node();
    // const allSwatches = [];

  
    if (d === "Reds") {
      const redSwatches = d3.selectAll(".firebrick, .maroon, .crimson, .orangered, .hotpink, .indianred, .lightcoral, .brown, .darkred, .sienna, .lightsalmon, .darksalmon"); // Select both firebrick and maroon swatches

      const selectedSwatches = groupSwatchesByNudiId(redSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            // console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        redSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Purples") {
      const purpleSwatches = d3.selectAll(".indigo, .plum, .darkorchid, .mediumorchid, .purple, .lightpink");

      const selectedSwatches = groupSwatchesByNudiId(purpleSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        purpleSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Blues") {
      const blueSwatches = d3.selectAll(".darkslateblue, .slategrey, .midnightblue, .steelblue, .lightsteelblue, .cadetblue, .mediumturquoise, .teal, .darkturquoise, .lightblue, .darkcyan, .slateblue, .skyblue, .cornflowerblue, .lightskyblue, .powderblue, .lightslategrey");

      const selectedSwatches = groupSwatchesByNudiId(blueSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        blueSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Greens") {
      const greenSwatches = d3.selectAll(".forestgreen, .darkolivegreen, .yellowgreen, .olive, .seagreen, .olivedrab");

      const selectedSwatches = groupSwatchesByNudiId(greenSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        greenSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Yellows") {
      const yellowSwatches = d3.selectAll(".sandybrown, .goldenrod, .gold, .darkgoldenrod, .khaki, .palegoldenrod, .burlywood, .darkkhaki");

      const selectedSwatches = groupSwatchesByNudiId(yellowSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        yellowSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Oranges") {
      const orangeSwatches = d3.selectAll(".darkorange, .orange, .chocolate, .peru");

      const selectedSwatches = groupSwatchesByNudiId(orangeSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        orangeSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Blacks") {
      const blackSwatches = d3.selectAll(".black");

      const selectedSwatches = groupSwatchesByNudiId(blackSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        blackSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Whites") {
      const whiteSwatches = d3.selectAll(".silver, .antiquewhite, .floralwhite, .lavender, .wheat, .whitesmoke, .lightgrey, .tan");

      const selectedSwatches = groupSwatchesByNudiId(whiteSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        whiteSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Other") {
      const otherSwatches = d3.selectAll(".darkslategrey, .grey, .darkgrey, .dimgrey");

      const selectedSwatches = groupSwatchesByNudiId(otherSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        otherSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
    if (d === "Browns") {
      const brownSwatches = d3.selectAll(".saddlebrown, .rosybrown");

      const selectedSwatches = groupSwatchesByNudiId(brownSwatches);
      //console.log(selectedSwatches); 
      if (isChecked) {

        selectedSwatches.forEach((swatch) => {
          swatch[1].forEach((s) => {
            console.log(s);
            const currentSwatch = nudiColorsDiv.select(`.${s.Nudi_id}.${s.color.key}`);
            // console.log(currentSwatch.node()); 
            const parent = currentSwatch.node().parentNode; // Get the parent container of the swatch
            // console.log(parent); 
            parent.insertBefore(currentSwatch.node(), parent.firstChild); // Move the swatch to the top of its parent
          })
        });

      } else {
        brownSwatches.each(function () {
          const swatch = d3.select(this);
          const parent = swatch.node().parentNode;
          parent.appendChild(swatch.node()); // Move swatch to the bottom (or wherever you prefer)
        });
      }
    }
  })

  .each(function (d) {
    d3.select(this.parentNode) // Select the parent label
      .append("span") // Add a span for the text
      .style("margin-left", "5px")
      .style("color", "white")
      .text(d); // Use the data for the text label
  });

function groupSwatchesByNudiId(swatchesArray) {
  console.log(swatchesArray);
  const groupedByNudiId = d3.rollup(
    swatchesArray.data(),  // The bound data
    v => v,  // Extract the nudi_id from each element
    d => d.Nudi_id  // Group by nudi_id
  );

  const sortedByGroupLength = Array.from(groupedByNudiId)  // Convert Map to array
    .sort(([, a], [, b]) => a.length - b.length);

  return sortedByGroupLength;
}



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
  .attr("id", "globalMap")
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
const circlesGroup = svg
  .append("g")
  .attr("id", "circles-layer");

  function updateProjection() {
    const mapwidth = window.innerWidth;
    const mapheight = window.innerHeight;
  
    Nudiprojection.scale(mapwidth / 6.25).translate([
      mapwidth / 2,
      mapheight / 2,
    ]);
  
    TaxonomyChart(geoData);
  
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
      "Nudibranchs are often tiny, toxic sea slugs that are brightly colored. They're a favorite for scuba divers who like little things to look at. New ones are being discovered all the time. The Smithsonian's invertebrate zoology collection has a number of specimens which include nudibranchia. The data available for this Order includes location, taxonomic name, depth found (and others) – some of these aspects are explored in my project. A few highlights are visible here – a geographical map for location which is also viewable by the most common colors in the nudie image (as analyzed through Vibrant.js), the taxonomic name of these marine slugs, and an image from the Smithsonian's collection.",
  },
  {
    title: "The Many Faces and Names of Marine Slugs",
    content:
      "When you select the nudie image, gray color bands will appear underneath, displaying the scientific system of classification for these lovely little sea slugs. Included are their taxonomic levels and a brief overview. Hover over each label within the taxonomy to see the scientific name and the specific level for it.",
  },
  {
    title: "Unveiling the Vibrant Palette of Nudies",
    content:
      "Using Vibrant.js to extract color palettes from images of nudibranchs, I took the six main swatches of each nudie and displayed them as another way to explore the colors of nudibranchs with my project. Each image has a palette of six swatches generated. In Vibrant.js these were categorized as Vibrant, Muted, Dark Vibrant, Dark Muted, Light Vibrant, Light Muted, please note that the color analysis is not perfect and occasionally will catch colors not associated with the nudie (i.e. copyright names on the images). Hover over a color to see what nudibranch image it's generated from.",
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
  .text("Clear All")
  .on("click", clearSelections)
  .style("transition", "background-color 0.3s, transform 0.2s") // Transition for hover effect
  .on("mouseover", function () {
    d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
  })
  .on("mouseout", function () {
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

  d3.selectAll("rect").attr("stroke-width", 0);

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

const NudiSwatchTooltip = d3
  .select("body")
  .append("div")
  .attr("class", "NudiSwatchTooltip")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("background", "rgba(0, 0, 0, 0.8)")
  .style("fill", "white")
  .style("padding", "5px 10px 5px 10px")
  .style("font-family", '"Kodchasan", sans-serif')
  .style("font-weight", "600");


// Initialize the visualization
async function initializeVisualization(NudiDivs, NudiColors, geoData) {
  // Wait for extractPalettes to resolve before continuing
  const groupedData = await extractPalettes(NudiDivs, geoData);
  // I was calling displayPalettes here, but it should be called after the promise resolves
  // Once the promise resolves, call displayPalettes
  displayPalettes(groupedData, NudiDivs, geoData);
  const globalMap = d3.select("#globalMap");
  globalMap.classed("clickable", true);
  globalMap.classed("not-clickable", false);
  const nudiColorsDiv = d3.select("#NudiColors");
  nudiColorsDiv.classed("clickable", false);
  nudiColorsDiv.classed("not-clickable", true);
  const TaxiTree = d3.select("#NudiTaxi");
  TaxiTree.classed("clickable", false);
  TaxiTree.classed("not-clickable", true);
}


// Function to show the circles
function showCircles() {
  if (currentRendering === 'circles') return; // No action if already rendering circles

  circlesGroup.selectAll("circle").remove();
  circlesGroup.selectAll("text").remove(); 
  d3.select('#NudiColors').style("opacity", 0); // Set opacity to 0

  const TaxiTree = d3.select("#NudiTaxi");
  TaxiTree.classed("clickable", false);
  TaxiTree.classed("not-clickable", true);
  TaxiTree.style("opacity", 0);

  const nudiColorsDiv = d3.select("#NudiColors");
  nudiColorsDiv.classed("clickable", false); // Add clickable class
  nudiColorsDiv.classed("not-clickable", true);

  const globalMap = d3.select("#globalMap");
  globalMap.classed("clickable", true);
  globalMap.classed("not-clickable", false);

  renderCircles(groupedData); // Pass the appropriate data
  currentRendering = 'circles'; // Update current rendering state

}


function showTaxi() {
  if (currentRendering === 'taxis') return; // No action if already rendering taxonomy

  // Clear existing circles and text
  circlesGroup.selectAll("circle").remove();
  circlesGroup.selectAll("text").remove(); // Clear any existing text
  d3.select('#NudiColors').style("opacity", 0); // Set opacity to 0

  const TaxiTree = d3.select("#NudiTaxi");
  TaxiTree.classed("clickable", true);
  TaxiTree.classed("not-clickable", false);

  const globalMap = d3.select("#globalMap");
  globalMap.classed("clickable", false);
  globalMap.classed("not-clickable", true);

  const nudiColorsDiv = d3.select("#NudiColors");
  nudiColorsDiv.classed("clickable", false); // Add clickable class
  nudiColorsDiv.classed("not-clickable", true);

  circlesGroup.selectAll("circle").attr("opacity", 0);
  nudiColorsDiv.style("opacity", 0); 
  TaxiTree.style("opacity", 1);

  TaxonomyChart(geoData); // Pass the appropriate data
  currentRendering = 'taxis'; // Update current rendering state

}

function showColorPalettes() {
  if (currentRendering === 'colorPalettes') return;

  const globalMap = d3.select("#globalMap");
  globalMap.classed("clickable", false);
  globalMap.classed("not-clickable", true);

  circlesGroup.selectAll("circle").remove();
  circlesGroup.selectAll(".count-label").remove();
  circlesGroup.selectAll(".count-label").attr("opacity", 0);
  circlesGroup.selectAll("circle").attr("opacity", 0); 

  const TaxiTree = d3.select("#NudiTaxi");
  TaxiTree.classed("clickable", false);
  TaxiTree.classed("not-clickable", true);
  TaxiTree.style("opacity", 0);
     
  const nudiColorsDiv = d3.select("#NudiColors");
  nudiColorsDiv.classed("clickable", true); 
  nudiColorsDiv.classed("not-clickable", false);
  nudiColorsDiv.style("opacity", 1); 

  currentRendering = 'colorPalettes';
}

const showCirclesButton = d3
  .select("header")
  .append("button")
  .attr("id", "showCirclesButton")
  .text("Locations")
  .on("click", showCircles) // Call the showCircles function
  .style("transition", "background-color 0.3s, transform 0.2s") // Transition for hover effect
  .on("mouseover", function () {
    d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
  })
  .on("mouseout", function () {
    d3.select(this).style("transform", "scale(1)"); // Reset scale
  });

const showColorSwatchesButton = d3
  .select("header")
  .append("button")
  .attr("id", "showColorSwatchesButton")
  .text("Swatches")
  .on("click", function () {
    // Trigger the CategorizedSwatches function on button click
    showColorPalettes(geoData); 
  })
  .style("transition", "background-color 0.3s, transform 0.2s") // Transition for hover effect
  .on("mouseover", function () {
    d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
  })
  .on("mouseout", function () {
    d3.select(this).style("transform", "scale(1)"); // Reset scale
  });


  const showTaxonomyButton = d3
  .select("header")
  .append("button")
  .attr("id", "showTaxonomyButton")
  .text("Taxonomy")
  .on("click", function () {
    showTaxi(geoData);
  })
  .style("transition", "background-color 0.3s, transform 0.2s") 
  .on("mouseover", function () {
    d3.select(this).style("transform", "scale(1.05)"); // Slight scale on hover
  })
  .on("mouseout", function () {
    d3.select(this).style("transform", "scale(1)"); // Reset scale
  });


// Initial rendering
showCircles(); // Show circles by default



function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function CategorizedSwatches(NudiColors, geoData) {
  // console.log("");
  //console.log(NudiColors);
  // Loop through each feature in the GeoJSON

  const geoDataSplitArray = [];

  // split up geoData into an array which should be six times the length of geoData 
  geoData.features.forEach((feature) => {
    const featureProperties = feature.properties;
    if (featureProperties.palettes) {
      featureProperties.palettes.forEach((p) => {
        geoDataSplitArray.push({
          Nudi_id: featureProperties.Nudi_id,
          color: p, // RGB color values
          tax_family: featureProperties.tax_family, // Final tax_family value after both conditions
          key: p.key, // Key for the palette (e.g., 'Vibrant', 'DarkVibrant')
          category: p.category // Category for the palette (e.g., 'Vibrant', 'DarkVibrant') 
        })
      });
    }
  })

  const swatchBox = NudiColors.append("div").attr("id", "swatchBox");

  const shuffledFeatures = shuffle(geoDataSplitArray);
  // console.log(geoData); 

  // For each swatch, create a rectangle and append it to the #NudiColors div
  shuffledFeatures.forEach((swatch) => {
    // console.log(swatch.color.swatch);
    const ColorContainer = swatchBox
      .append("svg")
      .data([swatch])
      .style("margin", "10px")
      .attr("class", `${swatch.tax_family} ${swatch.Nudi_id} ${swatch.key} ${swatch.category} svg-rect`)
      .attr("width", 50)  // Set the width of the SVG to match the rect
      .attr("height", 50) // Set the height of the SVG to match the rect
      .append("rect")
      .attr("fill", `rgb(${swatch.color.swatch.join(",")})`)
      .style("fill-opacity", 1)
      .style("width", "50px")
      .style("height", "50px")
      .style("display", "flex")
      .style("z-index", 10)
      .on("mouseover", function (event, d) {
        NudiSwatchTooltip.html(
          `<p>${d.tax_family}</p>`
        )
          .style("visibility", "visible")
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mousemove", function (event) {
        NudiSwatchTooltip.style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        NudiSwatchTooltip.style("visibility", "hidden");
      })
      .on("click", function (event, d) {

        const nudiDivs = d3.select("#NudiDivs");
        const nudiDivNode = nudiDivs.node();
        const nudiDivCurrentChild = nudiDivs.select(`div.${d.Nudi_id}`);
        const nudiDivCurrentChildNode = nudiDivCurrentChild.node();

        // Clear selected state of all rect except for the clicked one
        d3.selectAll("rect").each(function (d) {
          d3.select(this).attr("stroke-width", 0);
        });

        // clear selected state of all previous divs except for the clicked one

        nudiDivs.select("div").each(function (d) {
          d3.select(this).style("border", "20px solid black")
            .style("background-color", "black");
          d3.select("h4").style("color", "white");
          d3.select(".AddDetails h5").style("color", "white");
          d3.select("p").style("color", "white");
          d3.select(".AddDetails").style("border-top", "15px solid black");
          d3.select(".NudiTaxonomy").style("border-top", "15px solid black");
        });

        d3.select(this)
          .attr("stroke-width", 5)
          .attr("stroke", "white")
          .attr("opacity", 1);

        // Update background color for associated divs of the selected swatch
        nudiDivCurrentChild
          .style("border", "20px solid white")
          .style("background-color", "white")
          .selectAll("h4").style("color", "black");
        nudiDivCurrentChild.selectAll(".AddDetails h5").style("color", "black")
          .selectAll("p").style("color", "black");
        nudiDivCurrentChild.select(".AddDetails").style("border-top", "15px solid white");
        nudiDivCurrentChild.select(".NudiTaxonomy").style("border-top", "15px solid white");

        // Reorder the associated divs to the top (move them to the top in the DOM
        nudiDivNode.insertBefore(nudiDivCurrentChildNode, nudiDivNode.firstChild); // Move div to the beginning of its parent's child list (top in the visual order)

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
        const swatchesDiv = d3.select(this).select(".swatchesDiv");
        const isSwatchVisible = swatchesDiv.style("display") === "block";
        swatchesDiv.style("display", isSwatchVisible ? "none" : "block");
      });

      NudiContainer.append("h4")
        .style("padding-bottom", "15px")
        .text(d.properties.sci_name)
        .style("color", "white");

      NudiContainer.append("img")
        .attr("src", nudiBranchImageURL)
        .attr("alt", d.properties.title)
        .style("display", "block");

      NudiContainer
        .append("div")
        .style("display", "none")
        .attr("class", "swatchesDiv");

      const paletteTitle = NudiContainer
        .select(".swatchesDiv")
        .append("div")
        .append("h4")
        .style("color", "white")
        .style("padding", "10px 0px 5px 0px")
        .text("Main Colors");


      correspondingImageSwatches.forEach((swatch) => {
        const keys = Object.keys(swatch.swatch);

        const rgbColor = swatch.swatch._rgb;

        const formattedPaletteKey = swatch.key
          .replace(/([A-Z])/g, " $1") // Adds space before capital letters
          .replace(/_/g, " ") // Replaces underscores with spaces
          .trim(); // Removes leading/trailing spaces

        const swatchesDiv = NudiContainer.select(".swatchesDiv");

        swatchesDiv
          .append("div")
          .style("display", "flex")
          .style(
            "background-color",
            `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
          )
          .style("flex", "1 1 auto")
          .style("height", "30px")
          //.text(formattedPaletteKey)
          .style("display", "flex") // Enable flexbox
          .style("justify-content", "center") // Center horizontally
          .style("align-items", "center") // Center vertically
          .on("mouseover", function (event) {
            SwatchTooltip.html(
              `Color: rgb (${Math.round(rgbColor[0])}, ${Math.round(rgbColor[1])}, ${Math.round(rgbColor[2])})`
            )
              .style("left", event.pageX + 5 + "px")
              .style("top", event.pageY + 5 + "px")
              .style("visibility", "visible")
              .style("opacity", 1);
          }
          )
          .on("mousemove", function (event) {
            SwatchTooltip.style("left", event.pageX + 5 + "px")
              .style("top", event.pageY + 5 + "px");
          }
          )
          .on("mouseout", function () {
            SwatchTooltip.style("visibility", "hidden").style("opacity", 0);
          }
          );
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

function TaxonomyChart(geoData) {
  // Select the container element and get its dimensions
  const container = d3.select("#NudiTaxi");
  const containerWidth = container.node().getBoundingClientRect().width;
  const containerHeight = container.node().getBoundingClientRect().height;

  container.select("svg").remove();

  // Create the SVG element for the tree chart with dynamic width and height
  const TaxonomySVG = container
    .append("svg")
    .attr("width", containerWidth)
    .attr("height", containerHeight);

  const taxonomyData = d3.rollup(
    geoData.features,
    (v) =>
      d3.rollup(
        v,
        (group) => group.length,
        (d) => d.properties.title,
        (d) => d.properties.tax_family,
        (d) => d.properties.Nudi_id
      ),
    (d) => d.properties.tax_order,
  );

  //console.log("Flattened Taxonomy Data:", taxonomyData);

  // Convert the taxonomy data to hierarchical format starting from tax_order
  const hierarchyData = Array.from(taxonomyData.entries()).map(
    ([tax_order, familyMap]) => ({
      name: tax_order,
      children: Array.from(familyMap.entries()).map(
        ([tax_family, titleMap]) => {
          let familyNode = {
            name: tax_family,
            children: [],
            value: 0, // Sum of species count for each family
          };

          // Group titles and accumulate their counts
          Array.from(titleMap.entries()).forEach(
            ([title, count]) => {
              familyNode.children.push({
                name: title,
                value: count,
              });
              familyNode.value += count; // Add the title's count to the family's value
            }
          );

          return familyNode;
        }
      ),
    })
  );

  //console.log("Hierarchy Data:", hierarchyData);

  // The hierarchyData is now starting from tax_order, no need for root-level taxonomic groups
  const rootData = d3
    .hierarchy({
      children: hierarchyData, // No "name": "Root", just use the tax_order data directly as children
    })
    .sum((d) => d.value || 0) // Sum the values for node sizes
    .sort((a, b) => b.value - a.value); // Sort nodes based on the value for better positioning

  // Create a horizontal tree layout (swap x and y axes)
  const treeLayout = d3
    .tree()
    .size([containerHeight - 75, containerWidth - 25]) // Size adjusted for horizontal layout
    .separation((a, b) => 1); // Define the separation between nodes (adjust as needed)

  // Apply the tree layout to the hierarchical data
  const treeData = treeLayout(rootData);

  const treeGroup = TaxonomySVG.append("g").attr(
    "transform",
    "translate(0, 10)"
  );

  // Render the horizontal tree chart
  // Add links (lines between parent and child nodes)
  treeGroup
    .selectAll(".link")
    .data(treeData.links())
    .enter()
    .append("line")
    .attr("class", "link")
    .attr("x1", (d) => d.source.y) // Swap x and y for horizontal
    .attr("y1", (d) => d.source.x)
    .attr("x2", (d) => d.target.y) // Swap x and y for horizontal
    .attr("y2", (d) => d.target.x)
    .attr("stroke", (d) => {
      // Color based on depth of the source node
      switch (d.source.depth) {
        case 1: return "#555658"; // Color for level 1
        case 2: return "#474749"; // Color for level 2
        case 3: return "#373537"; // Color for level 3
        default: return "#000000";  // Default color for other levels
      }
    })
    .attr("stroke-width", 1);
  // Add nodes (circles) instead of text
  const nodes = treeGroup
    .selectAll(".node")
    .data(treeData.descendants().slice(1)) // Skip the root node by slicing off the first element
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", (d) => `translate(${d.y}, ${d.x})`); // Swap x and y for horizontal

  // Add circles for each node
  nodes
  .append("circle")
  .attr("r", 5) // Fixed radius for the circle
  .attr("fill", (d) => {
    // Color based on the depth of the node
    switch (d.depth) {
      case 1: return "#555658"; // Color for level 1
      case 2: return "#474749"; // Color for level 2
      case 3: return "#373537"; // Color for level 3
      default: return "#000000";  // Default color for other levels
    }
  })
  .attr("stroke", "black")
  .style("stroke-width", 1);
}

