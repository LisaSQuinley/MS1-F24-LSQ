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

d3.json('data.json').then(data => {
    myNudies = data;
    displayTaxonomy();
});

const margin = { top: 20, right: 50, bottom: 20, left: 80 };
const width = innerWidth - margin.left - margin.right;
const height = innerHeight - margin.top - margin.bottom;

const taxonomicLevels = ['tax_kingdom', 'tax_phylum', 'tax_class', 'tax_subclass', 'tax_order', 'tax_family', 'title'];



function displayTaxonomy() {
    const svg = d3.select('body')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

/* 
    const yScale = d3.scaleBand()
        .domain(myNudies.map(d => d.sci_name))
        .range([0, height])
        .padding(0); // Added some padding for better spacing
 */

    const columnWidth = width / taxonomicLevels.length; // Calculate column width
    const rectangleHeight = 30; // Set your desired height here
    const RectMargin = { top: 3, right: 3, bottom: 3, left: 3 };
    // Tax rectangles
    taxonomicLevels.forEach((level, index) => {
        svg.selectAll(`.${level}`)
            .data(myNudies)
            .enter()
//            .filter(d => !(d.title === 'Nudibranchia' && (level === 'title' || level === 'tax_family'))) // Filter out unwanted rectangles
            .append('rect')
            .attr('class', level)
            .attr('x', (index * columnWidth)-RectMargin.left) // Position based on column index
            .attr('y', (d, i) => (i * rectangleHeight)-RectMargin.top) // Position based on data index
            .attr('text-wrap')
//            .attr('y', d => yScale(d.sci_name) + (yScale.bandwidth() - rectangleHeight) / 2) // Center the rectangle vertically
            .attr('width', columnWidth-RectMargin.left-RectMargin.right)
            .attr('height', rectangleHeight-RectMargin.top-RectMargin.bottom);
//            .attr('height', yScale.bandwidth());
    });

    // Tax labels
    taxonomicLevels.forEach((level, index) => {
        svg.selectAll(`.${level}-label`)
            .data(myNudies)
            .enter()
//            .filter(d => !(d.title === 'Nudibranchia' && (level === 'title' || level === 'tax_family'))) // Filter out unwanted rectangles

            .append('text')
            .attr('class', `${level}-label`)
            .attr('x', (index * columnWidth + 5)+RectMargin.left+RectMargin.right) // Adjust x position based on column index
            .attr('y', (d, i) => (i * rectangleHeight + 2)+RectMargin.top+RectMargin.bottom) // Adjust y position based on data index
//            .attr('y', d => yScale(d.sci_name) + (yScale.bandwidth() - rectangleHeight) / 2) // Center the rectangle vertically
            .attr('dy', '0.35em')
            .style('font-size', '12px')
            .style('fill', 'white')
            .style('font-family', '"Kodchasan", sans-serif') 
            .style('font-weight', '600') 

            .text(d => {
                // Check if the level is tax_subclass
                if (level === 'tax_subclass') {
                    return 'Heterobranchia'; // Set fixed label for tax_subclass because it's not available in the object data, but shows up in all the classifications on the si websites
                }
                return d[level]; // Use the specific values for other taxonomic levels
            });  
        });
}