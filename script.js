// =====================================
// British Police Cricket Club Stats Engine
// =====================================

const DATA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlS2BceCsyAkRFmAuwA0QDJR8wPjuLZyquKAeszxD2-FM7gFTzEQrVTqPxtph-z55FZNU01tMnpvQv/pub?output=csv";

let allData = [];
let filteredData = [];

// ---------- Utility ----------

async function loadCSV() {
  const response = await fetch(DATA_URL);
  const text = await response.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => (obj[h] = cols[i]?.trim()));
    return obj;
  });
}

function buildTable(data, columns, tableIdPrefix) {
  let html = "<table><thead><tr>";

  columns.forEach((col) => {
    html += `<th data-col="${col}" data-table="${tableIdPrefix}">${col}</th>`;
  });

  html += "</tr></thead><tbody>";

  data.forEach((row) => {
    html += `<tr data-player="${row["Player"] || ""}">`;
    columns.forEach((col) => {
      html += `<td>${row[col] || ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

// ---------- Rendering main tables ----------

function renderTables(data) {
  const battingColumns = [
    "Player",
    "number",
    "years",
    "matches",
    "innings",
    "runs",
    "average",
    "highScore",
    "fifties",
    "hundreds"
  ];

  const bowlingColumns = [
    "Player",
    "overs",
    "wickets",
    "bowlingAverage",
    "economy",
    "best"
  ];

  const fieldingColumns = ["Player", "catches", "stumpings", "current"];

  const battingHTML = buildTable(data, battingColumns, "batting");
  const bowlingHTML = buildTable(data, bowlingColumns, "bowling");
  const fieldingHTML = buildTable(data, fieldingColumns, "fielding");

  document.getElementById("batting-table").innerHTML = battingHTML;
  document.getElementById("bowling-table").innerHTML = bowlingHTML;
  document.getElementById("fielding-table").innerHTML = fieldingHTML;

  attachSorting();
  attachRowClickProfiles();
}

// ---------- Sorting ----------

function attachSorting() {
  const headers = document.querySelectorAll("th[data-col]");
  headers.forEach((th) => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-col");

      let dataToSort = [...filteredData];

      dataToSort.sort((a, b) => {
        const av = a[col] || "";
        const bv = b[col] || "";

        const an = parseFloat(av);
        const bn = parseFloat(bv);

        if (!isNaN(an) && !isNaN(bn)) {
          return bn - an; // descending
        }
        return av.localeCompare(bv);
      });

      renderTables(dataToSort);
      renderTop10Tables(dataToSort);
      renderCharts(dataToSort);
    });
  });
}

// ---------- Filters ----------

function applyFilterCurrent() {
  filteredData = allData.filter(
    (row) =>
      (row["current"] || "").toLowerCase() === "yes" ||
      (row["current"] || "").toLowerCase() === "y"
  );
  renderTables(filteredData);
  renderTop10Tables(filteredData);
  renderCharts(filteredData);
}

function applyFilterAll() {
  filteredData = [...allData];
  renderTables(filteredData);
  renderTop10Tables(filteredData);
  renderCharts(filteredData);
}

// ---------- Search ----------

function applySearch(term) {
  term = term.toLowerCase();
  filteredData = allData.filter((row) =>
    (row["Player"] || "").toLowerCase().includes(term)
  );
  renderTables(filteredData);
  renderTop10Tables(filteredData);
  renderCharts(filteredData);
}

// ---------- Player profile modal ----------

function attachRowClickProfiles() {
  const rows = document.querySelectorAll("table tbody tr[data-player]");
  rows.forEach((row) => {
    row.addEventListener("click", () => {
      const playerName = row.getAttribute("data-player");
      const player = filteredData.find((p) => p["Player"] === playerName);
      if (!player) return;

      const body = document.getElementById("modal-body");
      body.innerHTML = `
        <h2>${player["Player"]}</h2>
        <p><strong>Number:</strong> ${player["number"] || ""}</p>
        <p><strong>Years:</strong> ${player["years"] || ""}</p>
        <p><strong>Matches:</strong> ${player["matches"] || ""}</p>
        <p><strong>Innings:</strong> ${player["innings"] || ""}</p>
        <p><strong>Runs:</strong> ${player["runs"] || ""}</p>
        <p><strong>Average:</strong> ${player["average"] || ""}</p>
        <p><strong>High Score:</strong> ${player["highScore"] || ""}</p>
        <p><strong>50s:</strong> ${player["fifties"] || ""}</p>
        <p><strong>100s:</strong> ${player["hundreds"] || ""}</p>
        <p><strong>Overs:</strong> ${player["overs"] || ""}</p>
        <p><strong>Wickets:</strong> ${player["wickets"] || ""}</p>
        <p><strong>Bowling Avg:</strong> ${player["bowlingAverage"] || ""}</p>
        <p><strong>Economy:</strong> ${player["economy"] || ""}</p>
        <p><strong>Best:</strong> ${player["best"] || ""}</p>
        <p><strong>Catches:</strong> ${player["catches"] || ""}</p>
        <p><strong>Stumpings:</strong> ${player["stumpings"] || ""}</p>
        <p><strong>Current:</strong> ${player["current"] || ""}</p>
      `;

      document.getElementById("player-modal").style.display = "block";
    });
  });

  document.getElementById("modal-close").onclick = () => {
    document.getElementById("player-modal").style.display = "none";
  };
}

// ---------- Top 10 tables ----------

function renderTop10Tables(data) {
  // Top 10 batters by runs
  const batters = [...data]
    .filter((p) => parseFloat(p["runs"] || "0") > 0)
    .sort((a, b) => parseFloat(b["runs"] || "0") - parseFloat(a["runs"] || "0"))
    .slice(0, 10);

  const topBattingColumns = [
    "Player",
    "matches",
    "innings",
    "runs",
    "average",
    "highScore",
    "fifties",
    "hundreds"
  ];

  const battersHTML = buildTable(batters, topBattingColumns, "top10batters");
  document.getElementById("top10-batters-table").innerHTML = battersHTML;

  // Top 10 bowlers by wickets
  const bowlers = [...data]
    .filter((p) => parseFloat(p["wickets"] || "0") > 0)
    .sort(
      (a, b) =>
        parseFloat(b["wickets"] || "0") - parseFloat(a["wickets"] || "0")
    )
    .slice(0, 10);

  const topBowlingColumns = [
    "Player",
    "overs",
    "wickets",
    "bowlingAverage",
    "economy",
    "best"
  ];

  const bowlersHTML = buildTable(bowlers, topBowlingColumns, "top10bowlers");
  document.getElementById("top10-bowlers-table").innerHTML = bowlersHTML;

  attachRowClickProfiles();
}

// ---------- Charts ----------

function renderCharts(data) {
  const runsCanvas = document.getElementById("runs-chart");
  const wicketsCanvas = document.getElementById("wickets-chart");
  if (!runsCanvas || !wicketsCanvas) return;

  const runsCtx = runsCanvas.getContext("2d");
  const wicketsCtx = wicketsCanvas.getContext("2d");

  const labels = data.map((p) => p["Player"]);
  const runs = data.map((p) => parseFloat(p["runs"] || "0"));
  const wickets = data.map((p) => parseFloat(p["wickets"] || "0"));

  runsCtx.clearRect(0, 0, runsCanvas.width, runsCanvas.height);
  wicketsCtx.clearRect(0, 0, wicketsCanvas.width, wicketsCanvas.height);

  function drawBarChart(ctx, values, labels, color) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const max = Math.max(...values, 1);
    const barWidth = width / (values.length || 1);

    ctx.fillStyle = color;
    ctx.font = "10px Arial";
    ctx.textAlign = "center";

    values.forEach((v, i) => {
      const barHeight = (v / max) * (height - 20);
      const x = i * barWidth + barWidth / 4;
      const y = height - barHeight;

      ctx.fillRect(x, y, barWidth / 2, barHeight);
      ctx.fillText(labels[i], x + barWidth / 4, height - 2);
    });
  }

  drawBarChart(runsCtx, runs, labels, "#2b7cff");
  drawBarChart(wicketsCtx, wickets, labels, "#ff7c2b");
}

// ---------- Page switching ----------

function showPage(pageId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach((p) => p.classList.remove("active"));

  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add("active");
}

// ---------- Init ----------

async function init() {
  allData = await loadCSV();
  filteredData = [...allData];

  renderTables(filteredData);
  renderTop10Tables(filteredData);
  renderCharts(filteredData);

  const filterCurrentBtn = document.getElementById("filter-current");
  const filterAllBtn = document.getElementById("filter-all");
  const searchInput = document.getElementById("search-input");

  if (filterCurrentBtn) {
    filterCurrentBtn.addEventListener("click", applyFilterCurrent);
  }
  if (filterAllBtn) {
    filterAllBtn.addEventListener("click", applyFilterAll);
  }
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value;
      if (term.trim() === "") {
        applyFilterAll();
      } else {
        applySearch(term);
      }
    });
  }

  // Default page
  showPage("stats");
}

init();
