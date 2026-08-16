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
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const cols = line.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h] = (cols[i] || "").trim());
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
   HERO TITLES + SUMMARY CONTROL
   ============================================================ */
const heroTitle = document.getElementById("hero-title");
const summaryCards = document.getElementById("summary-cards");

const heroTitles = {
  overview: "Every officer.<br><i>Every number.</i>",
  players: "Player directory<br><i>& profiles</i>",
  batting: "Career batting<br><i>records</i>",
  bowling: "Career bowling<br><i>records</i>",
  fielding: "Career fielding<br><i>records</i>",
  milestones: "Landmarks<br><i>& approaching achievements</i>",
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
  const sorted = [...allData].sort((a, b) => a["Player"].localeCompare(b["Player"]));

  sorted.forEach(p => {
    if (!p["Player"].toLowerCase().includes(q)) return;
    const card = document.createElement("div");
    card.className = "player-card";
    const status = p["Current"] === "Yes" ? "Current Player" : "Retired";
    const role = getRole(p);

    card.innerHTML = `
      <div class="status">${status}</div>
      <h3>${p["Player"]}</h3>
      <span class="role-badge">${role}</span>
      <div class="stats-line">
        ${p["Matches"]} matches • ${p["Runs"]} runs • ${p["Wickets"]} wickets • ${victims(p)} victims
      </div>
    `;
    card.addEventListener("click", () => openPlayerModal(p));
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

  HEADERS.forEach(h => {
    const row = document.createElement("div");
    row.className = "modal-stat-row";
    row.innerHTML = `<h4>${h}</h4><p>${p[h] || ""}</p>`;
    stats.appendChild(row);
  });

  document.getElementById("player-modal").style.display = "flex";
}

document.getElementById("modal-close").addEventListener("click", () => {
  document.getElementById("player-modal").style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target.id === "player-modal") {
    document.getElementById("player-modal").style.display = "none";
  }
});

/* ============================================================
   NAVIGATION
   ============================================================ */
function setupNav() {
  const buttons = document.querySelectorAll(".nav-bar button");

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-section");

      document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
      document.getElementById(section).classList.add("active");

      buttons.forEach(b => b.classList.remove("on"));
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
  document.getElementById("total-appearances").textContent = allData.reduce((s, p) => s + num(p["Matches"]), 0);
  document.getElementById("total-runs").textContent = allData.reduce((s, p) => s + num(p["Runs"]), 0);
  document.getElementById("total-wickets").textContent = allData.reduce((s, p) => s + num(p["Wickets"]), 0);
}
/* ============================================================
   MILESTONES
   ============================================================ */
function renderMilestones() {
  renderMilestoneClubs({
    title: "Runs milestone clubs",
    field: "Runs",
    milestones: [250, 500, 1000, 1500, 2000, 2500, 3000, 3500],
    threshold: 20,
    container: document.getElementById("batting-milestones")
  });

  renderMilestoneClubs({
    title: "Bowling milestone clubs",
    field: "Wickets",
    milestones: [20, 30, 40, 50, 60, 70, 80, 90, 100],
    threshold: 2,
    container: document.getElementById("bowling-milestones")
  });

  renderMilestoneClubs({
    title: "Catches milestone clubs",
    field: "Catches",
    milestones: [10, 20, 30, 40, 50],
    threshold: 2,
    container: document.getElementById("catches-milestones")
  });
}

function renderMilestoneClubs({ title, field, milestones, threshold, container }) {
  let html = `<h3>${title}</h3>`;

  const sortedMilestones = [...milestones].sort((a, b) => a - b);

  html += `<div class="milestone-grid">`;

  sortedMilestones.forEach(m => {
    const achieved = allData.filter(p => {
      const value = num(p[field]);
      if (value < m) return false;
      const maxMilestone = sortedMilestones.filter(ms => value >= ms).pop();
      return maxMilestone === m;
    });

    html += `<div class="milestone-club-box"><h4>${m} Club</h4>`;

    if (achieved.length === 0) {
      html += `<p>No players yet.</p>`;
    } else {
      achieved
        .sort((a, b) => num(b[field]) - num(a[field]))
        .forEach(p => {
          html += `<p>${p["Player"]} – ${num(p[field])}</p>`;
        });
    }

    html += `</div>`;
  });

  html += `</div>`;

  html += `<h3>Current players approaching</h3>`;

  let anyApproaching = false;

  sortedMilestones.forEach(m => {
    const approaching = allData.filter(p => {
      if (p["Current"] !== "Yes") return false;
      const value = num(p[field]);
      const toGo = m - value;
      return toGo > 0 && toGo <= threshold;
    });

    if (approaching.length > 0) {
      anyApproaching = true;

      html += `<div class="milestone-approach-box"><h4>Approaching ${m}</h4>`;

      approaching
        .sort((a, b) => (m - num(a[field])) - (m - num(b[field])))
        .forEach(p => {
          const value = num(p[field]);
          const toGo = m - value;

          html += `
            <div class="approach-row">
              <span>${p["Player"]} – ${value}</span>
              <span class="to-go">${toGo} to go</span>
            </div>
          `;
        });

      html += `</div>`;
    }
  });

  if (!anyApproaching) {
    html += `<p>No current players within range.</p>`;
  }

  container.innerHTML = html;
}

/* ============================================================
   AI TEAMS
   ============================================================ */
function renderAITeams() {
  const used = new Set();

  const batSorted = [...allData].sort(
    (a, b) =>
      num(b["Runs"]) - num(a["Runs"]) ||
      num(b["Average"]) - num(a["Average"]) ||
      num(b["Matches"]) - num(a["Matches"])
  );

  const bowlSorted = [...allData].sort(
    (a, b) =>
      num(b["Wickets"]) - num(a["Wickets"]) ||
      num(a["Bowling Average"]) - num(b["Bowling Average"]) ||
      num(b["Matches"]) - num(a["Matches"])
  );

  function keeperScore(p) {
    const v = victims(p);
    const m = num(p["Matches"]);
    const vp = m > 0 ? v / m : 0;
    const s = num(p["Stumpings"]);
    return (v * 2) + (vp * 10) + (s * 5) + m;
  }

  const keepSorted = [...allData].sort((a, b) => keeperScore(b) - keeperScore(a));

  function pick(sorted, count, role) {
    const team = [];
    for (const p of sorted) {
      if (team.length >= count) break;
      if (!used.has(p["Player"])) {
        team.push({ player: p, role });
        used.add(p["Player"]);
      }
    }
    return team;
  }

  const teamA = [
    ...pick(batSorted, 5, "Batter"),
    ...pick(keepSorted, 1, "Wicketkeeper"),
    ...pick(bowlSorted, 5, "Bowler")
  ];

  function build() {
    return [
      ...pick(batSorted, 5, "Batter"),
      ...pick(keepSorted, 1, "Wicketkeeper"),
      ...pick(bowlSorted, 5, "Bowler")
    ];
  }

  renderTeam("team-a", "AI 1st XI", teamA);
  renderTeam("team-b", "AI 2nd XI", build());
  renderTeam("team-c", "AI 3rd XI", build());
}

function renderTeam(id, title, players) {
  const container = document.getElementById(id);

  let html = `<div class="ai-team-box"><h3>${title}</h3>`;

  const batters = players.slice(0, 5);
  const keeper = players.slice(5, 6);
  const bowlers = players.slice(6, 11);

  html += `<div class="ai-team-section"><h4>Batters</h4>`;
  batters.forEach((entry, i) => {
    const p = entry.player;
    html += `
      <div class="ai-player-row" data-player="${p["Player"]}">
        <div class="ai-player-left">
          <div class="ai-player-name">${i + 1}. ${p["Player"]}</div>
          <div class="ai-player-role">Batter</div>
        </div>
        <div class="ai-player-right">
          ${p["Runs"]} runs<br>
          Avg ${p["Average"]}
        </div>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div class="ai-team-section"><h4>Wicket Keeper</h4>`;
  keeper.forEach(entry => {
    const p = entry.player;
    const victimsPM = num(p["Matches"]) > 0 ? (victims(p) / num(p["Matches"])).toFixed(2) : "0.00";
    html += `
      <div class="ai-player-row" data-player="${p["Player"]}">
        <div class="ai-player-left">
          <div class="ai-player-name">6. ${p["Player"]}</div>
          <div class="ai-player-role">Wicket Keeper</div>
        </div>
        <div class="ai-player-right">
          ${victims(p)} victims<br>
          ${victimsPM} per match
        </div>
      </div>
    `;
  });
  html += `</div>`;

  html += `<div class="ai-team-section"><h4>Bowlers</h4>`;
  bowlers.forEach((entry, i) => {
    const p = entry.player;
    html += `
      <div class="ai-player-row" data-player="${p["Player"]}">
        <div class="ai-player-left">
          <div class="ai-player-name">${7 + i}. ${p["Player"]}</div>
          <div class="ai-player-role">Bowler</div>
        </div>
        <div class="ai-player-right">
          ${p["Wickets"]} wickets<br>
          Avg ${p["Bowling Average"]}
        </div>
      </div>
    `;
  });
  html += `</div></div>`;

  container.innerHTML = html;

  container.querySelectorAll(".ai-player-row").forEach(row => {
    row.addEventListener("click", () => {
      const player = allData.find(p => p["Player"] === row.dataset.player);
      openPlayerModal(player);
    });
  });
}

/* ============================================================
   INIT
   ============================================================ */
async function init() {
  allData = await loadCSV();

  document.querySelectorAll(".section").forEach(sec => sec.classList.remove("active"));
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
