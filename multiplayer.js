
const socket = io();
const nicknameInput = document.getElementById("nickname");
const roomInput = document.getElementById("roomInput");
const log = document.getElementById("log");

document.getElementById("createBtn").onclick = () => {
  const nickname = nicknameInput.value.trim();
  const roomID = roomInput.value.trim();
  if (nickname && roomID) {
    socket.emit("createRoom", {
      roomID,
      nickname,
      settings: { mode: "FRENZY", ghostPiece: true, holdEnabled: true }
    });
  }
};

document.getElementById("joinBtn").onclick = () => {
  const nickname = nicknameInput.value.trim();
  const roomID = roomInput.value.trim();
  if (nickname && roomID) {
    socket.emit("joinRoom", { roomID, nickname });
  }
};

socket.on("roomCreated", ({ roomID }) => {
  log.textContent += `Room ${roomID} created. Waiting for player...\n`;
});
socket.on("roomUpdated", ({ players }) => {
  log.textContent += `Players: ${players.join(", ")}\n`;
});
socket.on("startGame", () => {
  log.textContent += "Game started!\n";
});
socket.on("roomFull", () => {
  log.textContent += "Room is full!\n";
});
socket.on("errorRoomExists", () => {
  log.textContent += "Room already exists!\n";
});
socket.on("errorRoomNotFound", () => {
  log.textContent += "Room not found!\n";
});
