// barChart.js
import * as d3 from "d3";
import { xhrReq } from "./utils/utils.js";

const barChart = {
  data: null,
  issueMap: null,
  scopeMap: null,
  init() {
    this.fetchAllData();
    document.getElementById("resetFilters")
      .addEventListener("click", () => this.resetFilters());
  },

  resetFilters() {
    // simply redraw full data
    this.drawBarChart(this.data.general);
    this.drawPieChart(this.data.scope);
  },


  fetchAllData() {
    xhrReq("GET", "/entries/cases-charts", {}, response => {
      const { generalIssues, scopeOfInfluence, combined } = JSON.parse(response.response);
      this.data = { general: generalIssues, scope: scopeOfInfluence, combined };

      // build lookup maps
      this.issueMap = new Map(generalIssues.map(d => [d.key, d.issue]));
      this.scopeMap = new Map(scopeOfInfluence.map(d => [d.key, d.scope_of_influence]));

      // initial render
      this.drawBarChart(this.data.general);
      this.drawPieChart(this.data.scope);
    }, () => {
      console.error("Failed to load chart data");
    });
  },

  drawBarChart(data) {
    const container = document.getElementById("barChart");
    d3.select(container).selectAll("*").remove();
    // clear old
    d3.select("#barChart").selectAll("*").remove();
    // Sample data: each object has an "issue" (label) and a "count".

    // Define dimensions for the two rows (label and bar) plus a gap between groups.
    const labelRowHeight = 20; // Height for the label row
    const barRowHeight = 24; // Height for the bar row
    const groupGap = 10; // Space between each group

    // Total height per data group
    const groupHeight = labelRowHeight + barRowHeight + groupGap;
    const numGroups = data.length;
    const chartHeight = numGroups * groupHeight;

    // Define margins for the SVG container.
    const margin = { top: 16, right: 0, bottom: 16, left: 0 };

    // Select the container element and its current width (for responsiveness)
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
      .attr("transform", (d, i) => `translate(0, ${i * groupHeight})`)
      .style("cursor", d => d.key ? "pointer" : "default")
      .on("click", (event, d) => {
        if (d.key) {
          this.applyIssueFilter(d.key)
          // const issueSlug = encodeURIComponent(d.key);
          // window.location.href = `/search?selectedCategory=case&general_issues=${issueSlug}`;
        }
      });

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
      .text(d => `${d.count} Cases`);

  },

  drawPieChart(data) {
    d3.select("#pieChart").selectAll("*").remove();
    d3.select(".tooltipPicChart")?.remove();
    d3.select("#labelContainer").selectAll("*").remove();

    // Colors array (existing + new)
    const colors = [
      "#aaed93",
      "#9edcfa",
      "#d8c7ff",
      "#febbbe",
      "#e265a2",
      "#2897dc",
      "#f0db4f",
      "#ff7f50",
      "#98c6e9",
    ];

    data = this.assignColorsToData(data, colors);


      // dimensions
    const width = 500, height = 500,
    radius = Math.min(width, height) / 2,
    holeRadius = radius * 0.3,
    sliceSpacing = 2;

    // prepare wrapper and tooltip
    const wrapper = d3.select("#pieChartWrapper")
    .style("position", "relative");
    const tooltip = wrapper.append("div")
    .attr("class", "tooltipPicChart")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("visibility", "hidden");

    // compute total for percent
    const total = d3.sum(data, d => d.count);

    // pie layout & arc
    const pie = d3.pie().value(d => d.count).sort(null);
    const arc = d3.arc()
    .innerRadius(holeRadius)
    .outerRadius(d => radius - sliceSpacing)
    .padAngle(0.01);

    // svg container
    const svg = d3.select("#pieChart")
    .append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`);

    // slices
    const slices = svg.selectAll("path")
    .data(pie(data))
    .enter().append("path")
    .attr("d", arc)
    .attr("fill", d => d.data.color)
    .attr("stroke", "white")
    .attr("stroke-width", 2)
    .style("cursor", d => d.data.key ? "pointer" : "default")
    .on("click", (event, d) => {
      if (d.data.key) {
        this.applyScopeFilter(d.data.key);

        // const slug = encodeURIComponent(d.data.key);
        // window.location.href = `/search?selectedCategory=case&scope_of_influence=${slug}`;
      }
    })
    // tooltip handlers
    .on("mouseover", (event, d) => {
      const pct = ((d.data.count / total) * 100).toFixed(1);
      tooltip.html(`
        <strong>${d.data.scope_of_influence}</strong><br/>
        ${pct}% (${d.data.count})
      `).style("visibility", "visible");
    })
    .on("mousemove", (event) => {
      tooltip
        .style("top",  (event.layerY + 10) + "px")
        .style("left", (event.layerX + 10) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

    // Create the labels and color boxes vertically
    const labelContainer = d3.select("#labelContainer");

    data.forEach(item => {
      const labelBox = labelContainer.append("div").attr("class", "label-item");

      // Create a small color box for each label
      labelBox
        .append("div")
        .attr("class", "color-box")
        .style("background-color", item.color);

      // Add label text beside the color box
      labelBox
        .append("span")
        .text(item.scope_of_influence)
        .attr("class", "label-text");
    });
  },
  assignColorsToData(data, colors) {
    return data.map((item, index) => {
      // Assign color using modulo to loop through the colors array
      item.color = colors[index % colors.length]; // Loops through the colors array
      return item;
    });
  },

  // filter bars by scopeKey → redraw bar chart
  applyScopeFilter(scopeKey) {
    // 1) filter detail by chosen scope
    const filtered = this.data.combined.filter(d => d.key_scope === scopeKey);

    // 2) roll up counts per issueKey
    const m = d3.rollup(
      filtered,
      v => d3.sum(v, d => d.count),
      d => d.key_issue
    );

    // 3) build barData in the SAME ORDER as this.data.general
    const barData = this.data.general
    // keep only those with a non‐zero count in this scope
    .filter(item => m.has(item.key))
    // map to the shape drawBarChart expects
    .map(item => ({
      key:   item.key,
      issue: item.issue,
      count: m.get(item.key)
    }));

  // 4) redraw bars
  this.drawBarChart(barData);
  },

  // filter pie by issueKey → redraw pie chart
  applyIssueFilter(issueKey) {
    const filtered = this.data.combined.filter(d=> d.key_issue===issueKey);
    const m = d3.rollup(filtered, v=> d3.sum(v,d=>d.count), d=> d.key_scope);
    const pieData = Array.from(m, ([key,count]) => ({
      key,
      scope_of_influence: this.scopeMap.get(key) || key,
      count
    }));

    this.drawPieChart(pieData);
  }

};

export default barChart;
