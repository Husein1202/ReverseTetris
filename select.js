
    
    const nickname = localStorage.getItem('nickname') || 'GUEST';
document.querySelectorAll('#nicknameTag').forEach(el => el.textContent = nickname);

// Daftar nickname acak (harus cocok dengan yang ada di index.html)
const coolNicknames = [
  "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
  "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
  "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
  "SkuyMain", "KambingNgeLag", "HoloFury", "UjangGaming", "KlikAjaDulu"
];

// Cek apakah nickname adalah salah satu dari coolNicknames
const isRandom = coolNicknames.includes(nickname);

// Tampilkan .anon-label hanya jika nama adalah hasil random
document.querySelectorAll('.anon-label').forEach(label => {
  label.style.display = isRandom ? 'block' : 'none';
});

    

    // Mode navigation
    document.querySelectorAll('.mode-block').forEach(block => {
  block.addEventListener('click', () => {
    const selected = block.closest('.mode-block').dataset.mode; // Get the mode from the data-mode attribute

    if (selected === 'multiplayer') {
      // Show the multiplayer popup
      const popup = document.getElementById('popupLier');
      if (popup) {
        popup.classList.remove('hidden');  // Make the multiplayer popup visible
      }
    } else if (selected === 'solo') {
      // Handle solo mode
      localStorage.setItem('selectedGameMode', 'solo');
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('soloScreen').style.display = 'block';
    } else if (selected === 'settings') {
      // Show settings screen
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('SettingScreen').style.display = 'block';
    } else if (selected === 'leaderboard') {
      // Handle leaderboard mode
      localStorage.setItem('selectedGameMode', 'leaderboard');
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('LeaderboardScreen').style.display = 'block';
    } else if (selected === 'about') {
       // Handle about mode
      localStorage.setItem('selectedGameMode', 'about');
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('aboutScreen').style.display = 'block';
    }


    // Handle closing the multiplayer popup
    const closeBtn = document.getElementById('closePopup');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        const popup = document.getElementById('popupLier');
        if (popup) {
          popup.classList.add('hidden');  // Hide the multiplayer popup
        }
      });
    }
  });
});

    document.querySelector('.mode-lead').addEventListener('click', () => {
  window.location.href = 'ldboard.html';
});


    // Solo mode selection
    document.querySelectorAll('.solo-mode-option').forEach(option => {
      const soloMode = option.dataset.solo;
      option.addEventListener('click', () => {
        localStorage.setItem('selectedSoloMode', soloMode);
        localStorage.setItem('selectedGameMode', 'solo');
        if (soloMode === '40line') {
          window.location.href = 'game.html';
        } else if (soloMode === 'Frenzy') {
          window.location.href = 'Frenzy.html';
        } else {
          window.location.href = 'medi.html';
        }
      });
    });

    // Music autoplay support
    window.addEventListener('DOMContentLoaded', () => {
      const mainTheme = document.getElementById('mainTheme');
      if (mainTheme) {
        mainTheme.play().catch(() => {
          document.addEventListener('click', () => {
            mainTheme.play().catch(() => {});
          }, { once: true });
        });
      }
    });
  


  document.addEventListener('DOMContentLoaded', () => {
    // Tombol kembali ke halaman utama
    const backButton = document.getElementById('backButton');
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
      });
    }

    // Tombol kembali dari soloScreen ke modeScreen
    const backToMode = document.getElementById('backToMode');
    if (backToMode) {
      backToMode.addEventListener('click', () => {
        document.getElementById('soloScreen').style.display = 'none';
        document.getElementById('modeScreen').style.display = 'block';
      });
    }

    // Tombol kembali dari settingScreen ke modeScreen
    const closeSettings = document.getElementById('close-settings');
    if (closeSettings) {
      closeSettings.addEventListener('click', () => {
        document.getElementById('SettingScreen').style.display = 'none';
        document.getElementById('modeScreen').style.display = 'block';
      });
    }

    // Tombol kembali dari aboutScreen ke modeScreen
    const backFromabt = document.getElementById('backFromabt');
      if (backFromabt) {
        backFromabt.addEventListener('click', () => {
      document.getElementById('aboutScreen').style.display = 'none';
      document.getElementById('modeScreen').style.display = 'block';
  });
}

  });



  const buttonSound = document.getElementById("buttonSound");

  function playButtonSound() {
    if (buttonSound) {
      buttonSound.currentTime = 0;
      buttonSound.play().catch(() => {});
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const clickableSelectors = ["button", ".solo-mode-option", ".mode-block", ".nav-tile"];

    clickableSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(el => {
        el.addEventListener("mouseenter", playButtonSound);
        el.addEventListener("click", playButtonSound);
      });
    });
  });
  document.getElementById('mode-sett')?.addEventListener('click', function() {
    document.getElementById('SettingScreen').style.display = 'block';
});


  document.getElementById("close-settings")?.addEventListener("click", () => {
    document.getElementById("SettingScreen").style.display = "none";
  });
