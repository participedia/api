// barChart.js
import * as d3 from 'd3';

const barChart = {
  init(data) {
    // Use the provided data, or fallback to a default dataset.
    data = data || [
      { letter: "A", frequency: 0.08167 },
      { letter: "B", frequency: 0.01492 },
      { letter: "C", frequency: 0.02782 },
      { letter: "D", frequency: 0.04253 },
      { letter: "E", frequency: 0.12702 },
      { letter: "F", frequency: 0.02288 },
      { letter: "G", frequency: 0.02015 },
      { letter: "H", frequency: 0.06094 },
      { letter: "I", frequency: 0.06966 },
      { letter: "J", frequency: 0.00153 },
      { letter: "K", frequency: 0.00772 },
      { letter: "L", frequency: 0.04025 },
      { letter: "M", frequency: 0.02406 },
      { letter: "N", frequency: 0.06749 },
      { letter: "O", frequency: 0.07507 },
      { letter: "P", frequency: 0.01929 },
      { letter: "Q", frequency: 0.00095 },
      { letter: "R", frequency: 0.05987 },
      { letter: "S", frequency: 0.06327 },
      { letter: "T", frequency: 0.09056 },
      { letter: "U", frequency: 0.02758 },
      { letter: "V", frequency: 0.00978 },
      { letter: "W", frequency: 0.0236 },
      { letter: "X", frequency: 0.0015 },
      { letter: "Y", frequency: 0.01974 },
      { letter: "Z", frequency: 0.00074 }
    ];


    // Determine the container width dynamically.
    const container = document.getElementById('barChart');
    const width = container.clientWidth; // responsive width
    const height = 500;                  // fixed height

    // Chart margins.
    const marginTop = 30;
    const marginRight = 0;
    const marginBottom = 30;
    const marginLeft = 40;

    // Declare the x-scale.
    // Use d3.groupSort to sort letters descending by frequency.
    const x = d3.scaleBand()
      .domain(d3.groupSort(data, ([d]) => -d.frequency, d => d.letter))
      .range([marginLeft, width - marginRight])
      .padding(0.1);

    // Declare the y-scale.
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.frequency)])
      .range([height - marginBottom, marginTop]);

    // Create the SVG element and make it responsive.
    const svg = d3.select(container)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("style", "max-width: 100%; height: auto;");

    // Add a rectangle for each bar.
    svg.append("g")
      .attr("fill", "#242424")
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", d => x(d.letter))
      .attr("y", d => y(d.frequency))
      .attr("height", d => y(0) - y(d.frequency))
      .attr("width", x.bandwidth());

    // Add the x-axis.
    svg.append("g")
      .attr("transform", `translate(0, ${height - marginBottom})`)
      .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add the y-axis, remove the domain line, and add a label.
    svg.append("g")
      .attr("transform", `translate(${marginLeft}, 0)`)
      .call(d3.axisLeft(y)
        .tickFormat(yValue => (yValue * 100).toFixed()))
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", -marginLeft)
        .attr("y", 10)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start"));
  }
};

export default barChart;
