
// load the data for 2018
d3.text('data/sotu-2018.txt').then(data => { 
  text = data;
  // split the text into lines
  lines = text.split('\n');
  // remove empty lines
  lines = lines.filter(i => i.length > 0);
  let frequency = analyzeData(lines);
  displayData(frequency, 'Word Frequency in the State of the Union Address 2018');
});

// load the data for 2022
d3.text('data/sotu-2022.txt').then(data => { 
  text = data;
  // split the text into lines
  lines = text.split('\n');
  // remove empty lines
  lines = lines.filter(i => i.length > 0);
  let frequency = analyzeData(lines);
  displayData(frequency, 'Word Frequency in the State of the Union Address 2022');
});

function analyzeData(lines) {
  let phrase;
  let frequency = [];
  // loop over the array
  lines.forEach(line => {
    // split the line into words
    let words = line.split(' ');
    // loop over the words
    words.forEach(word => {
      // remove empty words
      if(word.length == 0) return;
      // remove special characters, long way versus short way
      // phrase = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
      phrase = word.replace(/[^a-zA-Z ]/g, "");

      // get the part of speech for the cleaned word
      let posTags = RiTa.getPosTags(phrase);
      let pos = 'other';

      // check the part of speech and assign
      if (posTags.length > 0) {
        if (['nn', 'nns', 'nnp', 'nnps'].includes(posTags[0])) {
          pos = 'noun';
        } else if (['vb', 'vbd', 'vbg', 'vbn', 'vbp', 'vbz'].includes(posTags[0])) {
          pos = 'verb';
        } else if (['jj', 'jjr', 'jjs'].includes(posTags[0])) {
          pos = 'adjective';
        } else if (['rb', 'rbr', 'rbs'].includes(posTags[0])) {
          pos = 'adverb';
        }
      }

      // check if the word is in the array
      let match = frequency.find(i => i.pos === pos);
      // If found, increment the count
      if (match) {
        match.count++;
      } else {
        // If not found, add it to the array
        frequency.push({ pos: pos, count: 1 });
      }
    });
  });

  // show the frequency map
  console.log(frequency);
  // sort the frequency map
  frequency.sort((a, b) => (b.count - a.count));
  return frequency;
}

function displayData(pos, title) {
    // define dimensions and margins for the graphic
    const margin = ({top: 100, right: 50, bottom: 100, left: 80});
    const width = 1920 - margin.left - margin.right;
    const height = 1080 - margin.top - margin.bottom;

  // let's define our scales. 
  const yScale = d3.scaleLinear()
  .domain([0, d3.max(pos, d => d.count)+1])
  .range([height-margin.top, margin.bottom]);  

  const xScale = d3.scaleBand()
  .domain(pos.map(d => d.pos)) // I need to change this to pos not word
  .range([margin.left, width - margin.right])
  .padding(0.1);

  // create the svg element
  const svg = d3.select('body')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('style', 'background-color:#C8E6F4');
  
  // attach a graphic element, and append rectangles to it
  svg.append('g')
    .selectAll('rect')
    .data(pos)
    .join('rect')
    .attr('x', d => xScale(d.pos)) // I need to change this to pos not word
    .attr('y', d => yScale(d.count))
    .attr('height', d => yScale(0) - yScale(d.count))
    .attr('width', xScale.bandwidth())
    .style('fill', 'steelblue');

  // add the x axis
  const xAxis = d3.axisBottom(xScale);

  svg.append('g')
    .attr('transform', `translate(0, ${height - margin.bottom})`)
    .call(xAxis)
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.6em')
    .attr('dy', '-0.1em')
    .style('font-size', '16px')
    .attr('transform', d => {return 'rotate(-45)' });

  // add the y axis
  const yAxis = d3.axisLeft(yScale).ticks(5);

  svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(yAxis);

  // add the title
  svg.append('text')
    .attr('x', margin.left)
    .attr('y', 50)
    .style('font-size', '24px')
    .style('font-family', 'sans-serif')
    .style('font-weight', 'bold')
    .text(title);

}

