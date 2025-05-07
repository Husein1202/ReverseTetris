// Helper function to apply settings from localStorage
function applyStoredSettings() {
  // Apply volume settings
  const musicVolume = localStorage.getItem('musicVolume');
  if (musicVolume !== null) {
    document.getElementById('musicVolume').value = musicVolume;
    updateVolumeValue('musicVolume'); // Update the volume immediately
  }

  const fxVolume = localStorage.getItem('fxVolume');
  if (fxVolume !== null) {
    document.getElementById('fxVolume').value = fxVolume;
    updateVolumeValue('fxVolume'); // Update the volume immediately
  }

  // Apply handling settings
  const das = localStorage.getItem('das');
  if (das !== null) {
    document.getElementById('das').value = das;
    updateHandling('das');
  }

  const arr = localStorage.getItem('arr');
  if (arr !== null) {
    document.getElementById('arr').value = arr;
    updateHandling('arr');
  }

  const sdf = localStorage.getItem('sdf');
  if (sdf !== null) {
    document.getElementById('sdf').value = sdf;
    updateHandling('sdf');
  }
}

// Volume update function
function updateVolumeValue(id) {
  const el = document.getElementById(id);
  const volume = el.value;

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

  const label = document.getElementById(id + "Value");
  if (label) {
    label.textContent = `${volume}%`;
  }

  // Save volume to localStorage
  localStorage.setItem(id, volume);
}

// Handling update function
function updateHandling(id) {
  const el = document.getElementById(id);
  const label = document.getElementById(id + '-value');
  label.textContent = `${el.value}MS`;

  // Save handling settings to localStorage
  localStorage.setItem(id, el.value);
}

document.addEventListener('DOMContentLoaded', () => {
  // Apply the stored settings when the page loads
  applyStoredSettings();

  // Event listeners for handling sliders
  document.getElementById("das").addEventListener("input", () => updateHandling('das'));
  document.getElementById("arr").addEventListener("input", () => updateHandling('arr'));
  document.getElementById("sdf").addEventListener("input", () => updateHandling('sdf'));

  // Event listeners for volume sliders
  document.getElementById("musicVolume").addEventListener("input", () => updateVolumeValue('musicVolume'));
  document.getElementById("fxVolume").addEventListener("input", () => updateVolumeValue('fxVolume'));
});
