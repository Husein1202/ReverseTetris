let canvas, context;
let dropTrails = [];
let trailPieces = [];
let activeTrails = [];
let dropCounter = 0;
let totalPiecesDropped = 0;
let highestCombo = 0;
let nextPiece = null;
let hasCompleted40Lines = false;
let startTime = Date.now();
let gameStartTime = 0;
let elapsedTime = 0;
let lockPending = false;
let lockTimeout = null;
let lockResetCount = 0;
const LOCK_DELAY_MS = 500; // Durasi delay sebelum piece dikunci (dalam milidetik)
const MAX_LOCK_RESETS = 15;
let landedY = null; // tambahkan global di awal
let isSoftDropping = false;
let dasTimer = null;
let arrTimer = null;
let currentMoveDir = 0; // -1 kiri, 1 kanan
let movePressed = {
  left: false,
  right: false,
};
let moveHoldDir = 0;
let moveDelay = 0;
let initialMovePending = false;
let moveFrameCounter = 0;
let softDropTimer = 0;
let tapLeft = false;
let tapRight = false;

let escHoldTimeout = null;
let escStartTime = null;
let escAnimationFrame = null;
let usedWallkick = false;
let lockedAfterRotate = false;
let isEscapeHolding = false;
let escHoldStartTime = null;
let hasTriggeredQuit = false;
let escKeyIsDown = false;
let gravity = 0.015; // default super lambat
let gravityCounter = 0;




const HOLD_DURATION= 2000;

const quitOverlay = document.getElementById('holdToQuitOverlay');
const progressQuitBar = document.getElementById('progressQuitBar');

function updateProgressBar() {
  if (!isEscapeHolding || hasTriggeredQuit || !escHoldStartTime) return;

  const elapsed = Date.now() - escHoldStartTime;
  const progress = Math.min(elapsed / HOLD_DURATION, 1);


  if (progressQuitBar) {
    progressQuitBar.style.width = `${progress * 100}%`;
  }

  const holdText = document.getElementById('holdText');
  if (holdText) {
    if (progress >= 0.8) {
      holdText.textContent = "OKAY UP TO YOU";
    } else if (progress >= 0.4) {
      holdText.textContent = "YOU SURE ?";
    } else {
      holdText.textContent = "KEEP HOLD THAT BUTTON TO QUIT";
    }
  }

  if (quitOverlay) {
    quitOverlay.style.height = "auto";
  }

if (Date.now() - escHoldStartTime < HOLD_DURATION) {
  escAnimationFrame = requestAnimationFrame(updateProgressBar);
} else if (!hasTriggeredQuit) {
  hasTriggeredQuit = true;
  window.location.href = "select-mode.html";
}
}

// Saat tombol ESCAPE ditekan pertama kali
document.addEventListener("keydown", function(e) {
  if (e.key === "Escape" && !escKeyIsDown && !hasTriggeredQuit) {
    escKeyIsDown = true;
    isEscapeHolding = true;

    if (!escHoldStartTime) {
      escHoldStartTime = Date.now();
      escAnimationFrame = requestAnimationFrame(updateProgressBar);
    }

    if (quitOverlay) {
      quitOverlay.style.display = 'flex';
      quitOverlay.style.animation = 'none';
      void quitOverlay.offsetHeight;
      quitOverlay.style.animation = 'slideUp 0.3s ease-out';
    }
  }
});

document.addEventListener("keyup", function(e) {
  if (e.key === "Escape") {
    escKeyIsDown = false;
    isEscapeHolding = false;

    const elapsed = escHoldStartTime ? Date.now() - escHoldStartTime : 0;
    escHoldStartTime = null;
    hasTriggeredQuit = false;

    cancelAnimationFrame(escAnimationFrame);
    escAnimationFrame = null;

    const holdText = document.getElementById('holdText');
    if (holdText) {
      holdText.textContent = "NICE, THANK YOU FOR KEEP PLAYING";
    }

    if (quitOverlay && elapsed < HOLD_DURATION) {
      quitOverlay.style.height = '30px';
      quitOverlay.style.animation = 'none';
      void quitOverlay.offsetHeight;
      quitOverlay.style.animation = 'slideDown 1s ease-in';

      quitOverlay.addEventListener('animationend', function handleAnimEnd() {
        if (!isEscapeHolding) {
          quitOverlay.style.display = 'none';
          if (progressQuitBar) progressQuitBar.style.width = "0%";
        }
        quitOverlay.removeEventListener('animationend', handleAnimEnd);
      });
    }
  }
});

const dasFrames = localStorage.getItem("das") !== null ? Math.round(parseFloat(localStorage.getItem("das"))) : 10;
const arrFrames = localStorage.getItem("arr") !== null ? Math.round(parseFloat(localStorage.getItem("arr"))) : 2;

const defaultControls = {
  left: "ArrowLeft|a",
  right: "ArrowRight|d",
  softdrop: "ArrowUp|w",
  harddrop: " ",    
  cw: "s|ArrowDown",
  ccw: "z",
  rotate180: "c",
  hold: "Shift|h",
  exit: "Escape"
};


let activeControlSlot = parseInt(localStorage.getItem("activeControlSlot")) || 1;
let activeKeyBindings = {};

function applyActiveControlBindings() {
  const saved = JSON.parse(localStorage.getItem(`customControlsSlot${activeControlSlot}`)) || defaultControls;

  activeKeyBindings = {};

  for (const [action, keyString] of Object.entries(saved)) {
    if (!keyString) continue;
    keyString.split("|").forEach(k => {
      if (k.trim() !== "") {
        activeKeyBindings[k.toLowerCase()] = action;
      }
    });
  }
}

function saveCustomControls() {
  for (let slot = 1; slot <= 2; slot++) {
    const updated = {};
    document.querySelectorAll(`.custom-key[data-slot="${slot}"]`).forEach(div => {
      const action = div.dataset.action;
      const key = div.textContent;
      if (key && key !== "[NOT SET]" && key !== "[PRESS KEY]") {
        updated[action] = key;
      }
    });
    localStorage.setItem(`customControlsSlot${slot}`, JSON.stringify(updated));
  }

  alert("Custom controls saved! ✅");
  applyActiveControlBindings(); // Re-apply if slot aktif sedang diubah
}

function switchControlSlot(slot) {
  activeControlSlot = slot;
  localStorage.setItem("activeControlSlot", slot);
  applyActiveControlBindings();
}

const wallkickOffsets = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 }
];

