function updateVolumeValue(id) {
  const el = document.getElementById(id);
  if (!el) return; // amanin kalau element gak ketemu

  const volume = parseInt(el.value, 10);

  // Target elemen audio berdasarkan slider ID
  const audioMap = {
    musicVolume: "main-theme",
    fxVolume: "buttonSound"
  };
  const audioId = audioMap[id];
  const audio = document.getElementById(audioId);
  if (audio) {
    audio.volume = volume / 100;
  }

  // Update label persen
  const label = document.getElementById(id + "Value");
  if (label) {
    label.textContent = `${volume}%`;
  }

  // Update CSS untuk fill slider
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
  const label = document.getElementById(id + '-value');

  const stored = localStorage.getItem(id);
  let val = stored !== null ? parseFloat(stored) : defaultValue[id];

  // ➜ BALIK NILAI untuk slider tampilan
  if (id === "das") val = 21 - val; // 1 ↔ 20
  if (id === "arr") val = 5.1 - val; // 0 ↔ 5

  el.value = val;

  const update = () => {
    let rawVal = parseFloat(el.value);

    // 🔁 BALIK LAGI saat nyimpan ke localStorage
    if (id === "das") rawVal = 21 - rawVal;
    if (id === "arr") rawVal = 5.1 - rawVal;

    localStorage.setItem(id, rawVal);

    if (id === "arr") {
      label.textContent = `${Math.round(rawVal * 16.67)}MS (${Math.round(rawVal)}F)`;
    } else if (id === "das") {
      label.textContent = `${Math.round(rawVal * 16.67)}MS (${Math.round(rawVal)}F)`;
    } else if (id === "sdf") {
      const info = convertSDF(rawVal);
      label.textContent = `${info.x}X`;
    }
  };

  el.addEventListener("input", update);
  update(); // initialize
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

  for (const id in defaultValue) {
    if (localStorage.getItem(id) === null) {
      localStorage.setItem(id, defaultValue[id]);
    }
  }


  // ✅ Load preset kontrol
  loadPreset('guideline');

  // ✅ Volume setup
  const mainTheme = document.getElementById("main-theme");
  if (mainTheme) {
    mainTheme.volume = 0.05;
    const musicSlider = document.getElementById("musicVolume");
    if (musicSlider) {
      musicSlider.value = 5;
      updateVolumeValue("musicVolume");
    }
  }

    // ✅ Slider update init
    ["das", "arr", "sdf"].forEach(updateHandling);


  const buttonSound = document.getElementById("buttonSound");
  if (buttonSound) {
    buttonSound.volume = 0.5;
    const fxSlider = document.getElementById("fxVolume");
    if (fxSlider) {
      fxSlider.value = 50;
      updateVolumeValue("fxVolume");
    }
  }

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
  
document.getElementById("resetHandling").addEventListener("click", () => {
  const defaultValues = {
    das: 10,  // in frames
    arr: 2,   // in frames
    sdf: 6    // 6X
  };

  for (const key in defaultValues) {
    localStorage.setItem(key, defaultValues[key]);
  }

  // 🔁 Panggil ulang fungsi render supaya value, label, dan slider visual sinkron
  ["das", "arr", "sdf"].forEach(updateHandling);
});
document.getElementById("resetCustom").addEventListener("click", resetCustomControls);
