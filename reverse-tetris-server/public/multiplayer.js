const urlParams = new URLSearchParams(window.location.search);
const prefillRoom = urlParams.get("room");

const roomId = prefillRoom || `ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
roomIdDisplay.textContent = roomId;

if (prefillRoom) {
  roomIdDisplay.textContent = prefillRoom;
  roomIdDisplay.addEventListener("click", () => {
    const fullLink = `${window.location.origin}${window.location.pathname}?room=${prefillRoom}`;
    navigator.clipboard.writeText(fullLink).then(() => {
      roomIdDisplay.textContent = `${prefillRoom} (Link Copied!)`;
      roomIdDisplay.style.color = "#00ffaa";
      setTimeout(() => {
        roomIdDisplay.textContent = prefillRoom;
        roomIdDisplay.style.color = "#00d084";
      }, 1500);
    });
  });
}


document.addEventListener("DOMContentLoaded", () => {
  const nickname = localStorage.getItem("nickname") || window.coolNicknames?.[Math.floor(Math.random() * window.coolNicknames.length)] || "GUEST-XXXX";
  const isAnon = !localStorage.getItem("nickname");

  const roomTitle = document.querySelector(".roomtitle");
  const roomNameInput = document.getElementById("roomNameInput");
  const playerLimitInput = document.getElementById("playerLimitInput");
  const autoStartInput = document.getElementById("autoStartInput");
  const publicRoomToggle = document.getElementById("publicRoomToggle");
  const allowAnonToggle = document.getElementById("allowAnonToggle");
  const roomIdDisplay = document.getElementById("roomIdDisplay");
  const saveButton = document.getElementById("saveRoomSettings");

  const hostTag = document.querySelector(".tag.host");
  const anonTag = document.getElementById("hostAnonTag");

  // Tampilkan nickname dan tag
  document.getElementById("hostNickname").textContent = nickname;
  hostTag.style.display = "inline-block";
  anonTag.style.display = isAnon ? "inline-block" : "none";

  // Room ID
const generatedRoomId = prefillRoom || `ROOM-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
roomIdDisplay.textContent = generatedRoomId;
roomIdDisplay.addEventListener("click", () => {
  const fullLink = `${window.location.origin}${window.location.pathname}?room=${generatedRoomId}`;
  navigator.clipboard.writeText(fullLink).then(() => {
    roomIdDisplay.textContent = `${generatedRoomId} (Link Copied!)`;
    roomIdDisplay.style.color = "#00ffaa";
    setTimeout(() => {
      roomIdDisplay.textContent = generatedRoomId;
      roomIdDisplay.style.color = "#00d084";
    }, 1500);
  });
});

  // Auto set title dan input name
  const initialTitle = `${nickname.toUpperCase()}'S PRIVATE ROOM`;
  roomTitle.textContent = initialTitle;
  roomNameInput.value = initialTitle;

  // Limit pengaturan
  playerLimitInput.max = 2;
  playerLimitInput.addEventListener("input", () => {
    if (playerLimitInput.value > 2) playerLimitInput.value = 2;
    markSaveDirty();
  });

  autoStartInput.max = 10;
  autoStartInput.addEventListener("input", () => {
    if (autoStartInput.value > 10) autoStartInput.value = 10;
    markSaveDirty();
  });

  // Toggle switch
  publicRoomToggle.addEventListener("change", () => markSaveDirty());
  allowAnonToggle.disabled = isAnon;
  allowAnonToggle.addEventListener("change", () => markSaveDirty());

  roomNameInput.addEventListener("input", () => markSaveDirty());

  // SAVE button
  let lastSettings = getCurrentSettings();
  saveButton.disabled = true;

  document.querySelectorAll(".setting-row input").forEach(input => {
    input.addEventListener("input", () => {
      const now = getCurrentSettings();
      if (JSON.stringify(now) !== JSON.stringify(lastSettings)) {
        markSaveDirty();
      }
    });
  });

  saveButton.addEventListener("click", () => {
    lastSettings = getCurrentSettings();
    applySavedChanges();

    const name = roomNameInput.value;
    const publicState = publicRoomToggle.checked;

    if (publicState) {
      const newTitle = name.replace(/'S PRIVATE ROOM$/i, "'S ROOM");
      roomTitle.textContent = newTitle;
      roomNameInput.value = newTitle;
    } else {
      const newTitle = name.includes("PRIVATE") ? name : name.replace(/'S ROOM$/i, "'S PRIVATE ROOM");
      roomTitle.textContent = newTitle;
      roomNameInput.value = newTitle;
    }
  });

  function getCurrentSettings() {
    return {
      roomName: roomNameInput.value,
      playerLimit: playerLimitInput.value,
      autoStart: autoStartInput.value,
      publicRoom: publicRoomToggle.checked,
      allowAnon: allowAnonToggle.checked,
    };
  }

  function markSaveDirty() {
    saveButton.disabled = false;
    saveButton.classList.add("active");
  }

  function applySavedChanges() {
    saveButton.disabled = true;
    saveButton.classList.remove("active");
  }

  // Inisialisasi awal player count
  document.getElementById("playercount").textContent = "1";
  document.getElementById("playerlimit").textContent = "/2";
  // 🔌 KONEKSI SOCKET.IO KE SERVER GLITCH
const socket = io("https://alive-prism-nest.glitch.me");


socket.emit("joinRoom", {
  roomId: roomId,
  nickname: nickname
});

socket.on("updatePlayers", (players) => {
  const playerList = document.querySelector(".player-list");
  playerList.innerHTML = "";

  players.forEach((player) => {
    const div = document.createElement("div");
    div.className = "nickname";
    div.textContent = player.nickname;
    playerList.appendChild(div);
  });
});

});
