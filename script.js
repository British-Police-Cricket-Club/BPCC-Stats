/* ============================================================
   CONFIG
============================================================ */
const DATA_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlS2BceCsyAkRFmAuwA0QDJR8wPjuLZyquKAeszxD2-FM7gFTzEQrVTqPxtph-z55FZNU01tMnpvQv/pub?output=csv";

const HEADERS = [
  "Player","Number","Years","Matches","Innings","Runs","Average","High Score",
  "Fifties","Hundreds","Overs","Wickets","Bowling Average","Economy","Best",
  "Catches","Stumpings","Current"
];

let allData = [];

/* ============================================================
   CSV LOADING
============================================================ */
async function loadCSV() {
  const res = await fetch(DATA_URL);
  const text = await res.text();
  const lines = text.trim().split("\n");
  const headers = lines[0].split(",").map(function(h){ return h.trim(); });

  return lines.slice(1).map(function(line){
    const cols = line.split(",");
    const obj = {};
    headers.forEach(function(h, i){
      obj[h] = (cols[i] || "").trim();
    });
    return obj;
  });
}

function num(v) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function victims(p) {
  return num(p["Catches"]) + num(p["Stumpings"]);
}

/* ============================================================
   HERO TITLES
============================================================ */
const heroTitle = document.getElementById("hero-title");
const summaryCards = document.getElementById("summary-cards");

const heroTitles = {
  "overview": "Every officer.<br><i>Every number.</i>",
  "players": "Player directory<br><i>& profiles</i>",
  "batting": "Career batting<br><i>records</i>",
  "bowling": "Career bowling<br><i>records</i>",
  "fielding": "Career fielding<br><i>records</i>",
  "milestones": "Landmarks<br><i>& approaching achievements</i>",
  "ai-teams": "AI-generated<br><i>XI selections</i>"
};

/* ============================================================
   ROLE DETECTION
============================================================ */
function getRole(p) {
  const runs = num(p["Runs"]);
  const wickets = num(p["Wickets"]);
  const stumpings = num(p["Stumpings"]);

  if (stumpings >= 1) return "Wicketkeeper";
  if (runs >= 100 && wickets >= 10) return "All-rounder";
  if (wickets >= 5) return "Bowler";
  if (runs >= 100) return "Batter";
  return "Player";
}

/* ============================================================
   PLAYERS PAGE
============================================================ */
function renderPlayers() {
  const container = document.getElementById("players-grid");
  container.innerHTML = "";
  const q = document.getElementById("player-search").value.toLowerCase();

  const sorted = allData.slice().sort(function(a, b){
    return a["Player"].localeCompare(b["Player"]);
  });

  sorted.forEach(function(p){
    if (p["Player"].toLowerCase().indexOf(q) === -1) return;

    const card = document.createElement("div");
    card.className = "player-card";

    const status = (p["Current"] === "Yes") ? "Current Player" : "Retired";
    const role = getRole(p);

    card.innerHTML =
      "<div class='status'>" + status + "</div>" +
      "<h3>" + p["Player"] + "</h3>" +
      "<span class='role-badge'>" + role + "</span>" +
      "<div class='stats-line'>" +
      p["Matches"] + " matches • " +
      p["Runs"] + " runs • " +
      p["Wickets"] + " wickets • " +
      victims(p) + " victims" +
      "</div>";

    card.addEventListener("click", function(){
      openPlayerModal(p);
    });

    container.appendChild(card);
  });
}

document.getElementById("player-search").addEventListener("input", renderPlayers);

/* ============================================================
   MODAL
============================================================ */
function openPlayerModal(p) {
  document.getElementById("modal-player-name").textContent = p["Player"];
  document.getElementById("modal-player-number").textContent = "Player No: " + p["Number"];
  document.getElementById("modal-player-role").textContent = getRole(p);

  const stats = document.getElementById("modal-stats");
  stats.innerHTML = "";

  HEADERS.forEach(function(h){
    const row = document.createElement("div");
    row.className = "modal-stat-row";
    row.innerHTML = "<h4>" + h + "</h4><p>" + (p[h] || "") + "</p>";
    stats.appendChild(row);
  });

  document.getElementById("player-modal").style.display = "flex";
}

