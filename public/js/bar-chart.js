// barChart.js
import * as d3 from "d3";
import { xhrReq } from "./utils/utils.js";

const barChart = {
  init() {
    this.fetchChartResults();
  },

  fetchChartResults() {
    const successCB = response => {
      const results = JSON.parse(response.response).cases;
      this.drawChart(results);
    };
    const errorCB = response => {
      //console.log("err", response)
    };

    const url = `/entries/cases-group-general-issues`;
    xhrReq("GET", url, {}, successCB, errorCB);
  },
  drawChart(results) {
    // Sample data: each object has a label and a count.
    const data = results;

    // Merge "issue: count" and push to new array for baseline text measure
    // const mergedData = data.map(item => `${item.issue}: ${item.count}`);
    // // Find the longest string
    // const maxLengthItem = mergedData.reduce((a, b) =>
    //   a.length > b.length ? a : b
    // );
    // Estimate width based on character count (e.g., 8px per character)
    // const charWidth = 8;
    // const estimatedWidth = maxLengthItem.length * charWidth;

    // Define a minimum bar height that fits the bold 18px text comfortably
    const minBarHeight = 24;
    const gap = 5; // Gap between bars in pixels
    const numBars = data.length;
    // Compute overall chart height (bars + gaps)
    const chartHeight = numBars * minBarHeight + (numBars - 1) * gap;

    // Define margins
    const margin = { top: 20, right: 0, bottom: 20, left: 0 };

    // Select the container element
    const container = document.getElementById("barChart");
    // Get the container's current width (for responsiveness)
    const containerWidth = container.clientWidth;
    // Compute SVG height including margins
    const svgHeight = chartHeight + margin.top + margin.bottom;

    // Create the responsive SVG: set width to "100%" and define viewBox for scaling
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", svgHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Append a group element and translate it according to the margins
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Effective width for drawing the bars (subtract left/right margins from containerWidth)
    const effectiveWidth = containerWidth - margin.left - margin.right;

    // Create a linear x-scale based solely on the count value.
    // The scale maps the data from estimatedWidth (the baseline for text) to the full effective width.
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => +d.count)])
      .range([0, effectiveWidth]);

    // Create the bars. Y-positions are computed manually using index, with fixed bar height and gap.
    chartGroup
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", (d, i) => i * (minBarHeight + gap))
      .attr("width", d => x(+d.count))
      .attr("height", minBarHeight);

    // Append text labels to each bar. The label appears at the start of each bar with a small left offset.
    chartGroup
      .selectAll(".bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("x", 5) // Small left offset
      .attr("y", (d, i) => i * (minBarHeight + gap) + minBarHeight / 2)
      .attr("dy", "0.35em") // Vertically centers the text
      .text(d => `${d.issue}: ${d.count} Cases`);
  },
};

export default barChart;
