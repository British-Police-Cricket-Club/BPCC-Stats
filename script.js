// ===============================
// BPCC-Stats Data Loader & Parser
// ===============================

// Your Google Sheets CSV
const DATA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlS2BceCsyAkRFmAuwA0QDJR8wPjuLZyquKAeszxD2-FM7gFTzEQrVTqPxtph-z55FZNU01tMnpvQv/pub?output=csv";

// Fetch CSV → Convert to array of objects
async function loadCSV() {
    const response = await fetch(DATA_URL);
    const text = await response.text();

    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map(h => h.trim());

    return lines.slice(1).map(line => {
        const cols = line.split(",");
        const obj = {};
        headers.forEach((h, i) => obj[h] = cols[i]?.trim());
        return obj;
    });
}

// Build HTML table from data
function buildTable(data, columns) {
    let html = "<table><thead><tr>";

    columns.forEach(col => {
        html += `<th>${col}</th>`;
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

// Insert tables into your index.html
async function renderStats() {
    const data = await loadCSV();

    // Adjust these column names to match your sheet EXACTLY
    const battingColumns = ["Player", "Matches", "Runs", "Average", "High Score"];
    const bowlingColumns = ["Player", "Overs", "Wickets", "Economy", "Best Figures"];

    // Build tables
    const battingHTML = buildTable(data, battingColumns);
    const bowlingHTML = buildTable(data, bowlingColumns);

    // Insert into your page
    document.getElementById("batting-table").innerHTML = battingHTML;
    document.getElementById("bowling-table").innerHTML = bowlingHTML;
}

// Run on page load
renderStats();
