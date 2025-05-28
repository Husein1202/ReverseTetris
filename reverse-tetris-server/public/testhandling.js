let canvas, context;
let dropTrails = [];
let trailPieces = [];
let activeTrails = [];

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
  console.log(`🔍 WallkickData for ${type} ${key}`);
  if (type === 'I') {
    return wallkickDataI[key] || [ {x:0, y:0} ];
  }
  return wallkickDataNormal[key] || [ {x:0, y:0} ];
}

const defaultControls = {
  left: "ArrowLeft|a",
  right: "ArrowRight|d",
  softdrop: "ArrowUp|w",
  harddrop: "Space",    
  cw: "s|ArrowDown",
  ccw: "z",
  rotate180: "c",
  hold: "Shift|h"
};

let activeControlSlot = parseInt(localStorage.getItem("activeControlSlot")) || 1;
let activeKeyBindings = {};

function applyActiveControlBindings() {
const saved = JSON.parse(localStorage.getItem(`customControlsSlot${activeControlSlot}`)) || { ...defaultControls };
  activeKeyBindings = {};

  for (const action in saved) {
    const keys = saved[action].split("|");
    for (const k of keys) {
      ["", "ctrl+", "shift+", "alt+"].forEach(prefix => {
        activeKeyBindings[`${prefix}${k.toLowerCase()}`] = action; // fix: keep action unmodified
      });
    }
  }
}

window.coolNicknames = [
  "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
  "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
  "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
  "SkuyMain", "KambingNgeLag", "BudeTetris", "UjangGaming", "KlikAjaDulu"
];

function updateHandlingDisplay() {
  const arr = localStorage.getItem("arr") ?? "--";
  const das = localStorage.getItem("das") ?? "--";
  const sdf = localStorage.getItem("sdf") ?? "--";
  const el = document.getElementById("handlingInfo");
  if (el) el.textContent = `ARR ${arr}F. DAS ${das}F. SDF ${sdf}X`;
}