const wallkick180Offsets = [
  { x: 0, y: 0 },
  { x: -1, y: 0 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: 0, y: 1 },
  { x: -2, y: 0 },
  { x: 2, y: 0 }
];

// Untuk piece non-I
const wallkickDataNormal = {
  '0>1': [ {x:0, y:0}, {x:-1, y:0}, {x:-1, y:1}, {x:0, y:-2}, {x:-1, y:-2} ],
  '1>0': [ {x:0, y:0}, {x:1, y:0}, {x:1, y:-1}, {x:0, y:2}, {x:1, y:2} ],

  '1>2': [ {x:0, y:0}, {x:1, y:0}, {x:1, y:-1}, {x:0, y:2}, {x:1, y:2} ],
  '2>1': [ {x:0, y:0}, {x:-1, y:0}, {x:-1, y:1}, {x:0, y:-2}, {x:-1, y:-2} ],

  '2>3': [ {x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:0, y:-2}, {x:1, y:-2} ],
  '3>2': [ {x:0, y:0}, {x:-1, y:0}, {x:-1, y:-1}, {x:0, y:2}, {x:-1, y:2} ],

  '3>0': [ {x:0, y:0}, {x:-1, y:0}, {x:-1, y:-1}, {x:0, y:2}, {x:-1, y:2} ],
  '0>3': [ {x:0, y:0}, {x:1, y:0}, {x:1, y:1}, {x:0, y:-2}, {x:1, y:-2} ],
};


// Untuk piece I
const wallkickDataI = {
  '0>1': [ {x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: 1}, {x: 1, y: -2} ],
  '1>0': [ {x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: -1}, {x: -1, y: 2} ],

  '1>2': [ {x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: -2}, {x: 2, y: 1} ],
  '2>1': [ {x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: 2}, {x: -2, y: -1} ],

  '2>3': [ {x: 0, y: 0}, {x: 2, y: 0}, {x: -1, y: 0}, {x: 2, y: -1}, {x: -1, y: 2} ],
  '3>2': [ {x: 0, y: 0}, {x: -2, y: 0}, {x: 1, y: 0}, {x: -2, y: 1}, {x: 1, y: -2} ],

  '3>0': [ {x: 0, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 1, y: 2}, {x: -2, y: -1} ],
  '0>3': [ {x: 0, y: 0}, {x: -1, y: 0}, {x: 2, y: 0}, {x: -1, y: -2}, {x: 2, y: 1} ],

  // ✅ Tambahkan untuk 180° (secara teknis 0>2 dan 1>3, dst)
  '0>2': [ {x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 2, y: 0} ],
  '2>0': [ {x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 2, y: 0} ],
  '1>3': [ {x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 2, y: 0} ],
  '3>1': [ {x: 0, y: 0}, {x: -1, y: 0}, {x: 1, y: 0}, {x: -2, y: 0}, {x: 2, y: 0} ],
};

function getWallkickData(type, from, to) {
  const key = `${from}>${to}`;
  if (type === 'I') {
    return wallkickDataI[key] || [ {x:0, y:0} ];
  }
  return wallkickDataNormal[key] || [ {x:0, y:0} ];
}


window.coolNicknames = [
  "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
  "BudeTetris", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
  "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
  "SkuyMain", "KambingNgeLag", "CobaMain", "UjangGaming", "KlikAjaDulu"
];

window.onload = () => {
  applyActiveControlBindings();
  loadControlsFromSlot(1);
  loadControlsFromSlot(2);


  const mode = localStorage.getItem('selectedGameMode');
const solo = localStorage.getItem('selectedSoloMode');
if (mode === 'solo' && !solo) {
  window.location.href = 'solo.html';
}

  const joinButton = document.getElementById('joinButton');
  const startScreen = document.getElementById('startScreen');
  const nicknameInput = document.getElementById('nicknameInput');
  const storedNickname = localStorage.getItem('nickname') || 'Player';

  if (joinButton && nicknameInput && startScreen) {
    const coolNicknames = [
      "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
      "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
      "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
      "SkuyMain", "KambingNgeLag", "HoloFury", "UjangGaming", "KlikAjaDulu"    
    ];
    joinButton.onclick = () => {
      let name = nicknameInput.value.trim();
      if (!name) {
        name = coolNicknames[Math.floor(Math.random() * coolNicknames.length)];
      }
      localStorage.setItem('nickname', name);
      startScreen.style.display = "none";
      const modeScreen = document.getElementById('modeScreen');
      if (modeScreen) modeScreen.style.display = "flex";
      const mainTheme = document.getElementById('mainTheme');
      if (mainTheme) {
        mainTheme.volume = 0.5;
        mainTheme.play();
      }
    };
  }
  const countdownText = document.getElementById('countdownText');
  const gameOverOverlay = document.getElementById('gameOverOverlay');
  const restartButton = document.getElementById('restartButton');
  const comboDisplay = document.getElementById('comboDisplay');
  let comboDisplayTimeout = null;
  const comboTitle = document.getElementById("comboTitle");

  function showComboTitle(linesCleared) {
  const names = ["Single", "Double", "Triple", "Quadruple", "Quintuple", "U nailed it!"];
  const label = names[Math.min(linesCleared - 1, names.length - 1)];
  comboTitle.textContent = label;
  comboTitle.style.opacity = 1;

  setTimeout(() => {
    comboTitle.style.opacity = 0;
  }, 1200);
}


  let nickname = "Player";
  let countdownValue = 3;

  canvas = document.getElementById('tetris');
  const hud = document.querySelector('.hud');

  context = canvas.getContext('2d');
  context.scale(20, 20);

  const nextCanvas = document.getElementById('nextCanvas');
  const nextContext = nextCanvas.getContext('2d');
  nextContext.scale(20, 20);

  const scoreElement = document.getElementById('score');
  const linesElement = document.getElementById('lines');
  const pauseButton = document.getElementById('pauseButton');
  const congratsText = document.getElementById('congratsText');

  const phrases = ["Mantap!", "Wow!", "Hebat!!", "Keren!", "GG!", "🔥", "Nice!"];

  const sounds = {
    rotate: document.getElementById('rotate'),
    move: document.getElementById('move'),
    harddrop: document.getElementById('harddrop'),
    lineclear: document.getElementById('lineclear'),
    hold: document.getElementById('hold'),
    softdrop: document.getElementById('softdrop'),
    gameover: document.getElementById('gameover'),
    gameOverAlt: new Audio('sound/game_over.mp3'),
    levelup: document.getElementById('levelup'),
    countdown3: document.getElementById('countdown3'),
    countdown2: document.getElementById('countdown2'),
    countdown1: document.getElementById('countdown1'),
    bgMusic: document.getElementById('bgMusic'),
    mainTheme: document.getElementById('mainTheme'),
  };

  for (let i = 1; i <= 16; i++) {
    sounds[`combo${i}`] = document.getElementById(`combo${i}`);
  }
  sounds.comboBreak = document.getElementById('comboBreak');

  let comboCount = 0;
  const arena = createMatrix(12, 30);
  const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    score: 0,
    level: 1,
    lines: 0,
    next: null,
    flip180: false
  };

  let lastTime = 0;
  let isGameOver = false;
  let isPaused = false;
  let rotatedLast = false;
  let timerStarted = false;
  let dropStartY = null;
  let lastHardDropTrail = null;
  let totalPiecesDropped = 0;
  let totalKeysPressed = 0;
  let highestCombo = 0;
  let holdCount = 0;


  const blockImage = new Image();
  blockImage.src = 'tetromino_tilesheet.png';
  const TILE_SIZE = 32;

