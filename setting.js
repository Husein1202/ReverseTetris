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

document.addEventListener("DOMContentLoaded", () => {
  // Main Theme Volume awal (5%)
  const mainTheme = document.getElementById("main-theme");
  if (mainTheme) {
    mainTheme.volume = 0.05;
    const musicSlider = document.getElementById("musicVolume");
    if (musicSlider) {
      musicSlider.value = 5;
      updateVolumeValue("musicVolume"); // <-- Tambahkan ini
    }
  }

  // Button Sound Volume awal (50%)
  const buttonSound = document.getElementById("buttonSound");
  if (buttonSound) {
    buttonSound.volume = 0.5;
    const fxSlider = document.getElementById("fxVolume");
    if (fxSlider) {
      fxSlider.value = 50;
      updateVolumeValue("fxVolume"); // <-- Tambahkan ini
    }
  }
});

  das.addEventListener("input", () => {
    document.getElementById("das-value").textContent = das.value + "MS";
  });
  arr.addEventListener("input", () => {
    document.getElementById("arr-value").textContent = arr.value + "MS";
  });
  sdf.addEventListener("input", () => {
    document.getElementById("sdf-value").textContent = sdf.value + "MS";
  });

  function updateHandling(id) {
    const el = document.getElementById(id);
    const label = document.getElementById(id + '-value');
    const update = () => {
      const ms = parseInt(el.value, 10);
      const frames = Math.round(ms / (1000 / 60)); // convert ms to frames (assuming 60fps)
      label.textContent = `${ms}MS (${frames}F)`;
    };
    el.addEventListener("input", update);
    update(); // initialize
  }
  
  ["das", "arr", "sdf"].forEach(updateHandling);
  
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
      const key = e.key.toUpperCase();

      if (!customControls[action]) {
        customControls[action] = {};
      }

      customControls[action][slot] = key;
      element.innerText = key;

      document.removeEventListener('keydown', keyHandler);
    }

    document.addEventListener('keydown', keyHandler);
  }

function loadPreset(preset) {
  const defaultTable = document.getElementById("default-controls");
  const customTable = document.getElementById("custom-controls");

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
    customTable.style.display = "table";

    document.querySelectorAll('#custom-controls .custom-key').forEach(el => {
      el.innerText = '[NOT SET]';
    });

    for (const key in customControls) delete customControls[key];
  } 
  else if (preset === 'guideline') {
    defaultTable.style.display = "table";
    customTable.style.display = "none";

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
window.addEventListener('DOMContentLoaded', () => {
  loadPreset('guideline');
});

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

document.addEventListener('DOMContentLoaded', () => {
  const selectedBG = backgrounds[Math.floor(Math.random() * backgrounds.length)];
  document.body.style.backgroundImage = `url('Wallpaper/${selectedBG}')`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundRepeat = 'no-repeat';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
});


    
  