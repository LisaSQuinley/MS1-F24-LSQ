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
*/

// Load the data from the JSON file
d3.json('data.json').then(data => {
    myNudies = data;
    displayTaxonomy();
});

// Set up margins and dimensions for the SVG
const margin = { top: 20, right: 50, bottom: 20, left: 80 };
const width = innerWidth - margin.left - margin.right;
const height = innerHeight - margin.top - margin.bottom;

// Define taxonomic levels to be displayed
const taxonomicLevels = ['tax_kingdom', 'tax_phylum', 'tax_class', 'tax_subclass', 'tax_order', 'tax_family', 'title'];

function displayTaxonomy() {
    const svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const columnWidth = width / taxonomicLevels.length; // Calculate column width
    const rectangleHeight = 30; // Height of each rectangle
    const RectMargin = { top: 3, right: 3, bottom: 3, left: 3 }; // Margin for rectangles

    // Create rectangles for each taxonomic level
    taxonomicLevels.forEach((level, index) => {
        svg.selectAll(`.${level}`)
            .data(myNudies)
            .enter()
            .append('rect')
            .attr('class', level)
            .attr('x', index * columnWidth - RectMargin.left)
            .attr('y', (d, i) => i * rectangleHeight - RectMargin.top)
            .attr('width', columnWidth - RectMargin.left - RectMargin.right)
            .attr('height', rectangleHeight - RectMargin.top - RectMargin.bottom);
    });

    // Create labels for each taxonomic level
    taxonomicLevels.forEach((level, index) => {
        svg.selectAll(`.${level}-label`)
            .data(myNudies)
            .enter()
            .append('text')
            .attr('class', `${level}-label`)
            .attr('x', (index * columnWidth + 5) + RectMargin.left + RectMargin.right)
            .attr('y', (d, i) => (i * rectangleHeight + 2) + RectMargin.top + RectMargin.bottom)
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .style('fill', 'white')
            .style('font-family', '"Kodchasan", sans-serif') 
            .style('font-weight', '600')
            .text(d => level === 'tax_subclass' ? 'Heterobranchia' : d[level]);
    });
}
