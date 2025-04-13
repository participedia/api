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
    // Sample data: each object has an "issue" (label) and a "count".
    const data = results;

    // Define dimensions for the two rows (label and bar) plus a gap between groups.
    const labelRowHeight = 20; // Height for the label row
    const barRowHeight = 24; // Height for the bar row
    const groupGap = 10; // Space between each group

    // Total height per data group
    const groupHeight = labelRowHeight + barRowHeight + groupGap;
    const numGroups = data.length;
    const chartHeight = numGroups * groupHeight;

    // Define margins for the SVG container.
    const margin = { top: 20, right: 0, bottom: 20, left: 0 };

    // Select the container element and its current width (for responsiveness)
    const container = document.getElementById("barChart");
    const containerWidth = container.clientWidth;

    // Compute the total SVG height including margins.
    const svgHeight = chartHeight + margin.top + margin.bottom;

    // Create a responsive SVG using viewBox for scaling.
    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("height", svgHeight)
      .attr("viewBox", `0 0 ${containerWidth} ${svgHeight}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    // Append a group element to respect the margins.
    const chartGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Determine the effective drawing width.
    const effectiveWidth = containerWidth - margin.left - margin.right;

    // Create a linear scale mapping the count value to a bar width that fills the available space.
    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => +d.count)])
      .range([0, effectiveWidth]);

    // Create a group for each data item.
    const groups = chartGroup
      .selectAll(".group")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "group")
      // Each group is positioned vertically by its index multiplied by groupHeight.
      .attr("transform", (d, i) => `translate(0, ${i * groupHeight})`);

    // --- First row: Label ---
    // Append the issue label centered vertically within the label row.
    groups
      .append("text")
      .attr("class", "label")
      .attr("x", 0)
      .attr("y", labelRowHeight / 2)
      .attr("dy", "0.35em")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(d => d.issue);

    // --- Second row: Bar with Count inside ---
    // Draw the horizontal bar starting at x=0. Its width is determined by the count value.
    groups
      .append("rect")
      .attr("class", "bar")
      .attr("x", 0)
      .attr("y", labelRowHeight) // Start right after the label row.
      .attr("width", d => x(+d.count))
      .attr("height", barRowHeight);

    // Overlay the count text inside each bar.
    // A small left offset (e.g., 5 pixels) is used so that the text is not flush against the edge.
    groups
      .append("text")
      .attr("class", "bar-count")
      .attr("x", 5) // Small offset from the left edge of the bar
      .attr("y", labelRowHeight + barRowHeight / 2)
      .attr("dy", "0.35em")
      // Choose a contrasting fill color for better visibility over the bar (e.g., white).
      .text(d => `${d.count} Cases` );

    // // Sample data: each object has a label and a count.
    // const data = results;
    // // Define a minimum bar height that fits the bold 18px text comfortably
    // const minBarHeight = 24;
    // const gap = 5; // Gap between bars in pixels
    // const numBars = data.length;
    // // Compute overall chart height (bars + gaps)
    // const chartHeight = numBars * minBarHeight + (numBars - 1) * gap;

    // // Define margins
    // const margin = { top: 20, right: 0, bottom: 20, left: 0 };

    // // Select the container element
    // const container = document.getElementById("barChart");
    // // Get the container's current width (for responsiveness)
    // const containerWidth = container.clientWidth;
    // // Compute SVG height including margins
    // const svgHeight = chartHeight + margin.top + margin.bottom;

    // // Create the responsive SVG: set width to "100%" and define viewBox for scaling
    // const svg = d3
    //   .select(container)
    //   .append("svg")
    //   .attr("width", "100%")
    //   .attr("height", svgHeight)
    //   .attr("viewBox", `0 0 ${containerWidth} ${svgHeight}`)
    //   .attr("preserveAspectRatio", "xMidYMid meet");

    // // Append a group element and translate it according to the margins
    // const chartGroup = svg
    //   .append("g")
    //   .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // // Effective width for drawing the bars (subtract left/right margins from containerWidth)
    // const effectiveWidth = containerWidth - margin.left - margin.right;

    // // Create a linear x-scale based solely on the count value.
    // // The scale maps the data from estimatedWidth (the baseline for text) to the full effective width.
    // const x = d3
    //   .scaleLinear()
    //   .domain([0, d3.max(data, d => +d.count)])
    //   .range([0, effectiveWidth]);

    // // Create the bars. Y-positions are computed manually using index, with fixed bar height and gap.
    // chartGroup
    //   .selectAll(".bar")
    //   .data(data)
    //   .enter()
    //   .append("rect")
    //   .attr("class", "bar")
    //   .attr("x", 0)
    //   .attr("y", (d, i) => i * (minBarHeight + gap))
    //   .attr("width", d => x(+d.count))
    //   .attr("height", minBarHeight);

    // // Append text labels to each bar. The label appears at the start of each bar with a small left offset.
    // chartGroup
    //   .selectAll(".bar-label")
    //   .data(data)
    //   .enter()
    //   .append("text")
    //   .attr("class", "bar-label")
    //   .attr("x", 5) // Small left offset
    //   .attr("y", (d, i) => i * (minBarHeight + gap) + minBarHeight / 2)
    //   .attr("dy", "0.35em") // Vertically centers the text
    //   .text(d => `${d.issue}: ${d.count} Cases`);
  },
};

export default barChart;