let elapsedTime = 0; // mulai dari nol
let lastFrameTime = null;
const timerElement = document.getElementById("timer");

function formatTimeShort(ms) {
  ms = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatTime(ms) {
  ms = Math.max(0, Math.round(ms));
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

function loadControlsFromSlot(slot) {
  const saved = JSON.parse(localStorage.getItem(`customControlsSlot${slot}`)) || defaultControls;

  document.querySelectorAll(`.custom-key[data-slot="${slot}"]`).forEach(el => {
    const action = el.dataset.action;
    el.textContent = saved[action] || "[NOT SET]";
  });
}

function getDisplayKeys(slot, action) {
  const saved = JSON.parse(localStorage.getItem(`customControlsSlot${slot}`)) || defaultControls;
  return saved[action] || "[NOT SET]";
}



function updateTimer(deltaTime) {
  if (isPaused || isGameOver || !timerStarted) return;

  elapsedTime += deltaTime;

if (timerElement) {
  const fullTime = formatTime(elapsedTime);
  const [main, ms] = fullTime.split(".");
  timerElement.innerHTML = `${main}.<span class="ms">${ms}</span>`;
}
}

  function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
  }

  function drawGrid(ctx, width, height) {
    ctx.strokeStyle = '#1c236b';
    ctx.lineWidth = 0.05;
    for (let x = 0; x < width; x++) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y++) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }
  }

function createPiece(type) {
  const pieces = {
    'T': [[0, 3, 0], [3, 3, 3], [0, 0, 0]],
    'O': [[4, 4], [4, 4]],
    'L': [[0, 0, 5], [5, 5, 5], [0, 0, 0]],
    'J': [[6, 0, 0], [6, 6, 6], [0, 0, 0]],
    'I': [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    'S': [[0, 2, 2], [2, 2, 0], [0, 0, 0]],
    'Z': [[7, 7, 0], [0, 7, 7], [0, 0, 0]]
  };

  return {
    matrix: pieces[type],
    type: type
  };
}
  
  function randomType() {
    const types = 'TJLOSZI';
    return types[Math.floor(Math.random() * types.length)];
  }
  
  let bag = [];

function getNextPiece() {
  if (bag.length === 0) {
    bag = ['T', 'J', 'L', 'O', 'S', 'Z', 'I'];
    bag = bag.sort(() => Math.random() - 0.5);
  }
  return createPiece(bag.pop());
}

function drawMatrix(matrix, offset, ctx, ghost = false) {
  const glowColors = {
    1: 'rgba(255, 0, 102, 0.7)',    // T - merah muda
    2: 'rgba(255, 204, 0, 0.7)',    // O - kuning
    3: 'rgba(255, 128, 0, 0.7)',    // L - oranye
    4: 'rgba(0, 0, 255, 0.7)',      // J - biru tua
    5: 'rgba(0, 204, 255, 0.7)',    // I - biru muda
    6: 'rgba(102, 255, 0, 0.7)',    // S - hijau
    7: 'rgba(255, 0, 255, 0.7)'     // Z - pink terang
  };

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const drawX = x + offset.x;
        const drawY = y + offset.y;

        if (ghost) {
          ctx.save();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';     // isi transparan
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';     // outline putih terang
          ctx.lineWidth = 0.05;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';     // glow putih
          ctx.shadowBlur = 6;

          ctx.fillRect(drawX, drawY, 1, 1);
          ctx.strokeRect(drawX, drawY, 1, 1);
          ctx.restore();
        } else {
          ctx.save();

          // ✅ Tambahkan ini untuk flip visual 180 derajat
          if (matrix === player.matrix && player.flip180 && !ghost) {
            const centerX = offset.x + matrix[0].length / 2;
            const centerY = offset.y + matrix.length / 2;

            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI); // rotasi 180 derajat
            ctx.translate(-centerX, -centerY);
          }

          ctx.shadowColor = glowColors[value] || 'transparent';
          ctx.shadowBlur = 10;
          ctx.drawImage(
            blockImage,
            (value - 1) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
            drawX, drawY, 1, 1
          );
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }
    });
  });
}

// Fungsi untuk menampilkan teks spin di bawah holdCanvas
function showSpinMessage(text) {
  const spinMsg = document.getElementById('spinMessage');
  if (!spinMsg) return;

  spinMsg.textContent = text;
  spinMsg.classList.add('show');

  setTimeout(() => {
    spinMsg.classList.remove('show');
  }, 2500); // durasi tampil 1 detik
}


let flashLines = [];

function triggerFlash(rowY) {
  flashLines.push({ y: rowY, alpha: 1 });
}

function drawFlashLines(ctx) {
  flashLines.forEach(flash => {
    ctx.save();
    ctx.globalAlpha = flash.alpha;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, flash.y, canvas.width / 20, 1);  // 1 unit tinggi
    ctx.restore();

    flash.alpha -= 0.05;
  });
  flashLines = flashLines.filter(f => f.alpha > 0);
}


let debrisParticles = [];

function spawnDebris(y) {
  for (let i = 0; i < 20; i++) {
    debrisParticles.push({
      x: Math.random() * canvas.width / 20,
      y: y,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 1 + 0.5,
      alpha: 1
    });
  }
}

