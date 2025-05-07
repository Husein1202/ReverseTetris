let canvas, context;
let dropTrails = [];
let trailPieces = [];
let activeTrails = [];

window.coolNicknames = [
  "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
  "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
  "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
  "SkuyMain", "KambingNgeLag", "HoloFury", "UjangGaming", "KlikAjaDulu"
];

window.onload = () => {
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
  const completionOverlay = document.getElementById('completionOverlay');
  const comboDisplay = document.getElementById('comboDisplay');
  let comboDisplayTimeout = null;
  const comboTitle = document.getElementById("comboTitle");

  function showComboTitle(linesCleared) {
  const names = ["Single", "Double", "Triple", "Quadruple", "Quintuple", "U nailed it!"];
  const label = names[Math.min(linesCleared - 1, names.length - 1)];
  comboTitle.textContent = label;
  comboTitle.style.opacity = 1;
  comboTitle.classList.add("shake");

  setTimeout(() => {
    comboTitle.style.opacity = 0;
    comboTitle.classList.remove("shake");
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

  const FrenzyTimerElement = document.getElementById("FrenzyTimer");
  let FrenzyTimeRemaining = 2 * 60 * 1000; // 2 menit dalam ms

  function formatFrenzyTime(ms) {
    ms = Math.max(0, ms);
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function updateFrenzyTimer(deltaTime) {
    if (isPaused || isGameOver || !timerStarted) return;
  
    FrenzyTimeRemaining -= deltaTime;
    if (FrenzyTimeRemaining <= 0) {
      FrenzyTimeRemaining = 0;
      isGameOver = true;
  
      // Stop background music and play gameover sound
      sounds.bgMusic.pause();
      sounds.gameover.currentTime = 0;
      sounds.gameover.play();
  
      // Tampilkan overlay
      document.getElementById("completionOverlay").style.display = "flex";
  
      // Skor akhir
      document.getElementById("finalScoreDisplay").textContent = player.score;
      document.getElementById("statScore").textContent = player.score;
  
      // Pastikan waktu dihitung akurat
      const totalElapsed = Date.now() - gameStartTime; // pastikan kamu set `gameStartTime = Date.now()` saat game dimulai
      const totalSeconds = totalElapsed / 1000;
  
      // Stats akurat
      document.getElementById("statPieces").textContent = totalPiecesDropped;
      const pps = totalSeconds > 0 ? (totalPiecesDropped / totalSeconds).toFixed(2) : "0.00";
      document.getElementById("statPPS").textContent = pps;
  
      document.getElementById("statKeys").textContent = totalKeysPressed;
      document.getElementById("statKPP").textContent = totalPiecesDropped > 0
        ? (totalKeysPressed / totalPiecesDropped).toFixed(2)
        : "0.00";
  
      document.getElementById("statCombo").textContent = "x" + highestCombo;
      document.getElementById("statLines").textContent = player.lines;

  
      const lpm = totalSeconds > 0
        ? (player.lines / (totalSeconds / 60)).toFixed(0)
        : "0";
      document.getElementById("statLPM").textContent = lpm;
  
      document.getElementById("statHolds").textContent = holdCount;
  
      // Back button
      const backBtn = document.getElementById("completionbackMode");
      if (backBtn) {
        backBtn.onclick = () => window.location.href = "select-mode.html";
      }
  
      if (FrenzyTimerElement) {
        FrenzyTimerElement.textContent = "0:00";
      }
  
    } else {
      if (FrenzyTimerElement) {
        FrenzyTimerElement.textContent = formatFrenzyTime(FrenzyTimeRemaining);
      }
    }
  }
  

  const sounds = {
    rotate: document.getElementById('rotate'),
    move: document.getElementById('move'),
    harddrop: document.getElementById('harddrop'),
    lineclear: document.getElementById('lineclear'),
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
  };

  let dropCounter = 0;
  let dropInterval = 1000;
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


function formatTime(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimer(deltaTime) {
  if (isPaused || isGameOver || !timerStarted) return;

  elapsedTime += deltaTime;
  const totalSeconds = elapsedTime / 1000;
const pps = totalPiecesDropped / totalSeconds;


  if (timerElement) {
    timerElement.textContent = formatTime(elapsedTime);
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
      'T': [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
      'O': [[2, 2], [2, 2]],
      'L': [[0, 3, 0], [0, 3, 0], [0, 3, 3]],
      'J': [[0, 4, 0], [0, 4, 0], [4, 4, 0]],
      'I': [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]],
      'S': [[0, 6, 6], [6, 6, 0], [0, 0, 0]],
      'Z': [[7, 7, 0], [0, 7, 7], [0, 0, 0]],
    };
    return pieces[type];
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

          // Normal piece with glow
          ctx.save();
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
      const offsetX = Math.floor((nextCanvas.width / 20 - player.next[0].length) / 2);
      const offsetY = Math.floor((nextCanvas.height / 20 - player.next.length) / 2);
      drawMatrix(player.next, { x: offsetX, y: offsetY }, nextContext);
      drawDebris(context);  // ⬅️ Tambahkan ini di akhir draw()

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
  
    merge(arena, player);
    hold.hasHeld = false;
    arenaSweep();
    playerReset();
  
    sounds.harddrop.currentTime = 0;
    sounds.harddrop.play();
  
    canvas.classList.add('shake');
    setTimeout(() => canvas.classList.remove('shake'), 300);
  }
  
  
            
  function playerDrop() {
    player.pos.y--;
    if (collide(arena, player)) {
      player.pos.y++;
      merge(arena, player);
      totalPiecesDropped++;
    hold.hasHeld = false;
    hold.hasHeld = false;
    arenaSweep();
      playerReset();
    }
    dropCounter = 0;
  }

  function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
      player.pos.x -= dir;
    } else {
      sounds.move.currentTime = 0;
      sounds.move.play();
    }
  }

  function playerRotate() {
    const m = player.matrix;
    for (let y = 0; y < m.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
      }
    }
    m.forEach(row => row.reverse());
    if (collide(arena, player)) {
      m.forEach(row => row.reverse());
      for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < y; ++x) {
          [m[x][y], m[y][x]] = [m[y][x], m[x][y]];
        }
      }
    } else {
      sounds.rotate.currentTime = 0;
      sounds.rotate.play();
    rotatedLast = true;
    }
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
player.matrix = player.next;
player.next = getNextPiece();
    player.pos.y = arena.length - player.matrix.length;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
      if (!isGameOver) {
        completionOverlay.style.display = 'flex';
        sounds.gameover.currentTime = 0;
        sounds.gameover.play();
        sounds.gameOverAlt.currentTime = 0;
        sounds.gameOverAlt.play();
        isGameOver = true;
      // Save recent solo score
      const recentScores = JSON.parse(localStorage.getItem("soloRecentScores") || "[]");
      recentScores.unshift({ name: nickname, score: player.score });
      if (recentScores.length > 5) recentScores.pop();
      localStorage.setItem("soloRecentScores", JSON.stringify(recentScores));

      // Display them
      const list = document.getElementById("leaderboardList");
      if (list) {
        list.innerHTML = "";
        recentScores.forEach(entry => {
          const li = document.createElement("li");
          li.textContent = `${entry.name} - ${entry.score}`;
          if (entry.name === nickname && entry.score === player.score) {
            li.style.color = "#FFD700";
            li.style.fontWeight = "bold";
          }
          list.appendChild(li);
        });
      }

      }
      return;
    }
    totalPiecesDropped++;

  }

  function arenaSweep() {
    let linesCleared = 0;
    const clearedRows = [];
    for (let y = 0; y < arena.length; ++y) {
      if (arena[y].every(cell => cell !== 0)) {
        clearedRows.push(y);            // ✅ SIMPAN BARIS YANG DICLEAR
        arena.splice(y, 1);
        arena.push(new Array(arena[0].length).fill(0));
        player.score += 10 * player.level;
        linesCleared++;
        y--;
      }
    }
  

    // Tambahkan efek hanya pada baris yang dihapus
if (clearedRows.length > 0) {
  clearedRows.forEach(rowY => {
    triggerFlash(rowY);   // Flash hanya di baris yang di-clear
    spawnDebris(rowY);    // Debris jatuh di baris itu juga
  });
}

  
    if (linesCleared > 0) {
      triggerFlash(); 
      // Basic T-Spin check
      const isTPiece = player.matrix.length === 3 && player.matrix[1][1] === 1;
      if (linesCleared > 0 && isTPiece && rotatedLast) {
        const cx = player.pos.x + 1;
        const cy = player.pos.y + 1;
        let corners = 0;
        if (arena[cy - 1]?.[cx - 1]) corners++;
        if (arena[cy - 1]?.[cx + 1]) corners++;
        if (arena[cy + 1]?.[cx - 1]) corners++;
        if (arena[cy + 1]?.[cx + 1]) corners++;
        if (corners >= 3) {
          player.score += 400 * player.level;
          congratsText.textContent = "T-SPIN!";
        }
      }
      rotatedLast = false;
  
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
      comboDisplay.classList.add('shake');
      clearTimeout(comboDisplayTimeout);
      comboDisplayTimeout = setTimeout(() => {
        comboDisplay.style.opacity = 0;
        comboDisplay.classList.remove('shake');
      }, 1000);
  
      sounds.lineclear.currentTime = 0;
      sounds.lineclear.play();
  
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      congratsText.textContent = phrase;
  
      player.lines += linesCleared;
  
      const newLevel = Math.floor(player.lines / 40) + 1;
      if (newLevel !== player.level) {
        player.level = newLevel;
        dropInterval = Math.max(100, 1000 - (player.level - 1) * 100);
        sounds.levelup.currentTime = 0;
        sounds.levelup.play();
      }
  
      if (player.lines >= 40 && localStorage.getItem("selectedSoloMode") === "40line") {
        setTimeout(() => {
          document.getElementById("completionOverlay").style.display = "flex";
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
  
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
  
    updateTimer(deltaTime); // ✅ Tambahan ini penting
    updateFrenzyTimer(deltaTime);
    updateDebris(deltaTime);
    draw(deltaTime);
    updateScore();
    requestAnimationFrame(update);
  }
  
  document.addEventListener('keydown', event => {
    totalKeysPressed++;

    

    if (event.key === 'o' || event.key === 'O') {
      document.getElementById("completionOverlay").style.display = "flex";
    }
    
    if (!isPaused || event.key.toLowerCase() === 'p') {
      
      switch (event.key) {
        case 'ArrowLeft':
        case 'a': case 'A':
          playerMove(-1);
          rotatedLast = false;
          break;
    
        case 'ArrowRight':
        case 'd': case 'D':
          playerMove(1);
          rotatedLast = false;
          break;
    
        case 'w': case 'W':
        case 'ArrowUp':
          playerDrop();
          rotatedLast = false;
          break;
    
        case 's': case 'S':
        case 'ArrowDown':
          playerRotate();
          break;
    
        case ' ':
          event.preventDefault();
          playerHardDrop();
          rotatedLast = false;
          break;
    
        case 'z': case 'Z':
          playerRotate(); playerRotate(); playerRotate();
          break;
    
        case 'c': case 'C':
          playerRotate(); playerRotate();
          break;
    
        case 'Shift': case 'ShiftLeft':
        case 'h': case 'H':
          holdPiece();
          break;
      }
    }
  )}
  pauseButton.onclick = () => {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Resume' : 'Pause';
    document.getElementById('pausedOverlay').innerText = isPaused ? 'The game is paused' : '';
  
    if (isPaused) {
      sounds.bgMusic.pause(); // ⏸️ Pause lagu saat pause
    } else {
      lastTime = performance.now();
      sounds.bgMusic.play(); // ▶️ Lanjutkan lagu saat resume
      update();
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
    
  

  window.startCountdown = () => {
    console.log("Countdown starting...");
  
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
        sounds.mainTheme.pause();
        sounds.bgMusic.volume = 0.1;
        sounds.bgMusic.currentTime = 0;
        sounds.bgMusic.play();
  
        // ✅ Game dan timer benar-benar dimulai di sini
        playerReset();
        lastTime = performance.now();
        gameStartTime = Date.now(); 
        timerStarted = true;
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
  
  function holdPiece() {
    holdCount++;

    if (hold.hasHeld) return;
    hold.hasHeld = true;
  
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
  window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded. Calling startCountdown...");
  startCountdown();
});

  
};
