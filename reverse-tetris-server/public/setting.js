function updateVolumeValue(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const volume = parseInt(el.value, 10);

  const audioMap = {
    musicVolume: "main-theme",
    fxVolume: "buttonSound"
  };

  const audioId = audioMap[id];
  const audio = document.getElementById(audioId);
  if (audio) {
    audio.volume = volume / 100;
  }

  // ⬇️ Tambahkan ini agar semua efek volume ikut fxVolume
  if (id === "fxVolume") {
    const sfxElements = [
      "rotate", "move", "harddrop", "softdrop", "lineclear", "hold", "gameover",
      "countdown1", "countdown2", "countdown3",
      "combo1", "combo2", "combo3", "combo4", "combo5", "combo6", "combo7", "combo8",
      "combo9", "combo10", "combo11", "combo12", "combo13", "combo14", "combo15", "combo16",
      "comboBreak", "undo", "levelup"
    ];
    for (const id of sfxElements) {
      const el = document.getElementById(id);
      if (el) el.volume = volume / 100;
    }
  }

  // Label persen
  const label = document.getElementById(id + "Value");
  if (label) label.textContent = `${volume}%`;

  const percent = ((volume - el.min) / (el.max - el.min)) * 100;
  el.style.setProperty('--range-progress', `${percent}%`);
}

const convertARR = (v) => Math.round(v); // simpan F
const convertDAS = (v) => Math.round(v); // simpan F
const convertSDF = (v) => {
  const dropPerSecond = v; // v = X speed
  const msPerDrop = 1000 / dropPerSecond;
  const framePerDrop = Math.round(60 / dropPerSecond); // assuming 60fps

  return {
    x: v,
    ms: Math.round(msPerDrop),
    frame: framePerDrop
  };
};

function updateHandling(id) {
  const el = document.getElementById(id);
  const label = document.getElementById(id + "-value");

  const stored = localStorage.getItem(id);
  let val = stored !== null ? parseFloat(stored) : defaultValue[id];

  // 💡 Balik slider agar UI kiri lambat, kanan cepat
  if (id === "arr") el.value = (5.0 - val).toFixed(1);
  else if (id === "das") el.value = (20.0 - val + 1.0).toFixed(1);
  else el.value = val;

  const update = () => {
    const sliderVal = parseFloat(el.value);
    let logicalVal = sliderVal;

    if (id === "arr") logicalVal = 5.0 - sliderVal;
    else if (id === "das") logicalVal = 20.0 - sliderVal + 1.0;

    localStorage.setItem(id, logicalVal.toFixed(1));

    if (id === "arr" || id === "das") {
      const ms = (logicalVal * (1000 / 60)).toFixed(0);
      label.textContent = `${ms}ms (${logicalVal.toFixed(1)}F)`;
    } else if (id === "sdf") {
      label.textContent = logicalVal >= 41 ? "INSTANT" : `${logicalVal}X`;
    }
  };

  el.addEventListener("input", update);
  update();
}

  const customControls = {};

  document.addEventListener('click', (e) => {
    const el = e.target;

    if (el.dataset.hit === 'click') {
      const action = el.dataset.action;
      const slot = el.dataset.slot;

      if (el.dataset.preset) {
        loadPreset(el.dataset.preset);
      } else if (action && slot) {
        assignKey(el, action, slot);
      }
    }
  });

  function assignKey(element, action, slot) {
    element.innerText = '[PRESS A KEY]';
  
    function keyHandler(e) {
      e.preventDefault();
      const key = e.key;
  
      if (!customControls[action]) {
        customControls[action] = {};
      }
  
      if (key === 'Backspace') {
        // ⛔ Hapus key dari slot tsb
        customControls[action][slot] = "";
        element.innerText = "[NOT SET]";
      } else {
        // ✅ Tambah atau ubah key baru
        customControls[action][slot] = key.toUpperCase();
        element.innerText = key.toUpperCase();
      }
  
      saveCustomControls();
      document.removeEventListener('keydown', keyHandler);
    }
  
    document.addEventListener('keydown', keyHandler);
  }
    
  // ✅ TARUH DI SINI:
  function saveCustomControls() {
    const merged = {};
  
    for (const action in customControls) {
      const key1 = customControls[action][1] || "";
      const key2 = customControls[action][2] || "";
      const keys = [key1, key2].filter(k => k && k !== "[NOT SET]").join("|");
      merged[action] = keys;
    }
  
    // ✅ Simpan ke slot yang dipakai gameplay
    localStorage.setItem("customControlsSlot1", JSON.stringify(merged));
    localStorage.setItem("customControlsSlot2", JSON.stringify(merged)); // optional
    }

  function loadCustomControls() {
    const stored = localStorage.getItem("customControlsSlot1");
    if (stored) {
      const flat = JSON.parse(stored);
      for (const action in flat) {
        const keys = flat[action].split("|");
        customControls[action] = {
          1: keys[0] || "",
          2: keys[1] || ""
        };
      }
    }
  }
  
    