function updateDebris(deltaTime) {
  debrisParticles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy * (deltaTime / 16);
    p.alpha -= 0.01;
  });
  debrisParticles = debrisParticles.filter(p => p.alpha > 0);
}

function drawDebris(ctx) {
  ctx.save();
  debrisParticles.forEach(p => {
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = `rgba(${200 + Math.random()*55},${200 + Math.random()*55},255,${p.alpha})`;
    ctx.fillRect(p.x, p.y, 0.2, 0.2);
  });
  ctx.restore();
}


  
  function getGhostPosition() {
    const ghost = { x: player.pos.x, y: player.pos.y };
    while (!collide(arena, { matrix: player.matrix, pos: { x: ghost.x, y: ghost.y - 1 } })) {
      ghost.y--;
    }
    return ghost;
  }

  function draw() {
  drawHold();
  const pausedOverlay = document.getElementById('pausedOverlay');
  if (isPaused) {
    pausedOverlay.style.display = 'flex';
    return;
  } else {
    pausedOverlay.style.display = 'none';
  }

    context.fillStyle = '#121757';       // warna canvas
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid(context, canvas.width / 20, canvas.height / 20);
    drawTrails();
    drawMatrix(arena, { x: 0, y: 0 }, context);
    drawMatrix(player.matrix, getGhostPosition(), context, true);
    drawMatrix(player.matrix, player.pos, context);
    drawFlashLines(context);
    drawDebris(context);

    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (player.next) {
      const nextMatrix = player.next.matrix;
      const offsetX = Math.floor((nextCanvas.width / 20 - nextMatrix[0].length) / 2);
      const offsetY = Math.floor((nextCanvas.height / 20 - nextMatrix.length) / 2);
      drawMatrix(nextMatrix, { x: offsetX, y: offsetY }, nextContext);
    }
    
      // Hapus trail yang sudah hilang
      dropTrails = dropTrails.filter(trail =>
        trail.some(block => block.alpha > 0)
      );
    
    drawMatrix(player.matrix, player.pos, context);
  }

  function drawHarddropTrail(matrix, finalPos, ctx) {
    const layers = 3;
    for (let i = 1; i <= layers; i++) {
      const alpha = 0.15 / i;
      ctx.globalAlpha = alpha;
  
      matrix.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const drawX = x + finalPos.x;
            const drawY = y + finalPos.y + i;
            if (drawY < arena.length) {
              ctx.drawImage(
                blockImage,
                (value - 1) * TILE_SIZE, 0, TILE_SIZE, TILE_SIZE,
                drawX, drawY, 1, 1
              );
            }
          }
        });
      });
    }
    ctx.globalAlpha = 1.0;
  }
    

  function playerHardDrop() {
    // Simpan posisi Y sebelum naik (karena Reverse Tetris)
    let dropStartY = player.pos.y;
  
    // Naik ke atas sampai mentok
    while (!collide(arena, player)) player.pos.y--;
    player.pos.y++;
  
    // Simpan efek trail saat hard drop
    activeTrails.push({
      matrix: JSON.parse(JSON.stringify(player.matrix)),
      x: player.pos.x,
      fromY: dropStartY,
      toY: player.pos.y,
      createdAt: performance.now(),
      duration: 600 // durasi dalam ms
    });
        const arenaContainer = document.querySelector(".tetris-wrapper");
if (arenaContainer) {
  arenaContainer.classList.add("arena-popup");
  setTimeout(() => {
    arenaContainer.classList.remove("arena-popup");
  }, 200);
}
  
    merge(arena, player);
    hold.hasHeld = false;
    arenaSweep();
    playerReset();
    
  
    sounds.harddrop.currentTime = 0;
    sounds.harddrop.play();
  }
  
            
  let landedY = null; // tambahkan global di awal

  function playerDrop() {
    // Jangan drop kalau sudah mulai lock delay
    if (lockPending) return;
  
    player.pos.y--;
    if (collide(arena, player)) {
      player.pos.y++;
      
      if (!lockPending) {
        lockPending = true;
        landedY = player.pos.y; // simpan posisi saat landed
        startLockDelay();
      }
    } else {
      dropCounter = 0;
    }
  }
  
function playerMove(dir) {
  player.pos.x += dir;

  const wrapper = document.querySelector(".tetris-wrapper");
  let hitWall = false;

  if (collide(arena, player)) {
    player.pos.x -= dir;
    hitWall = true;

    if (wrapper) {
      wrapper.classList.remove("arena-left", "arena-right", "arena-center");
      wrapper.classList.add(dir === -1 ? "arena-left" : "arena-right");
    }

  } else {
    if (lockPending && lockResetCount < MAX_LOCK_RESETS) {
      lockResetCount++;
      startLockDelay();
    }

    if (sounds.move) {
      const moveSound = sounds.move.cloneNode();
      moveSound.volume = sounds.move.volume;
      moveSound.play();
    }

    if (wrapper && !hitWall) {
      wrapper.classList.remove("arena-left", "arena-right");
      wrapper.classList.add("arena-center");
    }
  }
}
      
  function handleInitialMove(dir) {
    currentMoveDir = dir;
    playerMove(dir); // geser langsung pertama
    clearMoveTimers();
  
    arrTimer = setInterval(() => {
      if ((currentMoveDir === -1 && movePressed.left) ||
          (currentMoveDir === 1 && movePressed.right)) {
        playerMove(currentMoveDir);
      }
    }, Math.max(1, ARR)); // ✅ agar ARR 0 tetap berfungsi
  }
  
  function clearMoveTimers() {
    clearTimeout(dasTimer);
    clearInterval(arrTimer);
    dasTimer = null;
    arrTimer = null;
  }
  
  function playerRotate() {
  if (tryRotate(1)) {
    rotatedLast = true;
    if (lockPending && lockResetCount < MAX_LOCK_RESETS) {
      lockResetCount++;
      startLockDelay();
    }
  }
}

  function rotateMatrix(matrix, direction = 1) {
    const newMatrix = matrix.map(row => [...row]);
    for (let y = 0; y < newMatrix.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [newMatrix[x][y], newMatrix[y][x]] = [newMatrix[y][x], newMatrix[x][y]];
      }
    }
    if (direction > 0) {
      newMatrix.forEach(row => row.reverse());
    } else {
      newMatrix.reverse();
    }
    return newMatrix;
  }
  
  function rotateMatrix180(matrix) {
    const rotated = matrix.map(row => [...row]).reverse();
    rotated.forEach(row => row.reverse());
    return rotated;
  }

  function isValidPlacement(matrix, pos, arena) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (matrix[y][x] !== 0) {
        const ay = y + pos.y;
        const ax = x + pos.x;

        // ❌ Posisi terlalu kiri/kanan/bawah → ditolak`
        if (
          ax < 0 || ax >= arena[0].length ||
          ay < 0 || ay >= arena.length
        )
        {
          console.log(`❌ OOB @ [${x},${y}] → arena[${ay},${ax}]`);
          return false;
        }

        // ❌ Tabrakan dengan blok lain → ditolak
        if (ay >= 0 && arena[ay][ax] !== 0) {
          console.log(`❌ Collision @ [${x},${y}] → arena[${ay},${ax}] = ${arena[ay][ax]}`);
          return false;
        }
      }
    }
  }
  return true;
}

  
function tryRotate(direction) {
  if (!player.type || typeof player.rotation !== "number") return false;

  const originalMatrix = player.matrix;
  const rotatedMatrix = rotateMatrix(player.matrix, direction);
  const from = player.rotation ?? 0;
  const to = (player.rotation + direction + 4) % 4;
  const kicks = getWallkickData(player.type, from, to);

  for (let i = 0; i < kicks.length; i++) {
    const offset = kicks[i];
    const testPos = {
      x: player.pos.x + offset.x,
      y: player.pos.y + offset.y,
    };

    if (isValidPlacement(rotatedMatrix, testPos, arena)) {
      player.matrix = rotatedMatrix.map(row => [...row]);
      player.pos = { ...testPos };
      player.rotation = to;
      rotatedLast = true;
      usedWallkick = i > 0; // ✅ hanya true jika bukan offset pertama
      return true;
    }
  }
  return false;
}

