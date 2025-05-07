function updateVolumeValue(id) {
    const el = document.getElementById(id);
    const volume = el.value;
  
    // Audio target berdasarkan ID slider
    let audioId = "";
    if (id === "musicVolume") {
      audioId = "mainTheme";
    } else if (id === "fxVolume") {
      audioId = "buttonSound";
    }
  
    const audio = document.getElementById(audioId);
    if (audio) {
      audio.volume = volume / 100;
    }
  
    // Update teks persen di label
    const label = document.getElementById(id + "Value");
    if (label) {
      label.textContent = `${volume}%`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // Main Theme Volume awal (10%)
    const mainTheme = document.getElementById("mainTheme");
    if (mainTheme) {
      mainTheme.volume = 0.1;
      const musicSlider = document.getElementById("musicVolume");
      const musicLabel = document.getElementById("musicVolumeValue");
      if (musicSlider) {
        musicSlider.value = 10;
        if (musicLabel) musicLabel.textContent = "10%";
      }
    }
  
    // Button Sound Volume awal (50%)
    const buttonSound = document.getElementById("buttonSound");
    if (buttonSound) {
      buttonSound.volume = 0.5;
      const fxSlider = document.getElementById("fxVolume");
      const fxLabel = document.getElementById("fxVolumeValue");
      if (fxSlider) {
        fxSlider.value = 50;
        if (fxLabel) fxLabel.textContent = "50%";
      }
    }
  });
  
  
  

  const das = document.getElementById("das");
  const arr = document.getElementById("arr");
  const sdf = document.getElementById("sdf");

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
  
  