window.onload = () => {
  applyActiveControlBindings();
  localStorage.setItem('selectedGameMode', 'medi'); // ⬅️ Tambahkan ini

  const mode = localStorage.getItem('selectedGameMode');
const solo = localStorage.getItem('selectedSoloMode');
if (mode === 'solo' && !solo) {
  window.location.href = 'solo.html';
}

  const joinButton = document.getElementById('joinButton');
  const startScreen = document.getElementById('startScreen');
  const nicknameInput = document.getElementById('nicknameInput');

  if (joinButton && nicknameInput && startScreen) {
    const coolNicknames = [
      "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
      "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
      "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
      "SkuyMain", "KambingNgeLag", "BudeTetris", "UjangGaming", "KlikAjaDulu"    
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

  canvas = document.getElementById('tetris');

  context = canvas.getContext('2d');
  context.scale(20, 20);

  const nextCanvas = document.getElementById('nextCanvas');
  const nextContext = nextCanvas.getContext('2d');
  nextContext.scale(20, 20)

  const sounds = {
    rotate: document.getElementById('rotate'),
    move: document.getElementById('move'),
    harddrop: document.getElementById('harddrop'),
    lineclear: document.getElementById('lineclear'),
    hold: document.getElementById('hold'),
    undo: document.getElementById("undo"),
    softdrop: document.getElementById('softdrop'),
    levelup: document.getElementById('levelup'),
    countdown3: document.getElementById('countdown3'),
    countdown2: document.getElementById('countdown2'),
    countdown1: document.getElementById('countdown1'),
    bgMusic: document.getElementById('bgMusic'),
    mainTheme: document.getElementById('mainTheme'),
  };

  sounds.comboBreak = document.getElementById('comboBreak');
  let arena = createMatrix(12, 30);
  const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    lines: 0,
    next: null,
    rotation: 0,
    flip180: false
  };

let dropCounter = 0;
let lastTime = 0;
let isGameOver = false;
let isPaused = false;
let rotatedLast = false;
let totalKeysPressed = 0;
let holdCount = 0;
let lockTimeout;
let isSoftDropping = false;
let moveHoldDir = 0;
let tapLeft = false;
let tapRight = false;
let lockPending = false;
let lockResetCount = 0;
let usedWallkick = false;
let lockedAfterRotate = false;
const LOCK_DELAY_MS = 500; // Durasi delay sebelum piece dikunci (dalam milidetik)
const MAX_LOCK_RESETS = 15;
let isRestarting = false;
let isEscapeHolding = false;
let escHoldStartTime = null;
let hasTriggeredQuit = false;
let escAnimationFrame = null;
let escKeyIsDown = false;
let undoStack = [];
let isCtrlZPressed = false;
let dasTimerMs = 0;
let arrTimerMs = 0;
let isInitialMove = false;
let gravity = 0.015; 
const dropInterval = 1000
let gravityCounter = 0;
let softDropCounter = 0;
let sdfFrames = parseFloat(localStorage.getItem("sdf")) || 6;
sdfFrames = Math.min(Math.max(sdfFrames, 1), 50);

const dasFrames = parseFloat(localStorage.getItem("das") ?? "10");
const arrFrames = parseFloat(localStorage.getItem("arr") ?? "2");


const dasDelay = dasFrames * (1000 / 60);
const arrDelay = arrFrames * (1000 / 60);


const cheeseImage = new Image();
cheeseImage.src = 'cheese.jpg'; // pastikan path ini sesuai lokasi file

const blockImage = new Image();
blockImage.src = 'tetromino_tilesheet.png';
const TILE_SIZE = 32;


function createMatrix(w, h) {
    if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
        throw new Error('createMatrix: width and height must be positive integers');
    }
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
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
  
  

  let bag = [];

function getNextPiece() {
  if (bag.length === 0) {
    bag = ['T', 'J', 'L', 'O', 'S', 'Z', 'I'];
    bag = bag.sort(() => Math.random() - 0.5);
  }
  return createPiece(bag.pop());
}

// Menggambar matriks (tetromino, ghost, hold) ke canvas di posisi tertentu //
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
    if (isPaused) {
      pausedOverlay.style.display = 'flex';
      return;
    } else {
      pausedOverlay.style.display = 'none';
    }
  
    context.clearRect(0, 0, canvas.width, canvas.height); 
    context.fillStyle = '#121757';
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
      
    dropTrails = dropTrails.filter(trail =>
      trail.some(block => block.alpha > 0)
    );
  }
  
// Hard Drop Trail Effect //
    

  function playerHardDrop() {
    let dropStartY = player.pos.y;
  
    while (!collide(arena, player)) player.pos.y--;
    player.pos.y++;
  
    if (mode === "medi" && collide(arena, player)) {
      // ❌ Jangan merge/reset kalau sudah nabrak
      return;
    }
  
    activeTrails.push({
      matrix: JSON.parse(JSON.stringify(player.matrix)),
      x: player.pos.x,
      fromY: dropStartY,
      toY: player.pos.y,
      createdAt: performance.now(),
      duration: 600
    });
    undoStack.push({
      player: {
        matrix: player.matrix.map(r => [...r]),
        pos: { ...player.pos },
        rotation: player.rotation,
        flip180: player.flip180
      },
      arena: arena.map(row => [...row]),
      bag: [...bag],
      next: {
        matrix: player.next.matrix.map(r => [...r]),
        type: player.next.type
      }
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
    undoStack.push({
      player: {
        matrix: player.matrix.map(row => [...row]),
        pos: { ...player.pos },
        rotation: player.rotation,
        flip180: player.flip180
      },
      arena: arena.map(row => [...row])
    });
    merge(arena, player);
    hold.hasHeld = false;
    arenaSweep();
    playerReset();
    lockPending = false;
    lockResetCount = 0;
  }, LOCK_DELAY_MS);
}
    
            
      function playerDrop() {
        // Jangan drop kalau sudah mulai lock delay
        if (lockPending) return;
      
        player.pos.y--;
        if (collide(arena, player)) {
          player.pos.y++;
          
          if (!lockPending) {
            lockPending = true;
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
  
    
function isValidPlacement(matrix, pos, arena) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < matrix[y].length; ++x) {
      if (matrix[y][x] !== 0) {
        const ay = y + pos.y;
        const ax = x + pos.x;

        // ❌ Posisi terlalu kiri/kanan/bawah → ditolak
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

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        const ay = y + player.pos.y;
        const ax = x + player.pos.x;
        if (
          value !== 0 &&
          ay >= 0 && ay < arena.length &&
          ax >= 0 && ax < arena[0].length &&
          arena[ay][ax] !== 8 // ⛔ JANGAN TIMPA GARBAGE
        ) {
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
          if (
            ay < 0 || ay >= arena.length ||
            ax < 0 || ax >= arena[0].length ||
            arena[ay][ax] !== 0 // ⬅️ tetap hitung 8 sebagai benturan
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  function offsetPiece(dir) {
  return {
    matrix: player.matrix,
    pos: { x: player.pos.x + dir, y: player.pos.y }
  };
}

  
  
  function playerReset() {
    
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
  if (!isRestarting) {
    isRestarting = true;
    console.log("🔁 Game restarting due to collision after spawn...");
    startRestartSequence();  // 🔧 Sekarang sudah tidak error
  }
  return; // ⛔ Jangan lanjut merge atau gambar tetromino
}

    console.log("Player reset with piece", player.matrix);
    console.log("Player position", player.pos);
}

function arenaSweep() {
  let linesCleared = 0;
  const clearedRows = [];
  for (let y = 0; y < arena.length; ++y) {
    if (arena[y].every(cell => cell !== 0)) {
      clearedRows.push(y);
      arena.splice(y, 1);
      arena.push(new Array(arena[0].length).fill(0));
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
      comboTitle.style.opacity = 1;
      setTimeout(() => comboTitle.style.opacity = 0, 1000);
    }
    sounds.lineclear.currentTime = 0;
    sounds.lineclear.play();
  }
}

function update(time = 0) {
  if (isPaused || isGameOver) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  // 🔵 Soft Drop (frame-based)
  if (isSoftDropping) {
    softDropCounter++;
    if (softDropCounter >= sdfFrames) {
      softDropCounter = 0;
      playerDrop();

      if (sounds.softdrop) {
        const softdropSFX = sounds.softdrop.cloneNode();
        softdropSFX.volume = sounds.softdrop.volume;
        softdropSFX.play();
      }
    }
  }

  // 🔵 Auto fall (gravity)
  dropCounter += deltaTime;
  if (!lockPending && dropCounter > dropInterval) {
    playerDrop();
    dropCounter = 0;
  }

  // 🔵 Frame-locked DAS & ARR
  if (moveHoldDir !== 0) {
    dasTimerMs += deltaTime;

    if (isInitialMove && dasTimerMs >= dasDelay) {
      isInitialMove = false;
      arrTimerMs = 0;
    }

    if (!isInitialMove) {
      arrTimerMs += deltaTime;
      if (arrTimerMs >= arrDelay) {
        if (!collide(arena, offsetPiece(moveHoldDir))) {
          playerMove(moveHoldDir);
        }
        arrTimerMs = 0;
      }
    }
  }

  updateDebris(deltaTime);
  draw(deltaTime);
  requestAnimationFrame(update);
}

function startRestartSequence() {
  isGameOver = true;
  resetGame();
  isRestarting = false;
}

function getInputKey(e) {
  let mod = "";
  if (e.ctrlKey) mod += "ctrl+";
  if (e.shiftKey) mod += "shift+";
  if (e.altKey) mod += "alt+";
  return mod + e.key.toLowerCase();
}

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

document.addEventListener("keydown", (e) => {
  const inputKey = getInputKey(e);

  // ✅ UNDO MULTISTEP
  if (inputKey === "ctrl+z" && undoStack.length > 0 && !isCtrlZPressed) {
    e.preventDefault();
    isCtrlZPressed = true;

    const last = undoStack.pop();
    for (let y = 0; y < arena.length; y++) {
      arena[y] = last.arena[y].slice();
    }
    player.matrix = last.player.matrix.map(r => [...r]);
    player.pos = {
      x: Math.floor(arena[0].length / 2) - Math.floor(last.player.matrix[0].length / 2),
      y: arena.length - last.player.matrix.length
    };
    player.rotation = last.player.rotation;
    player.flip180 = last.player.flip180;
    bag = [...last.bag];
    player.next = {
      matrix: last.next.matrix.map(r => [...r]),
      type: last.next.type
    };

    lockPending = false;
    lockResetCount = 0;
    dropCounter = 0;

    const undoAlert = document.getElementById("undoAlert");
    if (undoAlert) {
      undoAlert.classList.add("show");
      setTimeout(() => {
        undoAlert.classList.remove("show");
      }, 1200);
    }

    const arenaContainer = document.querySelector(".tetris-wrapper");
    if (arenaContainer) {
      arenaContainer.classList.add("arena-shake");
      setTimeout(() => {
        arenaContainer.classList.remove("arena-shake");
      }, 300);
}


if (sounds.undo) {
  const sfx = sounds.undo.cloneNode();
  const fxVol = parseFloat(localStorage.getItem("fxVolume") ?? "15") / 100;
  sfx.volume = fxVol;
  sfx.currentTime = 0;
  sfx.play();
}

    return;
  }

  const key = e.key.toLowerCase();
  if (pressedKeys.has(key)) return;
  pressedKeys.add(key);

  const action = activeKeyBindings[inputKey];
  if (!player.matrix || !player.type) return;

  const keysToPrevent = [" ", "arrowup", "arrowdown", "arrowleft", "arrowright", "escape"];
  if (keysToPrevent.includes(key)) {
    e.preventDefault();
  }

  if (!isPaused || key === 'p') {
    switch (action) {
    case 'left':
      if (!e.repeat) {
        playerMove(-1);      // ⬅️ sekali tap saja
        tapLeft = true;
      }
      moveHoldDir = -1;
      dasTimerMs = 0;
      arrTimerMs = 0;
      isInitialMove = true;  // ⬅️ untuk delay DAS
      break;

    case 'right':
      if (!e.repeat) {
        playerMove(1);
        tapRight = true;
      }
      moveHoldDir = 1;
      dasTimerMs = 0;
      arrTimerMs = 0;
      isInitialMove = true;
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

// ✅ Tambahkan di event keyup

document.addEventListener("keyup", (e) => {
  const key = e.key.toLowerCase();
  if (key === "z" && isCtrlZPressed) {
    isCtrlZPressed = false;
  }

  pressedKeys.delete(key);

  const action = activeKeyBindings[getInputKey(e)];

  if ((action === "left" && tapLeft) || (action === "right" && tapRight)) {
    const wrapper = document.querySelector(".tetris-wrapper");
    if (wrapper) {
      wrapper.classList.remove("arena-left", "arena-right");
      wrapper.classList.add("arena-center");
    }
  }

if (action === "left" || action === "right") {
  moveHoldDir = 0;
  isInitialMove = false;
  dasTimerMs = 0;
  arrTimerMs = 0;
  tapLeft = false;
  tapRight = false;
}
if (action === "softdrop") {
  isSoftDropping = false;
  softDropCounter = 0;
}

});
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
    let hold = {
    matrix: null,
    hasHeld: false
  };
  
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
const HOLD_DURATION = 2000;


const quitOverlay = document.getElementById('holdToQuitOverlay');
const progressQuitBar = document.getElementById('progressQuitBar');

function updateProgressBar() {
  if (!isEscapeHolding || hasTriggeredQuit || !escHoldStartTime) return;

  const elapsed = Date.now() - escHoldStartTime;
  const progress = Math.min(elapsed / HOLD_DURATION, 1);
    console.log(`progress: ${progress}, elapsed: ${elapsed}`); // 🔍 Tambahkan ini untuk debug


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
      requestAnimationFrame(() => {
        escAnimationFrame = requestAnimationFrame(updateProgressBar);
      });
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
function resetGame() {
  console.log("🧼 Reset game triggered");

  arena.forEach(row => row.fill(0));
  hold = { matrix: null, hasHeld: false };
  holdCount = 0;
  player.score = 0;
  player.lines = 0;

  playerReset();
  isGameOver = false;

  setTimeout(() => {
    draw();
    requestAnimationFrame(update);  // ⬅️ Langsung mulai update loop
    console.log("🎮 Game ready again");
  }, 500);

  const holdCanvas = document.getElementById('holdCanvas');
  if (holdCanvas) {
    const ctx = holdCanvas.getContext('2d');
    ctx.clearRect(0, 0, holdCanvas.width, holdCanvas.height);
  }
}
updateHandlingDisplay();
resetGame();
requestAnimationFrame(update);

};