import * as d3 from "d3";
import { xhrReq } from "./utils/utils.js";

const searchChart = {
  data: null,
  issueMap: null,
  scopeMap: null,
  methodMap: null,
  selectedMethodKey: null,
  selectedScopeKey: null,
  selectedIssueKey: null,

  init() {
    this.fetchAllData();
    document.getElementById("resetFilters")
      .addEventListener("click", () => this.resetFilters());
  },

  fetchAllData() {
    const queryString = window.location.search;
    let url = `/entries/cases-charts` + queryString + `&resultType=chart&returns=json`;

    xhrReq("GET", url, {}, response => {
      const { generalIssues, scopeOfInfluence, methodTypes, combined } = JSON.parse(response.response);
      this.data = { general: generalIssues, scope: scopeOfInfluence, methods: methodTypes, combined };
      // build lookup maps
      this.issueMap = new Map(generalIssues.map(d => [d.key, d.issue]));
      this.scopeMap = new Map(scopeOfInfluence.map(d => [d.key, d.scope_of_influence]));
      this.methodMap = new Map(methodTypes.map(d => [d.key, d.method_type]));

      // Helper to check if container is visible and has width
      function isVisibleAndReady(selector) {
        const el = document.querySelector(selector);
        return el && el.offsetParent !== null && el.getBoundingClientRect().width > 0;
      }

      // Poll until both chart containers are visible and ready
      const pollInterval = setInterval(() => {
        if (
          isVisibleAndReady('.chart-container') &&
          isVisibleAndReady('#barChart') &&
          isVisibleAndReady('#pieChart') &&
          isVisibleAndReady('#methodChart')
        ) {
          clearInterval(pollInterval);
          this.resetFilters(); // Draw both charts
        }
      }, 100);

    }, () => {
      console.error("Failed to load chart data");
    });
  },

  drawBarChart(data, selectedKey = this.selectedIssueKey) {
    try {
      const container = document.getElementById("barChart");
      // d3.select(container).selectAll("*").remove();
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
      const containerWidth = container.clientWidth || 400;
  
      // Compute the total SVG height including margins.
      const svgHeight = chartHeight + margin.top + margin.bottom;
  
      // Create a responsive SVG using viewBox for scaling.
      const svg = d3
        .select("#barChart")
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
        .attr("class", d => "group" + (selectedKey && d.key === selectedKey ? " is-selected" : ""))
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
        // .attr("fill", "skyblue");
  
      // Overlay the count text inside each bar.
      // A small left offset (e.g., 5 pixels) is used so that the text is not flush against the edge.
      groups
        .append("text")
        .attr("class", "bar-count")
        .attr("x", 5) // Small offset from the left edge of the bar
        .attr("y", labelRowHeight + barRowHeight / 2)
        .attr("dy", "0.35em")
        // .attr("fill", "#fff")
        // Choose a contrasting fill color for better visibility over the bar (e.g., white).
        .text(d => `${d.count} Cases`);
      
    } catch (error) {
      console.error("************Error drawing bar chart:", error);
    }

  },

  drawPieChart(data, selectedKey = this.selectedScopeKey) {
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
    const width = 300, height = 300,
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
    .attr("fill", d => 
      selectedKey && d.data.key === selectedKey
        ? d3.color(d.data.color).darker(1.5) // make it darker if selected
        : d.data.color
    )
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

  /* ---------------------------
   * Method Type bar chart (bottom)
   * ------------------------- */

  drawMethodBarChart(data, selectedKey = this.selectedMethodKey) {
    try {
      const container = document.getElementById("methodChart");
      if (!container) return;

      // Clear old content
      d3.select("#methodChart").selectAll("*").remove();

      // Guard: no data
      if (!data || !data.length) {
        d3.select("#methodChart")
          .append("div")
          .style("padding", "12px")
          .style("text-align", "center")
          .text("No data");
        return;
      }

      // --- Layout ---
      const containerWidth = container.clientWidth || 480;
      const margin = { top: 16, right: 16, bottom: 150, left: 48 }; // room for axes
      const innerWidth = Math.max(240, containerWidth - margin.left - margin.right);
      const innerHeight = 300; // tweak as you like
      const svgHeight = innerHeight + margin.top + margin.bottom;

      // --- SVG root ---
      const svg = d3.select("#methodChart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", svgHeight)
        .attr("viewBox", `0 0 ${containerWidth} ${svgHeight}`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .attr("role", "img")
        .attr("aria-label", "Method types bar chart");

      const g = svg.append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // --- Scales ---
      const keys = data.map(d => d.key ?? ""); // keep order
      const maxCount = d3.max(data, d => +d.count) ?? 1;

      const x = d3.scaleBand()
        .domain(keys)
        .range([0, innerWidth])
        .padding(0.2);

      const y = d3.scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([innerHeight, 0]);

      // --- Axes + grid ---
      const yAxis = d3.axisLeft(y).ticks(5).tickSizeOuter(0);
      const xAxis = d3.axisBottom(x)
        .tickSizeOuter(0)
        .tickFormat((k) => {
          const item = data.find(d => (d.key ?? "") === k);
          return item ? item.method_type : k;
        });

      // gridlines
      g.append("g")
        .attr("class", "y-grid")
        .attr("transform", "translate(0,0)")
        .call(
          d3.axisLeft(y)
            .ticks(5)
            .tickSize(-innerWidth)
            .tickFormat(() => "")
        )
        .selectAll("line")
        .attr("opacity", 0.25);

      // **remove axis domain lines** (left vertical & top horizontal)
      g.append("g").attr("class", "y-axis").call(yAxis)
        .call(g => g.select(".domain").remove());   // <── removes the left line

      const xAxisG = g.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call(g => g.select(".domain").remove());   // <── removes the top line
        
      // If labels are long, rotate them
      const labelMax = d3.max(Array.from(xAxisG.selectAll("text")).map(t => (t).textContent?.length || 0)) || 0;
      if (labelMax > 12) {
        xAxisG.selectAll("text")
          .attr("text-anchor", "end")
          .attr("dx", "-0.5em")
          .attr("dy", "0.25em")
          .attr("transform", "rotate(-35)");
      }

      // --- Bars ---
      const t = svg.transition().duration(450);

      const groups = g.selectAll(".bar-group")
        .data(data, (d) => d.key ?? d.method_type)
        .join(enter => enter.append("g").attr("class", "bar-group"));

      groups
        .attr("transform", d => `translate(${x(d.key ?? "")},0)`)
        .style("cursor", d => d.key ? "pointer" : "default")
        .on("click", (evt, d) => { if (d.key) this.setMethodFilter(d.key); });

      // rects
      const bars = groups.selectAll("rect")
        .data(d => [d])
        .join("rect")
        .attr("class", d => {
          const isSel = selectedKey && d.key === selectedKey;
          return `bar${isSel ? " is-selected" : ""}${d.key ? "" : " is-disabled"}`;
        })
        .attr("x", 0)
        .attr("width", x.bandwidth())
        .attr("y", innerHeight) // animate from bottom
        .attr("height", 0)
        .attr("role", "img")
        .attr("aria-label", d => `${d.method_type}: ${d.count}`);

      bars.transition(t)
        .attr("y", d => y(+d.count))
        .attr("height", d => innerHeight - y(+d.count));

      // --- Value text INSIDE each bar, vertical ---
      const bottomPadding = 20;

      g.selectAll(".bar-count")
        .data(data)
        .join("text")
        .attr("class", "bar-count")
        .attr("x", d => (x(d.key ?? "") ?? 0) + x.bandwidth() / 2)
        .attr("y", d => innerHeight - bottomPadding)  // <-- place near bottom of chart area
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("transform", d => {
          const cx = (x(d.key ?? "") ?? 0) + x.bandwidth() / 2;
          const cy = innerHeight - bottomPadding;
          return `rotate(-90,${cx},${cy})`; // rotate around that lower point
        })
        .style("fill", "black")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .text(d => d.count);

      // labels.transition(t).attr("y", d => y(+d.count) - 6);
      const nf = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
      // --- Tooltips (simple title) ---
      bars.append("title")
        .text(d => `${d.method_type}\n${nf.format(d.count)} ${d.count === 1 ? "case" : "cases"}`);

    } catch (error) {
      console.error("Error drawing Method bar chart:", error);
    }
  },

  applyScopeFilter(scopeKey) {
    this.selectedScopeKey = scopeKey;
    this.selectedIssueKey = null;
    this.selectedMethodKey = null;

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
      .filter(item => m.has(item.key))
      .map(item => ({
        key: item.key,
        issue: item.issue,
        count: m.get(item.key)
      }));

    // 4) redraw bars
    this.drawBarChart(barData);

    // 5) filter and redraw method chart
    const methodRollup = d3.rollup(
      filtered,
      v => d3.sum(v, d => d.count),
      d => d.key_method_type
    );
    const methodData = this.data.methods
      .filter(item => methodRollup.has(item.key))
      .map(item => ({
        key: item.key,
        method_type: item.method_type,
        count: methodRollup.get(item.key)
      }));
    this.drawMethodBarChart(methodData);


    this.drawPieChart(this.data.scope);
  },


  applyIssueFilter(issueKey) {
    this.selectedIssueKey = issueKey;
    this.selectedScopeKey = null;
    this.selectedMethodKey = null;

    const filtered = this.data.combined.filter(d => d.key_issue === issueKey);
    const m = d3.rollup(filtered, v => d3.sum(v, d => d.count), d => d.key_scope);
    const scopeData = Array.from(m, ([key, count]) => ({
      key,
      scope_of_influence: this.scopeMap.get(key) || key,
      count
    }));

    this.drawPieChart(scopeData);

    // filter and redraw method chart
    const methodRollup = d3.rollup(
      filtered,
      v => d3.sum(v, d => d.count),
      d => d.key_method_type
    );
    const methodData = this.data.methods
      .filter(item => methodRollup.has(item.key))
      .map(item => ({
        key: item.key,
        method_type: item.method_type,
        count: methodRollup.get(item.key)
      }));
    this.drawMethodBarChart(methodData);


    this.drawBarChart(this.data.general);
  },

  setMethodFilter(methodKey) {
    this.selectedIssueKey = null;
    this.selectedScopeKey = null;
    this.selectedMethodKey = methodKey;

    // Filter combined data by selected method
    const filtered = this.data.combined.filter(d => d.key_method_type === methodKey);

    // --- Update Bar Chart (General Issues) ---
    const issueRollup = d3.rollup(
      filtered,
      v => d3.sum(v, d => d.count),
      d => d.key_issue
    );
    const barData = this.data.general
      .filter(item => issueRollup.has(item.key))
      .map(item => ({
        key: item.key,
        issue: item.issue,
        count: issueRollup.get(item.key)
      }));
    this.drawBarChart(barData);

    // --- Update Pie Chart (Scope of Influence) ---
    const scopeRollup = d3.rollup(
      filtered,
      v => d3.sum(v, d => d.count),
      d => d.key_scope
    );
    const pieData = Array.from(scopeRollup, ([key, count]) => ({
      key,
      scope_of_influence: this.scopeMap.get(key) || key,
      count
    }));
    this.drawPieChart(pieData);

    this.drawMethodBarChart(this.data.methods);
  },

  resetFilters() {
    this.selectedMethodKey = null;
    this.selectedScopeKey = null;
    this.selectedIssueKey = null;
    // simply redraw full data
    this.drawBarChart(this.data.general);
    this.drawPieChart(this.data.scope);
    this.drawMethodBarChart(this.data.methods);
  },




}

export default searchChart;