function tryRotate180() {
  const originalMatrix = player.matrix;
  const rotatedMatrix = rotateMatrix(player.matrix, 2);
  const from = player.rotation ?? 0;
  const to = (player.rotation + 2) % 4;
  const kicks = getWallkickData(player.type, from, to);

  for (let i = 0; i < kicks.length; i++) {
    const offset = kicks[i];
    const testPos = {
      x: player.pos.x + offset.x,
      y: player.pos.y + offset.y,
    };

    if (isValidPlacement(rotatedMatrix, testPos, arena)) {
      player.matrix = rotatedMatrix.map(row => [...row]);
      player.pos = { ...testPos };
      player.rotation = to;
      rotatedLast = true;
      usedWallkick = i > 0; // ✅ dipastikan i sudah didefinisikan
      return true;
    }
  }
  return false;
}

window.detectSpinType = function(player, arena, linesCleared) {
  if (!lockedAfterRotate) return null;

  const type = player.type;
  const x = player.pos.x + 1;
  const y = player.pos.y + 1;

  const corners = [
    arena[y - 1]?.[x - 1],
    arena[y - 1]?.[x + 1],
    arena[y + 1]?.[x - 1],
    arena[y + 1]?.[x + 1],
  ];
  const occupied = corners.filter(cell => cell && cell !== 0).length;

  const isMini = occupied < 3;
  const spinLabel = `${type}-SPIN`;

  if (["T", "L", "J", "S", "Z", "I"].includes(type)) {
    if (occupied >= 3) {
      if (linesCleared > 0) {
        const suffix = ["SINGLE", "DOUBLE", "TRIPLE"][linesCleared - 1] || `${linesCleared} LINES`;
        return `${spinLabel} ${suffix}`;
      } else {
        return `${spinLabel} NO CLEAR`;
      }
    } else if (linesCleared > 0 && isMini) {
      return linesCleared === 1 ? `${spinLabel} MINI` :
             linesCleared === 2 ? `${spinLabel} MINI DOUBLE` : null;
    } else if (linesCleared === 0 && isMini) {
      return `${spinLabel} MINI NO LINES`;
    }
  }
  return null;
};

// CW rotation
function playerRotateCCW() {
  if (tryRotate(-1)) {
    rotatedLast = true;

    if (sounds.rotate) {
      const sfx = sounds.rotate.cloneNode();
      sfx.volume = sounds.rotate.volume;
      sfx.play();
    }

    if (lockPending && lockResetCount < MAX_LOCK_RESETS) {
      lockResetCount++;
      startLockDelay();
    }
  }
}

function playerRotateCW() {
  if (tryRotate(1)) {
    rotatedLast = true;

    if (sounds.rotate) {
      const sfx = sounds.rotate.cloneNode();
      sfx.volume = sounds.rotate.volume;
      sfx.play();
    }

    if (lockPending && lockResetCount < MAX_LOCK_RESETS) {
      lockResetCount++;
      startLockDelay();
    }
  }
}

function playerRotate180() {
  rotatedLast = true;

  if (sounds.rotate) {
    const sfx = sounds.rotate.cloneNode();
    sfx.volume = sounds.rotate.volume;
    sfx.play();
  }

  if (lockPending && lockResetCount < MAX_LOCK_RESETS) {
    lockResetCount++;
    startLockDelay();
  }

  // ✅ Tambahkan flag flip visual
  player.flip180 = !player.flip180;
}

