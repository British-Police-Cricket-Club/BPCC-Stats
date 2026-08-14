// BPCC Fugitives-style clone using one CSV

const DATA_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlS2BceCsyAkRFmAuwA0QDJR8wPjuLZyquKAeszxD2-FM7gFTzEQrVTqPxtph-z55FZNU01tMnpvQv/pub?output=csv";

let allData = [];

// Headers (must match CSV exactly)
const HEADERS = [
  "Player",
  "Number",
  "Years",
  "Matches",
  "Innings",
  "Runs",
  "Average",
  "High Score",
  "Fifties",
  "Hundreds",
  "Overs",
  "Wickets",
  "Bowling Average",
  "Economy",
  "Best",
  "Catches",
  "Stumpings",
  "Current"
];

async function loadCSV() {
  const res = await fetch(DATA_URL);
  const text = await res.text();

  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(h => h.trim());

  return lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (cols[i] || "").trim();
    });
    return obj;
  });
}

function buildTable(data, columns) {
  let html = "<table><thead><tr>";
  columns.forEach(col => {
    html += `<th data-col="${col}">${col}</th>`;
  });
  html += "</tr></thead><tbody>";

  data.forEach(row => {
    html += "<tr>";
    columns.forEach(col => {
      html += `<td>${row[col] || ""}</td>`;
    });
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}

function renderAll() {
  // Batting
  const battingCols = [
    "Player",
    "Number",
    "Years",
    "Matches",
    "Innings",
    "Runs",
    "Average",
    "High Score",
    "Fifties",
    "Hundreds"
  ];

  // Bowling
  const bowlingCols = [
    "Player",
    "Overs",
    "Wickets",
    "Bowling Average",
    "Economy",
    "Best"
  ];

  // Fielding
  const fieldingCols = [
    "Player",
    "Catches",
    "Stumpings",
    "Current"
  ];

  document.getElementById("batting-table").innerHTML =
    buildTable(allData, battingCols);
  document.getElementById("bowling-table").innerHTML =
    buildTable(allData, bowlingCols);
  document.getElementById("fielding-table").innerHTML =
    buildTable(allData, fieldingCols);

  attachSorting();
}

function attachSorting() {
  const headers = document.querySelectorAll("th[data-col]");
  headers.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-col");
      const numeric = [
        "Matches",
        "Innings",
        "Runs",
        "Average",
        "High Score",
        "Fifties",
        "Hundreds",
        "Overs",
        "Wickets",
        "Bowling Average",
        "Economy",
        "Catches",
        "Stumpings"
      ].includes(col);

      const sorted = [...allData].sort((a, b) => {
        const av = a[col] || "";
        const bv = b[col] || "";
        if (numeric) {
          const an = parseFloat(av) || 0;
          const bn = parseFloat(bv) || 0;
          return bn - an; // descending
        }
        return av.localeCompare(bv);
      });

      allData = sorted;
      renderAll();
    });
  });
}

async function init() {
  allData = await loadCSV();
  renderAll();
}

init();