function loadPreset(preset) {
const defaultTable = document.getElementById("default-controls");
const customWrapper = document.getElementById("custom-controls-wrapper");

  const guidelinePreset = {
    left: ["ArrowLeft", "A"],
    right: ["ArrowRight", "D"],
    softdrop: ["ArrowUp", "W"],
    harddrop: ["Space", ""],
    ccw: ["Z", ""],
    cw: ["ArrowDown", "S"],
    rotate180: ["C", ""],
    hold: ["Shift", "H"]
  };

  // === Preset Logic ===
  if (preset === 'custom') {
    defaultTable.style.display = "none";
    customWrapper.style.display = "block";
  
    loadCustomControls(); // 🧠 Ambil dari localStorage
  
    for (const action in customControls) {
      const key1 = customControls[action][1] || '[NOT SET]';
      const key2 = customControls[action][2] || '[NOT SET]';
  
      const el1 = document.querySelector(`.custom-key[data-action="${action}"][data-slot="1"]`);
      const el2 = document.querySelector(`.custom-key[data-action="${action}"][data-slot="2"]`);
  
      if (el1) el1.innerText = key1;
      if (el2) el2.innerText = key2;
    }
  }
    
  else if (preset === 'guideline') {
  defaultTable.style.display = "block";
  customWrapper.style.display = "none";


    document.getElementById("key-left").innerText = "Arrow Left, A";
    document.getElementById("key-right").innerText = "Arrow Right, D";
    document.getElementById("key-softdrop").innerText = "Arrow Up, W";
    document.getElementById("key-harddrop").innerText = "SPACE";
    document.getElementById("key-ccw").innerText = "Z";
    document.getElementById("key-cw").innerText = "Arrow Down, S";
    document.getElementById("key-180").innerText = "C";
    document.getElementById("key-hold").innerText = "SHIFT, H";

    for (const action in guidelinePreset) {
      customControls[action] = {
        1: guidelinePreset[action][0].toUpperCase(),
        2: guidelinePreset[action][1].toUpperCase() || '[NOT SET]'
      };

      const key1El = document.querySelector(`.custom-key[data-action="${action}"][data-slot="1"]`);
      const key2El = document.querySelector(`.custom-key[data-action="${action}"][data-slot="2"]`);
      if (key1El) key1El.innerText = customControls[action][1];
      if (key2El) key2El.innerText = customControls[action][2];
    }
  }

  // ✅ Tambahkan ini DI DALAM fungsi
  document.querySelectorAll('.preset-option').forEach(el => {
    el.classList.remove('active');
  });
  const activeBtn = document.querySelector(`.preset-option[data-preset="${preset}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
  }
}

// Set default preset saat halaman pertama kali dibuka
const backgrounds = [
  'bg1.jpg',
  'bg2.jpg',
  'bg3.jpg',
  'bg4.jpg',
  'bg5.jpg',
  'bg7.jpg',
  'bg8.jpg',
  'bg9.jpg',
  'bg10.jpg',
  'bg14.jpg'
];

// 🎶 BGM List dari folder /Sound/
const bgmList = [
  "Sound/fun-world.mp3",
  "Sound/kijou-no-kuuron-odoru-sai.mp3",
  "Sound/kokokara-hajimaru-fantasia.mp3",
  "Sound/kouya-no-sakini.mp3",
  "Sound/mainMusic.mp3",
  "Sound/nodoka-na-lunch.mp3",
  "Sound/ookina-kirikabu-no-ue-de.mp3",
  "Sound/opening-act.mp3",
  "Sound/osanpo.mp3",
  "Sound/peace-message.mp3",
  "Sound/please-push-on-the-start-button.mp3",
  "Sound/R-side-kimo-wo-tamesu.mp3",
  "Sound/samenai-yume.mp3",
  "Sound/shiroi-hato.mp3",
  "Sound/shiun.mp3",
  "Sound/tropical-seasons.mp3",
  "Sound/uchuu-5239.mp3",
  "Sound/venture.mp3",
  "Sound/world-prayers.mp3",
  "Sound/yakousei-no-utage.mp3",
  "Sound/yatai-de-ippai.mp3",
  "Sound/you-are-the-hero-of-an-adventure-story.mp3",
];

window.bgmList = bgmList;


function applyMusicVolume() {
  const musicVolume = parseFloat(localStorage.getItem("musicVolume")) / 100;
  bgmList.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.volume = musicVolume;
  });
}


let currentBGM = null;

function getRandomBGM(excludePath = null) {
  let available = bgmList.filter(path => !excludePath || !excludePath.includes(path));
  if (available.length === 0) available = bgmList;
  const index = Math.floor(Math.random() * available.length);
  return available[index];
}

function playRandomBGM() {
  const nextTrack = getRandomBGM(currentBGM?.src);
  const audio = new Audio(nextTrack);
  audio.loop = false;

  const savedVolume = parseFloat(localStorage.getItem("musicVolume") ?? 5);
  audio.volume = savedVolume / 100;

  if (savedVolume <= 0) return; // ⛔ mute total, tidak play

  audio.addEventListener("ended", () => {
    currentBGM = playRandomBGM();
  });

const resumeTime = parseFloat(localStorage.getItem("bgmResume") ?? 0);
if (resumeTime > 0) audio.currentTime = resumeTime;

audio.play();
window.currentBGM = audio;
return audio;
}


window.playRandomBGM = playRandomBGM;
window.getCurrentBGM = () => currentBGM;


const defaultValue = {
  das: 10,   // ≈167ms (10F)
  arr: 2,    // ≈33ms (2F)
  sdf: 6     // ➜ 6X 
};

// Pindahkan ke global scope:
function resetCustomControls() {
  const defaultBindings = {
    left: "ArrowLeft|A",
    right: "ArrowRight|D",
    softdrop: "ArrowUp|W",
    harddrop: "Space|",
    ccw: "Z|",
    cw: "ArrowDown|S",
    rotate180: "C|",
    hold: "Shift|H"
  };

  // Simpan ke dua slot (utamanya slot 1 untuk gameplay)
  localStorage.setItem("customControlsSlot1", JSON.stringify(defaultBindings));
  localStorage.setItem("customControlsSlot2", JSON.stringify(defaultBindings));

  // Update tampilan UI custom control (slot 1 dan 2)
  for (const action in defaultBindings) {
    const keys = defaultBindings[action].split("|");
    const el1 = document.querySelector(`.custom-key[data-action="${action}"][data-slot="1"]`);
    const el2 = document.querySelector(`.custom-key[data-action="${action}"][data-slot="2"]`);
    if (el1) el1.innerText = keys[0] || "[NOT SET]";
    if (el2) el2.innerText = keys[1] || "[NOT SET]";
  }

  // Update handling & audio UI
  ["das", "arr", "sdf"].forEach(updateHandling);
  updateVolumeValue("musicVolume");
  updateVolumeValue("fxVolume");
}


document.addEventListener("DOMContentLoaded", () => {
  loadCustomControls();

  // ✅ Default volume jika belum ada
  if (localStorage.getItem("musicVolume") === null) localStorage.setItem("musicVolume", 5); // 5%
  if (localStorage.getItem("fxVolume") === null) localStorage.setItem("fxVolume", 15); // 15%

  // ✅ Load preset kontrol
  loadPreset('guideline');

  // ✅ BGM Handler
  const bgmList = ["main-theme", "bgMusic"];
  function applyMusicVolume() {
    const musicVolume = parseFloat(localStorage.getItem("musicVolume")) / 100;
    bgmList.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.volume = musicVolume;
    });
  }

  // ✅ Atur volume BGM + slider music
  const musicSlider = document.getElementById("musicVolume");
  if (musicSlider) {
    const storedMusicVolume = localStorage.getItem("musicVolume");
    const savedVolume = storedMusicVolume !== null ? parseFloat(storedMusicVolume) : 5;
    musicSlider.value = savedVolume;
        updateVolumeValue("musicVolume");
    applyMusicVolume();

    musicSlider.addEventListener("input", () => {
      const newVolume = parseFloat(musicSlider.value);
      localStorage.setItem("musicVolume", newVolume);
      updateVolumeValue("musicVolume");
      applyMusicVolume();
    });
  }

  // ✅ FX Volume - Button & semua SFX
  const fxSlider = document.getElementById("fxVolume");
  const fxVolume = parseFloat(localStorage.getItem("fxVolume") ?? 15);
  const fxPercent = fxVolume / 100;

  const sfxIds = [
    "rotate", "move", "harddrop", "softdrop", "lineclear", "hold", "gameover",
    "countdown1", "countdown2", "countdown3",
    "combo1", "combo2", "combo3", "combo4", "combo5", "combo6", "combo7", "combo8",
    "combo9", "combo10", "combo11", "combo12", "combo13", "combo14", "combo15", "combo16",
    "comboBreak", "buttonSound","undo"
  ];

  sfxIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.volume = fxPercent;
  });

  if (fxSlider) {
    fxSlider.value = fxVolume;
    updateVolumeValue("fxVolume");
    fxSlider.addEventListener("input", () => {
      const newVol = parseFloat(fxSlider.value);
      localStorage.setItem("fxVolume", newVol);
      updateVolumeValue("fxVolume");

      sfxIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.volume = newVol / 100;
      });
    });
  }

  // ✅ Slider update init (DAS, ARR, SDF)
  ["das", "arr", "sdf"].forEach(updateHandling);

  // ✅ Background randomizer
  const backgrounds = [
    'bg1.jpg', 'bg2.jpg', 'bg3.jpg', 'bg4.jpg', 'bg5.jpg',
    'bg7.jpg', 'bg8.jpg', 'bg9.jpg', 'bg10.jpg', 'bg14.jpg'
  ];
  const selectedBG = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  document.body.style.backgroundImage = `url('Wallpaper/${selectedBG}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
});
  

document.addEventListener("DOMContentLoaded", () => {
  const resetHandlingBtn = document.getElementById("resetHandling");
  if (resetHandlingBtn) {
    resetHandlingBtn.addEventListener("click", () => {
      const defaultValues = {
        das: 10,
        arr: 2,
        sdf: 6
      };
      for (const key in defaultValues) {
        localStorage.setItem(key, defaultValues[key]);
      }
      ["das", "arr", "sdf"].forEach(updateHandling);
    });
  }

  const resetCustomBtn = document.getElementById("resetCustom");
  if (resetCustomBtn) {
    resetCustomBtn.addEventListener("click", resetCustomControls);
  }

  // (tambahkan listener lainnya di sini juga jika perlu)
});
