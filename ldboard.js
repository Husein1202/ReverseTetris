window.coolNicknames = [
  "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
  "BudeTetris", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
  "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
  "SkuyMain", "KambingNgeLag", "CobaMain", "UjangGaming", "KlikAjaDulu"
];


async function fetchLeaderboard(mode = "40 LINES", limit = 100) {
const { data, error } = await supabase
  .from("leaderboard_v2")
  .select("*")
  .eq("mode", mode)
  .order(mode === "FRENZY" ? "score" : "time_ms", { ascending: mode !== "FRENZY" })
  .limit(30); // limit optional

  if (error) {
    console.error("Supabase fetch error:", error);
    return [];
  }
  return data;
}

function formatTimeMS(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const msec = String(ms % 1000).padStart(3, "0");
  return `${min}:${sec.toString().padStart(2, "0")}.${msec}`;
}

function injectTopRanks(entries, mode) {
  const bestOfContainer = document.querySelector(`.leaderboard-content[data-mode="${mode}"] .best-of`);
  bestOfContainer.innerHTML = ""; // Bersihkan isi lama

  const isFrenzy = mode === "FRENZY";
  const isMeditetris = mode === "MEDITETRIS";

  entries.slice(0, 3).forEach((entry, i) => {
    const div = document.createElement("div");
    div.className = "top-bar";
    div.innerHTML = `
      <div class="header-line">
        <div class="left-info">
          <span class="rank-label">#${i + 1}</span>
          <div class="name-block">
            <div class="nickname">${entry.nickname}</div>
            <div class="timestamp">${new Date(entry.timestamp).toLocaleString()}</div>
          </div>
        </div>
        <img class="rank-img" src="trophy-${i + 1}.png" />
      </div>
      <div class="time">${isFrenzy? entry.score.toLocaleString("id-ID"): formatTimeMS(entry.time_ms || 0)}</div>
      <div class="stats">
        ${
          isFrenzy
            ? `
              <div><span class="label">LEVEL</span><span class="value">${entry.level}</span></div>
              <div><span class="label">PIECES</span><span class="value">${entry.pieces.toLocaleString("id-ID")}</span></div>
              <div><span class="label">SPP</span><span class="value">${(entry.pieces > 0 ? (entry.score / entry.pieces).toFixed(2) : "0.00")}</span></div>
              <div><span class="label">PPS</span><span class="value">${entry.pps.toFixed(2)}</span></div>
              <div><span class="label">HOLDS</span><span class="value">${(entry.holds ?? 0).toLocaleString("id-ID")}</span></div>
            `
            : `
              <div><span class="label">PIECES</span><span class="value">${entry.pieces.toLocaleString("id-ID")}</span></div>
              <div><span class="label">PPS</span><span class="value">${entry.pps.toFixed(2)}</span></div>
              <div><span class="label">KPP</span><span class="value">${entry.kpp.toFixed(2)}</span></div>
              <div><span class="label">KPS</span><span class="value">${entry.kps.toFixed(2)}</span></div>
            `
        }
      </div>
          `;
    bestOfContainer.appendChild(div);
  });
}

function injectLowerRanks(entries, mode) {
  const container = document.querySelector(`.leaderboard-content[data-mode="${mode}"] .lower-ranks`);
  container.innerHTML = "";

  const isFrenzy = mode === "FRENZY";

  entries.slice(3).forEach((entry, index) => {
    const row = document.createElement("div");
    row.className = "leaderboard-row";

    const rank = index + 4;
    const timeOrScore = isFrenzy
      ? entry.score.toLocaleString("id-ID")
      : formatTimeMS(entry.time_ms || 0);
    const timestamp = new Date(entry.timestamp).toLocaleString();

const statsHTML = isFrenzy
  ? `
    <div><span class="label">LEVEL</span><span class="value">${entry.level}</span></div>
    <div><span class="label">PIECES</span><span class="value">${entry.pieces.toLocaleString("id-ID")}</span></div>
    <div><span class="label">SPP</span><span class="value">${(entry.pieces > 0 ? (entry.score / entry.pieces).toFixed(2) : "0.00")}</span></div>
    <div><span class="label">PPS</span><span class="value">${entry.pps.toFixed(2)}</span></div>
    <div><span class="label">HOLDS</span><span class="value">${(entry.holds ?? 0).toLocaleString("id-ID")}</span></div>
  `
  : `
    <div><span class="label">PIECES</span><span class="value">${entry.pieces.toLocaleString("id-ID")}</span></div>
    <div><span class="label">PPS</span><span class="value">${entry.pps.toFixed(2)}</span></div>
    <div><span class="label">KPP</span><span class="value">${entry.kpp.toFixed(2)}</span></div>
    <div><span class="label">KPS</span><span class="value">${entry.kps.toFixed(2)}</span></div>
  `;

    row.innerHTML = `
      <div class="rank">#${rank}</div>
      <div class="player-infos">
        <div class="PLname">${entry.nickname}</div>
        <div class="timestamp">${timestamp}</div>
      </div>
      <div class="score-info">
        <div class="time">${timeOrScore}</div>
        <div class="stats">${statsHTML}</div>
      </div>
    `;

    container.appendChild(row);
  });
}


async function loadLeaderboard(mode) {
  const data = await fetchLeaderboard(mode);
  if (!data || data.length === 0) return;
  injectTopRanks(data, mode);
  injectLowerRanks(data, mode);
}

document.addEventListener("DOMContentLoaded", () => {
const nickname = localStorage.getItem('nickname') || "Player";
const tag = document.getElementById('nicknameTag');
if (tag) tag.textContent = nickname;

const isAnonymous = window.coolNicknames.includes(nickname);
const anonLabel = document.querySelector(".anon-label");
if (anonLabel) {
  anonLabel.style.display = isAnonymous ? "block" : "none";
}

  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const mode = tab.textContent.trim();
      document.querySelectorAll('.leaderboard-content').forEach(content => {
        content.style.display = content.getAttribute('data-mode') === mode ? '' : 'none';
      });

      loadLeaderboard(mode); // 🚀 Load sesuai mode tab
    });
  });
if (localStorage.getItem("leaderboard_updated") === "true") {
  localStorage.removeItem("leaderboard_updated");
}
  loadLeaderboard("40 LINES"); // default mode saat load
});
