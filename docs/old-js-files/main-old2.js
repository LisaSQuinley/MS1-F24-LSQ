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
const mapwidth = 1920; // Set the width for your SVG
const mapheight = 1080; // Set the height for your SVG

let myNudies;
const Nudiprojection = d3.geoEquirectangular()
    .scale(250)
    .translate([mapwidth / 2, mapheight / 2]);
const Nudipath = d3.geoPath(Nudiprojection);

// Load and render the GeoJSON data
d3.json('data.geojson').then(data => {
    const svg = d3.select('body').append('svg') // Ensure you create an SVG element
        .attr('width', mapwidth)
        .attr('height', mapheight);

    // Draw the features
    svg.selectAll('path')
        .data(data.features)
        .enter().append('path')
        .attr('class', 'feature')
        .attr('d', Nudipath) // Use the path generator
        .attr('fill', 'steelblue') // Set a fill color
        .attr('stroke', 'white'); // Set a stroke color
}).catch(error => {
    console.error('Error loading the GeoJSON data:', error);
});

d3.json('ne_110m_admin_0_countries.json').then(data => 
    {
        const svg = d3.select('body').append('svg') // Ensure you create an SVG element
        .attr('width', mapwidth)
        .attr('height', mapheight);
            // Draw the features
            svg.selectAll('path')
            .data(data.features)
            .enter().append('path')
            .attr('class', 'feature')
            .attr('d', Nudipath) // Use the path generator
            .attr('fill', 'white') // Set a fill color
            .attr('stroke', 'steelblue'); // Set a stroke color
    }).catch(error => {
        console.error('Error loading the GeoJSON data:', error);
    }); // Load the GeoJSON data
    
    

// Load the data from the JSON file
d3.json('data.json').then(data => {
    myNudies = data; // Assign fetched data to myNudies
    console.log(myNudies.length);
    displayTaxonomy(); // Call displayTaxonomy after data is loaded
});








// Set up margins and dimensions for the SVG
const margin = { top: 20, right: 50, bottom: 20, left: 80 };
const width = 1920 - margin.left - margin.right;
const rectangleHeight = 30; // Height of each rectangle
const labelSpacing = 20;


// Define taxonomic levels to be displayed
const taxonomicLevels = ['tax_kingdom', 'tax_phylum', 'tax_class', 'tax_subclass', 'tax_order', 'tax_family', 'title'];


const xScale = d3.scaleLinear()
    .domain([0, taxonomicLevels.length - 1]) // Corrected domain
    .range([0, width]);

function displayTaxonomy() {
    if (!myNudies) return; // Ensure myNudies is defined
    const totalHeight = myNudies.length * rectangleHeight + margin.top + margin.bottom // Move this here to use the latest myNudies length
    const svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', totalHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    //    const columnWidth = width / taxonomicLevels.length; // Calculate column width
    const RectMargin = { top: 3, right: 3, bottom: 3, left: 3 }; // Margin for rectangles

    // Create rectangles for each taxonomic level
    taxonomicLevels.forEach((level, index) => {
        const textWidths = myNudies.map(d => {
            const textValueSubclass = level === 'tax_subclass' ? 'Heterobranchia ' : d[level]; // if level is tax_subclass, display 'Heterobranchia' instead
            const textElement = svg.append('text')
                .attr('class', `${level}-label`)
                .style('font-size', '12px')
                .style('font-family', '"Kodchasan", sans-serif')
                .style('font-weight', '600')
                .text(textValueSubclass); // if level is tax_subclass, display 'Heterobranchia' instead
            const width = textElement.node().getBBox().width; // Get the width of the text
            textElement.remove(); // Remove the temporary text element
            return width;
        });

        // Create rectangles based on calculated text widths
        svg.selectAll(`.${level}`)
            .data(myNudies)
            .enter()
            .append('rect')
            .attr('class', level)
            .attr('x', (xScale(index)))
//            .attr('x', xScale(index)) // Use xScale to determine x position
            .attr('y', (d, i) => i * rectangleHeight - RectMargin.top)
            .attr('width', (d, i) => textWidths[i] + (RectMargin.left * 4) + (RectMargin.right * 4)) // Set width based on text
            .attr('height', rectangleHeight - RectMargin.top - RectMargin.bottom)
            .on('click', function (event, d) {
                showNudi(d.image);
            });

    });
    // Create labels for each taxonomic level
    taxonomicLevels.forEach((level, index) => {
        svg.selectAll(`.${level}-label`)
            .data(myNudies)
            .enter()
            .append('text')
            .attr('class', `${level}-label`)
            .attr('x', xScale(index) + 5 + RectMargin.left + RectMargin.right) // Use xScale for label x position
            //                .attr('x', (d, i) => xScale(index) + (textWidths[i] + (RectMargin.left * 4) + (RectMargin.right * 4)) + labelSpacing)
            // Use xScale for label x position
            .attr('y', (d, i) => (i * rectangleHeight + 2) + RectMargin.top + RectMargin.bottom)
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .style('fill', 'white')
            .style('font-family', '"Kodchasan", sans-serif')
            .style('font-weight', '600')
            .text(d => level === 'tax_subclass' ? 'Heterobranchia ' : d[level]); // if level is tax_subclass, display 'Heterobranchia' instead
    });

}

function showNudi(image) {
    // Remove any existing image
    d3.select('#nudi-dish').remove();
    // Append a new div for the image
    const NudiContainer = d3.select('body')
        .append('div')
        .attr('id', 'nudi-dish')
        .style('position', 'fixed')
        .style('top', '50%')
        .style('right', '50%')
        .style('transform', 'translate(50%, -50%)')
        .style('z-index', 1000);

    // Append the image
    NudiContainer.append('img')
        .attr('src', image.content)
        .attr('alt', 'Taxonomic Image')
        .style('max-width', '500px') // Adjust size as needed
        .style('height', 'auto')
        .style('border', '2px solid white');
    }

