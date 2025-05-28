 const nickname = localStorage.getItem('nickname') || 'GUEST';
    document.querySelectorAll('#nicknameTag').forEach(el => el.textContent = nickname);
    
    // Daftar nickname acak (harus cocok dengan yang ada di index.html)
    const coolNicknames = [
      "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
      "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
      "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
      "SkuyMain", "KambingNgeLag", "BudeTetris", "UjangGaming", "KlikAjaDulu"
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
    const selected = block.closest('.mode-block').dataset.mode;

    if (selected === 'multiplayer') {
      // Tampilkan multiplayer screen
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('multiScreen').style.display = 'block';

    } else if (selected === 'multi') {
      // Tampilkan CREATE ROOM screen dari tombol mode-mt
      document.getElementById('multiScreen').style.display = 'none';
      document.getElementById('createScreen').style.display = 'block';

    } else if (selected === 'solo') {
      localStorage.setItem('selectedGameMode', 'solo');
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('soloScreen').style.display = 'block';

    } else if (selected === 'settings') {
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('SettingScreen').style.display = 'block';

    } else if (selected === 'leaderboard') {
      localStorage.setItem('selectedGameMode', 'leaderboard');
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('LeaderboardScreen').style.display = 'block';

    } else if (selected === 'about') {
      localStorage.setItem('selectedGameMode', 'about');
      document.getElementById('modeScreen').style.display = 'none';
      document.getElementById('aboutScreen').style.display = 'block';
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
            if (soloMode === '40L') {
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
      
        document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const roomParam = urlParams.get("room");

  if (roomParam) {
    // Buka langsung Create Room Screen
    document.getElementById("modeScreen").style.display = "none";
    document.getElementById("multiScreen").style.display = "none";
    document.getElementById("createScreen").style.display = "block";

    // Tampilkan Room ID yang di-parse dari URL
    const roomIdDisplay = document.getElementById("roomIdDisplay");
    roomIdDisplay.textContent = roomParam;
  }
});

    document.getElementById("testHandling")?.addEventListener("click", () => {
  window.location.href = "testhandling.html";
});

    
      document.addEventListener('DOMContentLoaded', () => {
        // Tombol kembali ke halaman utama
        const backButton = document.getElementById('backButton');
        if (backButton) {
          backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
          });
        }
        // Tombol kembali dari multiScreen ke modeScreen
         const backFromMulti = document.getElementById('backFromMulti');
        if (backFromMulti) {
          backFromMulti.addEventListener('click', () => {
            document.getElementById('multiScreen').style.display = 'none';
            document.getElementById('modeScreen').style.display = 'block';
          });
        }

        // Tombol keluar dari create room
        const backFromCreate = document.getElementById('backFromCreate');
      if (backFromCreate) {
        backFromCreate.addEventListener('click', () => {
          document.getElementById('createScreen').style.display = 'none';
          document.getElementById('multiScreen').style.display = 'block';
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

async function fetchRecentScore(nickname) {
  if (!window.supabase) return console.warn("❌ Supabase belum siap");

  const scoreMap = {
    "FRENZY": { field: "level", elementId: "recent-FRENZY", label: "Level" },
  };

  for (const mode in scoreMap) {
    const { field, elementId, label } = scoreMap[mode];
    const { data, error } = await window.supabase
      .from("leaderboard_v2")
      .select(field)
      .eq("nickname", nickname)
      .eq("mode", mode)
      .order(field, { ascending: false })
      .limit(1);

    const val = data?.[0]?.[field];
    const el = document.getElementById(elementId);
    const labelEl = el.querySelector(".stat-label");
const valueEl = el.querySelector(".stat-value");

if (labelEl) labelEl.textContent = label;
if (valueEl) valueEl.textContent = val != null ? `${val}` : "-";

  }
}

document.addEventListener("DOMContentLoaded", () => {
  const nickname = localStorage.getItem("nickname") || "Player";
  const coolNicknames = [
    "TetehTetris", "BlokGagal", "SalahNgetik", "SiLemot", "CieNoob",
    "FrostByte", "SiPanik", "GaPernahMenang", "BlokManaBlok", "CipungTetris",
    "MainSendiri", "ComboNgaco", "PakTetris", "MalesMain", "GaAdaSkill",
    "SkuyMain", "KambingNgeLag", "BudeTetris", "UjangGaming", "KlikAjaDulu"
  ];
  const isAnon = coolNicknames.includes(nickname);

  // TUNGGU SUPABASE SIAP DENGAN POLLING
  if (!isAnon) {
    const interval = setInterval(() => {
      if (window.supabase) {
        clearInterval(interval);
        fetchRecentScore(nickname);
      }
    }, 100); // Cek tiap 100ms
  }
});