function startLockDelay() {
    if (lockTimeout) clearTimeout(lockTimeout);
  
    lockTimeout = setTimeout(() => {
      // Cek apakah MASIH MENYENTUH dasar
      player.pos.y--;
      const stillTouching = collide(arena, player);
      player.pos.y++; // restore posisi
    
      if (!stillTouching) {
        lockPending = false;
        return;
      }
    
      merge(arena, player);
      hold.hasHeld = false;
      arenaSweep();
      playerReset();
      lockPending = false;
      lockResetCount = 0;
      landedY = null;
    }, LOCK_DELAY_MS);
      }
      

  function merge(arena, player) {

    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        const ay = y + player.pos.y;
        const ax = x + player.pos.x;
        if (value !== 0 && ay >= 0 && ay < arena.length && ax >= 0 && ax < arena[0].length) {
          arena[ay][ax] = value;
        }
      });
    });
  }

  function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < m[y].length; ++x) {
        if (m[y][x] !== 0) {
          const ay = y + o.y;
          const ax = x + o.x;
          if (ay < 0 || ay >= arena.length || ax < 0 || ax >= arena[0].length || arena[ay][ax] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

function playerReset() {
  const pieces = 'TJLOSZI';

  if (!player.next) {
    player.next = getNextPiece();
  }
  const next = player.next;
  player.next = getNextPiece();

  player.matrix = next.matrix;
  player.type = next.type;

  player.pos.y = arena.length - player.matrix.length;
  player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  player.rotation = 0;

if (collide(arena, player)) {
  isGameOver = true;
  timerStarted = false;

  const bgm = window.getCurrentBGM?.();
  if (bgm) bgm.pause();

  if (sounds.gameover) {
    sounds.gameover.currentTime = 0;  
    sounds.gameover.play();
  }

  document.getElementById("completionOverlay").style.display = "flex";

  // ⬇️ Tambahkan blok statistik yang sama di sini
  const totalElapsed = Date.now() - gameStartTime;
  const totalSeconds = totalElapsed / 1000;

  document.getElementById("statScore").textContent = player.score;
  document.getElementById("statPieces").textContent = totalPiecesDropped;
  document.getElementById("statPPS").textContent = (totalPiecesDropped / totalSeconds).toFixed(2);
  document.getElementById("statKeys").textContent = totalKeysPressed;
  document.getElementById("statKPP").textContent = totalPiecesDropped > 0
    ? (totalKeysPressed / totalPiecesDropped).toFixed(2)
    : "0.00";
  document.getElementById("statCombo").textContent = "x" + highestCombo;
  document.getElementById("statLines").textContent = player.lines;
  document.getElementById("statHolds").textContent = holdCount;
  document.getElementById("statLPM").textContent = (player.lines / (totalSeconds / 60)).toFixed(0);

  return;
}
  totalPiecesDropped++;
  player.flip180 = false

}

function resetStats() {
  totalPiecesDropped = 0;
  totalKeysPressed = 0;
  highestCombo = 0;
  holdCount = 0;
  elapsedTime = 0;
}


function startRestartSequence() {
  isGameOver = false;
  isPaused = false;
  isRestarting = false;
  rotatedLast = false;
  timerStarted = false;
  lockPending = false;
  lockResetCount = 0;
  comboCount = 0;
  totalPiecesDropped = 0;
  totalKeysPressed = 0;
  highestCombo = 0;
  holdCount = 0;
  hold.matrix = null;
  hold.hasHeld = false;
  elapsedTime = 0;
  FrenzyTimeRemaining = 2 * 60 * 1000;
  gameStartTime = Date.now();

  resetStats();

  // Reset arena
  for (let y = 0; y < arena.length; ++y) {
    arena[y].fill(0);
  }

  // Reset player
  hold.matrix = null;
  hold.hasHeld = false;
  player.next = null;
  player.matrix = null;
  player.score = 0;
  player.level = 1;
  player.lines = 0;

  document.getElementById("completionOverlay").style.display = "none";

  // ⏱️ Countdown ke game baru
  startCountdown();
  clearHoldCanvas();

}

function clearHoldCanvas() {
  const holdCanvas = document.getElementById('holdCanvas');
  if (holdCanvas) {
    const ctx = holdCanvas.getContext('2d');
    ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
  }
}


document.getElementById("Retrybutt")?.addEventListener("click", () => {
  startRestartSequence();
});

function arenaSweep() {
  let linesCleared = 0;
  const clearedRows = [];
  for (let y = 0; y < arena.length; ++y) {
    if (arena[y].every(cell => cell !== 0)) {
      clearedRows.push(y);
      arena.splice(y, 1);
      arena.push(new Array(arena[0].length).fill(0));
      player.score += 10 * player.level;
      linesCleared++;
      y--;
    }
  }

  if (clearedRows.length > 0) {
    clearedRows.forEach(rowY => {
      triggerFlash(rowY);
      spawnDebris(rowY);
    });
  }

  if (linesCleared > 0) {
    triggerFlash();

    // ✅ Tambahkan ini SEBELUM detectSpinType
    lockedAfterRotate = rotatedLast && usedWallkick;

    const spinType = window.detectSpinType(player, arena, linesCleared);

    // ✅ Reset setelah pakai
    rotatedLast = false;
    usedWallkick = false;
    lockedAfterRotate = false;

    if (spinType) {
      showSpinMessage(spinType);
      comboTitle.textContent = spinType;
      comboTitle.style.opacity = 1;
      setTimeout(() => comboTitle.style.opacity = 0, 1000);
    }

    comboCount += linesCleared;
    if (comboCount > highestCombo) highestCombo = comboCount;
    showComboTitle(linesCleared);
    const soundId = `combo${Math.min(comboCount, 16)}`;
    if (sounds[soundId]) {
      sounds[soundId].currentTime = 0;
      sounds[soundId].play();
    }

    comboDisplay.textContent = `Combo x${comboCount}!`;
    comboDisplay.style.opacity = 1;
    clearTimeout(comboDisplayTimeout);
    comboDisplayTimeout = setTimeout(() => {
      comboDisplay.style.opacity = 0;
    }, 1000);

    sounds.lineclear.currentTime = 0;
    sounds.lineclear.play();
    player.lines += linesCleared;

    if (player.lines >= 40) {
      hasCompleted40Lines = true;
      setTimeout(() => {
        isGameOver = true;
        timerStarted = false;

        const bgm = window.getCurrentBGM?.();
        if (bgm) bgm.pause();

        if (sounds.gameover) {
          sounds.gameover.currentTime = 0;
          sounds.gameover.play();
        }
        document.getElementById("completionOverlay").style.display = "flex";
        elapsedTime = Date.now() - gameStartTime;
        const fullTime = formatTime(elapsedTime);
        const [main, ms] = fullTime.split('.');
        document.getElementById("statTime").innerHTML = `${main}.<span class="ms">${ms}</span>`;
        document.getElementById("statScore").textContent = player.score;
        document.getElementById("statPieces").textContent = totalPiecesDropped;
        document.getElementById("statCombo").textContent = "x" + highestCombo;
        document.getElementById("statHolds").textContent = holdCount;
        document.getElementById("statLines").textContent = player.lines;

        const totalSeconds = elapsedTime / 1000;
        const pps = totalPiecesDropped / totalSeconds;
        document.getElementById("statPPS").textContent = pps.toFixed(2);

        document.getElementById("statKeys").textContent = totalKeysPressed;
        document.getElementById("statKPP").textContent = (totalKeysPressed / totalPiecesDropped).toFixed(2);

        const lpm = (player.lines / (totalSeconds / 60)).toFixed(0);
        document.getElementById("statLPM").textContent = lpm;
      const nickname = localStorage.getItem("nickname") || "Player";
        const result = {
          nickname,
          mode: "40 LINES",
          time: formatTime(elapsedTime),
          time_ms: Math.round(elapsedTime),
          pieces: totalPiecesDropped,
          pps: totalPiecesDropped / (elapsedTime / 1000),
          kpp: totalPiecesDropped > 0 ? (totalKeysPressed / totalPiecesDropped) : 0,
          kps: (elapsedTime > 0) ? (totalKeysPressed / (elapsedTime / 1000)) : 0
        };

        if (typeof uploadScore === "function") {
          uploadScore(result);
        }


        const backBtn = document.getElementById("completionbackMode");
        if (backBtn) {
          backBtn.onclick = () => {
            window.location.href = "select-mode.html";
          };
        }
      }, 1000);
    }
  } else {
    if (comboCount > 0) {
      comboCount = 0;
      sounds.comboBreak.currentTime = 0;
      sounds.comboBreak.play();
      comboDisplay.style.opacity = 0;
    }
  }

  if (comboCount > highestCombo) {
    highestCombo = comboCount;
  }
}
  
  function updateScore() {
    const scoreElement = document.getElementById('score');
    const linesElement = document.getElementById('lines');
    if (scoreElement) {
      scoreElement.innerHTML = `<span style="color: #FFD700; font-weight: bold; font-size: 1.2em;">${player.score}</span>`;
    }
    const linesToNextLevel = 40;
    const currentProgress = player.lines % linesToNextLevel;
    if (linesElement) {
      linesElement.innerHTML = `<span style="color: #FFF; font-weight: bold; font-size: 1em;">${currentProgress}/${linesToNextLevel}</span>`;
    }
  }
  
  function update(time = 0) {
    if (isPaused || isGameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
  
// 🔵 Gravity G + Softdrop
let sdfMultiplier = parseFloat(localStorage.getItem("sdf")) || 6;
sdfMultiplier = Math.min(Math.max(sdfMultiplier, 1), 50);

const effectiveGravity = isSoftDropping ? gravity * sdfMultiplier : gravity;
gravityCounter += effectiveGravity;

while (gravityCounter >= 1 && !lockPending) {
  playerDrop();
  gravityCounter--;

  if (isSoftDropping && sounds.softdrop) {
    const sfx = sounds.softdrop.cloneNode();
    sfx.volume = sounds.softdrop.volume;
    sfx.play();
  }
}

    // 🔵 Frame-locked DAS & ARR
    if (moveHoldDir !== 0) {
      // Abaikan ARR kalau baru tap (supaya nggak double move)
      const allowRepeat =
        !((moveHoldDir === -1 && tapLeft) || (moveHoldDir === 1 && tapRight));

      if (allowRepeat) {
        if (initialMovePending) {
          moveFrameCounter--;
          if (moveFrameCounter <= 0) {
            playerMove(moveHoldDir);
            moveFrameCounter = arrFrames;
            initialMovePending = false;
          }
        } else {
          moveFrameCounter--;
          if (moveFrameCounter <= 0) {
            playerMove(moveHoldDir);
            moveFrameCounter = arrFrames;
          }
        }
      }
      if (initialMovePending) {
        moveFrameCounter--;
        if (moveFrameCounter <= 0) {
          playerMove(moveHoldDir);
          moveFrameCounter = arrFrames;
          initialMovePending = false;
        }
      } else {
        moveFrameCounter--;
        if (moveFrameCounter <= 0) {
          playerMove(moveHoldDir);
          moveFrameCounter = arrFrames;
        }
      }
    }
      
    updateTimer(deltaTime);
    updateDebris(deltaTime);
    draw(deltaTime);
    updateScore();
  
    requestAnimationFrame(update);
  }
      
  const pressedKeys = new Set();

window.addEventListener("keydown", (e) => {
  if (!pendingBind) return;

  const slot = pendingBind.dataset.slot;
  const action = pendingBind.dataset.action;
  const key = e.key.toLowerCase();

  let saved = JSON.parse(localStorage.getItem(`customControlsSlot${slot}`)) || { ...defaultControls };

  const existing = saved[action] ? saved[action].split("|") : [];
  if (!existing.includes(key)) {
    existing.push(key);
  }

  saved[action] = existing.join("|");
  localStorage.setItem(`customControlsSlot${slot}`, JSON.stringify(saved));

  pendingBind.textContent = saved[action];
  pendingBind = null;
});  

document.addEventListener('keydown', (e) => {
  const key = e.key.toLowerCase();
  if (pressedKeys.has(key)) return;
  pressedKeys.add(key);

  const action = activeKeyBindings[key];
  if (!player.matrix || !player.type) return;

  const keysToPrevent = [" ", "arrowup", "arrowdown", "arrowleft", "arrowright", "escape"];
  if (keysToPrevent.includes(key)) {
    e.preventDefault();
  }

  if (!isPaused || key === 'p') {
    switch (action) {
      case 'left':
        if (!e.repeat) {
          playerMove(-1);
          tapLeft = true;
        }
        moveHoldDir = -1;
        moveFrameCounter = dasFrames;
        initialMovePending = true;
        break;

      case 'right':
        if (!e.repeat) {
          playerMove(1);
          tapRight = true;
        }
        moveHoldDir = 1;
        moveFrameCounter = dasFrames;
        initialMovePending = true;
        break;

      case 'softdrop':
        if (!isSoftDropping) isSoftDropping = true;
        break;

      case 'harddrop':
        playerHardDrop();
        rotatedLast = false;
        break;

      case 'cw':
        playerRotateCW();
        break;

      case 'ccw':
        playerRotateCCW();
        break;

      case 'rotate180':
        playerRotate180();
        break;

      case 'hold':
        holdPiece();
        break;
    }

    if ((e.key === " " || e.code === "Space") && !action) {
      e.preventDefault();
      playerHardDrop();
      rotatedLast = false;
    }
  }

  totalKeysPressed++;
});

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  pressedKeys.delete(key);

  const action = activeKeyBindings[key] || "";

  const wrapper = document.querySelector(".tetris-wrapper");
  if ((action === "left" && tapLeft) || (action === "right" && tapRight)) {
    wrapper?.classList.remove("arena-left", "arena-right");
    wrapper?.classList.add("arena-center");
  }

  if (action === "left") {
    moveHoldDir = 0;
    initialMovePending = false;
    tapLeft = false;
  } else if (action === "right") {
    moveHoldDir = 0;
    initialMovePending = false;
    tapRight = false;
  } else if (action === "softdrop") {
    isSoftDropping = false;
  }
});
      
  pauseButton.onclick = () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    document.getElementById('pausedOverlay').innerText = isPaused ? 'The game is paused' : '';
  
    if (isPaused) {
      const bgm = window.getCurrentBGM?.();
      if (bgm) bgm.pause(); // ⏸️ pause lagu saat game pause
    } else {
      lastTime = performance.now();
      const bgm = window.getCurrentBGM?.();
      if (bgm) bgm.play();  // ▶️ lanjut lagu saat resume
      update();
    }}
    

  restartButton.onclick = () => {
    gameOverOverlay.style.display = 'none';
  
    // Reset arena
    arena.forEach(row => row.fill(0));
  
    // Reset status permainan
    isGameOver = false;
    isPaused = false;
    player.score = 0;
    player.level = 1;
    player.lines = 0;
    dropInterval = 1000;
    comboCount = 0;
    hold.matrix = null;
    hold.hasHeld = false;
  
    // Reset timer
    elapsedTime = 0;
    timerStarted = false;
    lastTime = 0;
    if (timerElement) timerElement.textContent = "0:00";
  
    // Tampilkan countdown ulang
    startCountdown();
  };
    

  const backButton = document.getElementById('backMode');

  if (backButton) {
    backButton.onclick = () => {
      window.location.href = "select-mode.html";
    };
  }
    

  // ✅ JOIN BUTTON ACTION
  if (joinButton) {
    joinButton.onclick = (_) => {
      let name = nicknameInput.value.trim();
      if (!name) {
        name = coolNicknames[Math.floor(Math.random() * coolNicknames.length)];
      }
      nickname = name;
      nicknameDisplay.textContent = `Player: ${nickname}`;
      startScreen.style.display = "none";
      modeScreen.style.display = "flex";
      sounds.mainTheme.volume = 0.5;
      sounds.mainTheme.play();
    };
  }

  window.startCountdown = () => {
    const selectedMode = localStorage.getItem('selectedGameMode');
    const selectedSoloMode = localStorage.getItem('selectedSoloMode');
    if (selectedMode === 'solo' && !selectedSoloMode) {
      alert("Please select a solo mode before playing!");
      return;
    }
  
    countdownValue = 3;
    countdownText.textContent = countdownValue;
    document.getElementById('countdownOverlay').style.display = 'flex';
    sounds.countdown3.play();
  
    const countdownInterval = setInterval(() => {
      countdownValue--;
  
      if (countdownValue > 0) {
        countdownText.textContent = countdownValue;
        if (countdownValue === 2) sounds.countdown2.play();
        else if (countdownValue === 1) sounds.countdown1.play();
      } else {
        clearInterval(countdownInterval);
        document.getElementById('countdownOverlay').style.display = 'none';
        // ✅ Game dan timer benar-benar dimulai di sini
        playerReset();
        lastTime = performance.now();
        gameStartTime = Date.now(); 
        timerStarted = true;

        // 🔊 Mulai musik BGM random
        if (window.playRandomBGM) {
          window.playRandomBGM();
        }
  
        update();
        }
    }, 1000);
  };
      
  // ✅ Final call (ONLY this)
  startCountdown(); // jangan ada baris lain setelah ini (seperti update() atau playerReset())
  
  let hold = {
    matrix: null,
    hasHeld: false
  };

  let pendingBind = null;

document.querySelectorAll(".custom-key").forEach(el => {
  el.addEventListener("click", () => {
    if (pendingBind) {
      const oldAction = pendingBind.dataset.action;
      const oldSlot = pendingBind.dataset.slot;
      pendingBind.textContent = getDisplayKeys(oldSlot, oldAction);
    }

    pendingBind = el;
    el.textContent = "[PRESS KEY]";
  });
});

window.addEventListener("keydown", (e) => {
  
  if (!pendingBind) return;

  const slot = pendingBind.dataset.slot;
  const action = pendingBind.dataset.action;
  const key = e.key.toLowerCase();

  let saved = JSON.parse(localStorage.getItem(`customControlsSlot${slot}`)) || { ...defaultControls };

  const existing = saved[action] ? saved[action].split("|") : [];
  if (!existing.includes(key)) {
    existing.push(key);
  }

  saved[action] = existing.join("|");
  localStorage.setItem(`customControlsSlot${slot}`, JSON.stringify(saved));

  pendingBind.textContent = saved[action];
  pendingBind = null;
});

  
  function holdPiece() {
    holdCount++;

    if (hold.hasHeld) return;
    hold.hasHeld = true;

    if (sounds.hold) {
      sounds.hold.currentTime = 0;
      sounds.hold.play();
    }
  
    let temp = hold.matrix;
    hold.matrix = player.matrix;
    if (temp) {
      player.matrix = temp;
    } else {
      playerReset();
    }
    player.pos.y = arena.length - player.matrix.length;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
  }
  
  function drawHold() {
    const holdCanvas = document.getElementById('holdCanvas');
    if (!holdCanvas || !hold.matrix) return;
    const holdCtx = holdCanvas.getContext('2d');
    holdCtx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
    holdCtx.scale(1, 1);
    holdCtx.save();
    holdCtx.scale(20, 20);
    const offsetX = Math.floor((holdCanvas.width / 20 - hold.matrix[0].length) / 2);
    const offsetY = Math.floor((holdCanvas.height / 20 - hold.matrix.length) / 2);
    drawMatrix(hold.matrix, { x: offsetX, y: offsetY }, holdCtx);
    holdCtx.restore();
  }
  function drawTrails() {
    const now = performance.now();
    activeTrails = activeTrails.filter(trail => now - trail.createdAt < trail.duration);
  
    activeTrails.forEach(trail => {
      const { matrix, x, fromY, toY, createdAt, duration } = trail;
      const age = now - createdAt;
      const alpha = 1 - (age / duration);
  
      const trailHeight = fromY - toY;
      if (trailHeight <= 0) return;
  
      matrix.forEach((row, y) => {
        row.forEach((value, xx) => {
          if (value !== 0) {
            for (let i = 0; i < trailHeight; i++) {
              const fade = 1 - i / trailHeight;
              context.save();
              context.fillStyle = `rgba(0, 128, 255, ${fade * alpha * 0.4})`;
              context.fillRect(x + xx, toY + y + i, 1, 1);
              context.restore();
            }
          }
        });
      });
    });
  }    
};