document.getElementById("modal-close").addEventListener("click", function(){
  document.getElementById("player-modal").style.display = "none";
});

window.addEventListener("click", function(e){
  if (e.target.id === "player-modal") {
    document.getElementById("player-modal").style.display = "none";
  }
});

/* ============================================================
   NAVIGATION
============================================================ */
function setupNav() {
  const buttons = document.querySelectorAll(".nav-bar button");

  buttons.forEach(function(btn){
    btn.addEventListener("click", function(){
      const section = btn.getAttribute("data-section");

      document.querySelectorAll(".section").forEach(function(sec){
        sec.classList.remove("active");
      });
      document.getElementById(section).classList.add("active");

      buttons.forEach(function(b){
        b.classList.remove("on");
      });
      btn.classList.add("on");

      heroTitle.innerHTML = heroTitles[section];
      summaryCards.style.display = (section === "overview") ? "grid" : "none";

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

/* ============================================================
   OVERVIEW TOTALS
============================================================ */
function renderOverview() {
  document.getElementById("total-players").textContent = allData.length;
  document.getElementById("total-appearances").textContent =
    allData.reduce(function(s, p){ return s + num(p["Matches"]); }, 0);
  document.getElementById("total-runs").textContent =
    allData.reduce(function(s, p){ return s + num(p["Runs"]); }, 0);
  document.getElementById("total-wickets").textContent =
    allData.reduce(function(s, p){ return s + num(p["Wickets"]); }, 0);
}

/* ============================================================
   BATTING
============================================================ */
function renderBatting() {
  const container = document.getElementById("batting-table");
  const data = allData.slice().sort(function(a, b){
    return num(b["Runs"]) - num(a["Runs"]);
  });

  let html = "<table><thead><tr>" +
             "<th>Player</th><th>Runs</th><th>Average</th>" +
             "</tr></thead><tbody>";

  data.forEach(function(p){
    html += "<tr class='clickable-row' data-player='" + p["Player"] + "'>" +
            "<td>" +
            "<div class='player-name'>" + p["Player"] + "</div>" +
            "<div class='player-number'>No. " + p["Number"] + "</div>" +
            "</td>" +
            "<td>" + p["Runs"] + "</td>" +
            "<td>" + p["Average"] + "</td>" +
            "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;

  container.querySelectorAll(".clickable-row").forEach(function(row){
    row.addEventListener("click", function(){
      const player = allData.find(function(p){
        return p["Player"] === row.dataset.player;
      });
      openPlayerModal(player);
    });
  });
}

/* ============================================================
   BOWLING
============================================================ */
function renderBowling() {
  const container = document.getElementById("bowling-table");
  const data = allData.slice().sort(function(a, b){
    return num(b["Wickets"]) - num(a["Wickets"]);
  });

  let html = "<table><thead><tr>" +
             "<th>Player</th><th>Wickets</th><th>Average</th>" +
             "</tr></thead><tbody>";

  data.forEach(function(p){
    html += "<tr class='clickable-row' data-player='" + p["Player"] + "'>" +
            "<td>" +
            "<div class='player-name'>" + p["Player"] + "</div>" +
            "<div class='player-number'>No. " + p["Number"] + "</div>" +
            "</td>" +
            "<td>" + p["Wickets"] + "</td>" +
            "<td>" + p["Bowling Average"] + "</td>" +
            "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;

  container.querySelectorAll(".clickable-row").forEach(function(row){
    row.addEventListener("click", function(){
      const player = allData.find(function(p){
        return p["Player"] === row.dataset.player;
      });
      openPlayerModal(player);
    });
  });
}

/* ============================================================
   FIELDING
============================================================ */
function renderFielding() {
  const container = document.getElementById("fielding-table");
  const data = allData.slice().sort(function(a, b){
    return victims(b) - victims(a);
  });

  let html = "<table><thead><tr>" +
             "<th>Player</th><th>Victims</th><th>Catches</th>" +
             "</tr></thead><tbody>";

  data.forEach(function(p){
    html += "<tr class='clickable-row' data-player='" + p["Player"] + "'>" +
            "<td>" +
            "<div class='player-name'>" + p["Player"] + "</div>" +
            "<div class='player-number'>No. " + p["Number"] + "</div>" +
            "</td>" +
            "<td>" + victims(p) + "</td>" +
            "<td>" + p["Catches"] + "</td>" +
            "</tr>";
  });

  html += "</tbody></table>";
  container.innerHTML = html;

  container.querySelectorAll(".clickable-row").forEach(function(row){
    row.addEventListener("click", function(){
      const player = allData.find(function(p){
        return p["Player"] === row.dataset.player;
      });
      openPlayerModal(player);
    });
  });
}
/* ============================================================
   MILESTONES
============================================================ */
function renderMilestones() {
  renderMilestoneClubs(
    "Runs milestone clubs",
    "Runs",
    [250,500,1000,1500,2000,2500,3000,3500],
    20,
    document.getElementById("batting-milestones")
  );

  renderMilestoneClubs(
    "Bowling milestone clubs",
    "Wickets",
    [20,30,40,50,60,70,80,90,100],
    2,
    document.getElementById("bowling-milestones")
  );

  renderMilestoneClubs(
    "Catches milestone clubs",
    "Catches",
    [10,20,30,40,50],
    2,
    document.getElementById("catches-milestones")
  );
}

function renderMilestoneClubs(title, field, milestones, threshold, container) {
  let html = "<h3>" + title + "</h3>";

  const sorted = milestones.slice().sort(function(a, b){
    return a - b;
  });

  html += "<div class='milestone-grid'>";

  sorted.forEach(function(m){
    const achieved = allData.filter(function(p){
      const value = num(p[field]);
      if (value < m) return false;
      const maxM = sorted.filter(function(ms){ return value >= ms; }).pop();
      return maxM === m;
    });

    html += "<div class='milestone-club-box'><h4>" + m + " Club</h4>";

    if (achieved.length === 0) {
      html += "<p>No players yet.</p>";
    } else {
      achieved.sort(function(a, b){
        return num(b[field]) - num(a[field]);
      }).forEach(function(p){
        html += "<p>" + p["Player"] + " – " + num(p[field]) + "</p>";
      });
    }

    html += "</div>";
  });

  html += "</div>";

  html += "<h3>Current players approaching</h3>";

  let any = false;

  sorted.forEach(function(m){
    const approaching = allData.filter(function(p){
      if (p["Current"] !== "Yes") return false;
      const value = num(p[field]);
      const toGo = m - value;
      return toGo > 0 && toGo <= threshold;
    });

    if (approaching.length > 0) {
      any = true;

      html += "<div class='milestone-approach-box'><h4>Approaching " + m + "</h4>";

      approaching.sort(function(a, b){
        return (m - num(a[field])) - (m - num(b[field]));
      }).forEach(function(p){
        const value = num(p[field]);
        const toGo = m - value;

        html += "<div class='approach-row'>" +
                "<span>" + p["Player"] + " – " + value + "</span>" +
                "<span class='to-go'>" + toGo + " to go</span>" +
                "</div>";
      });

      html += "</div>";
    }
  });

  if (!any) {
    html += "<p>No current players within range.</p>";
  }

  container.innerHTML = html;
}

/* ============================================================
   AI TEAMS
============================================================ */
function renderAITeams() {
  const used = new Set();

  const batSorted = allData.slice().sort(function(a, b){
    return num(b["Runs"]) - num(a["Runs"]) ||
           num(b["Average"]) - num(a["Average"]) ||
           num(b["Matches"]) - num(a["Matches"]);
  });

  const bowlSorted = allData.slice().sort(function(a, b){
    return num(b["Wickets"]) - num(a["Wickets"]) ||
           num(a["Bowling Average"]) - num(b["Bowling Average"]) ||
           num(b["Matches"]) - num(a["Matches"]);
  });

  function keeperScore(p) {
    const v = victims(p);
    const m = num(p["Matches"]);
    const vp = (m > 0) ? (v / m) : 0;
    const s = num(p["Stumpings"]);
    return (v * 2) + (vp * 10) + (s * 5) + m;
  }

  const keepSorted = allData.slice().sort(function(a, b){
    return keeperScore(b) - keeperScore(a);
  });

  function pick(sorted, count, role) {
    const team = [];
    sorted.forEach(function(p){
      if (team.length >= count) return;
      if (!used.has(p["Player"])) {
        team.push({ player: p, role: role });
        used.add(p["Player"]);
      }
    });
    return team;
  }

  const teamA = []
    .concat(pick(batSorted, 5, "Batter"))
    .concat(pick(keepSorted, 1, "Wicketkeeper"))
    .concat(pick(bowlSorted, 5, "Bowler"));

  function buildTeam() {
    return []
      .concat(pick(batSorted, 5, "Batter"))
      .concat(pick(keepSorted, 1, "Wicketkeeper"))
      .concat(pick(bowlSorted, 5, "Bowler"));
  }

  renderTeam("team-a", "AI 1st XI", teamA);
  renderTeam("team-b", "AI 2nd XI", buildTeam());
  renderTeam("team-c", "AI 3rd XI", buildTeam());
}

function renderTeam(id, title, players) {
  const container = document.getElementById(id);

  let html = "<div class='ai-team-box'><h3>" + title + "</h3>";

  const batters = players.slice(0, 5);
  const keeper = players.slice(5, 6);
  const bowlers = players.slice(6, 11);

  /* Batters */
  html += "<div class='ai-team-section'><h4>Batters</h4>";
  batters.forEach(function(entry, i){
    const p = entry.player;
    html += "<div class='ai-player-row' data-player='" + p["Player"] + "'>" +
            "<div class='ai-player-left'>" +
            "<div class='ai-player-name'>" + (i + 1) + ". " + p["Player"] + "</div>" +
            "<div class='ai-player-role'>Batter</div>" +
            "</div>" +
            "<div class='ai-player-right'>" +
            p["Runs"] + " runs — Avg " + p["Average"] +
            "</div>" +
            "</div>";
  });
  html += "</div>";

  /* Keeper */
  html += "<div class='ai-team-section'><h4>Wicket Keeper</h4>";
  keeper.forEach(function(entry){
    const p = entry.player;
    const m = num(p["Matches"]);
    const victimsPM = (m > 0) ? (victims(p) / m).toFixed(2) : "0.00";

    html += "<div class='ai-player-row' data-player='" + p["Player"] + "'>" +
            "<div class='ai-player-left'>" +
            "<div class='ai-player-name'>6. " + p["Player"] + "</div>" +
            "<div class='ai-player-role'>Wicket Keeper</div>" +
            "</div>" +
            "<div class='ai-player-right'>" +
            victims(p) + " victims — " + victimsPM + " per match" +
            "</div>" +
            "</div>";
  });
  html += "</div>";

  /* Bowlers */
  html += "<div class='ai-team-section'><h4>Bowlers</h4>";
  bowlers.forEach(function(entry, i){
    const p = entry.player;
    html += "<div class='ai-player-row' data-player='" + p["Player"] + "'>" +
            "<div class='ai-player-left'>" +
            "<div class='ai-player-name'>" + (7 + i) + ". " + p["Player"] + "</div>" +
            "<div class='ai-player-role'>Bowler</div>" +
            "</div>" +
            "<div class='ai-player-right'>" +
            p["Wickets"] + " wickets — Avg " + p["Bowling Average"] +
            "</div>" +
            "</div>";
  });
  html += "</div>";

  html += "</div>";

  container.innerHTML = html;

  container.querySelectorAll(".ai-player-row").forEach(function(row){
    row.addEventListener("click", function(){
      const player = allData.find(function(p){
        return p["Player"] === row.dataset.player;
      });
      openPlayerModal(player);
    });
  });
}

/* ============================================================
   INIT
============================================================ */
async function init() {
  allData = await loadCSV();

  document.querySelectorAll(".section").forEach(function(sec){
    sec.classList.remove("active");
  });
  document.getElementById("overview").classList.add("active");

  heroTitle.innerHTML = heroTitles["overview"];
  summaryCards.style.display = "grid";

  setupNav();
  renderOverview();
  renderPlayers();
  renderBatting();
  renderBowling();
  renderFielding();
  renderMilestones();
  renderAITeams();
}

init();
