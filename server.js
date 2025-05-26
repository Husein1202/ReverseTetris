
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};

io.on("connection", (socket) => {
  console.log("🔌", socket.id, "connected");

  socket.on("createRoom", ({ roomID, nickname, settings }) => {
    if (rooms[roomID]) return socket.emit("errorRoomExists");

    rooms[roomID] = {
      host: socket.id,
      players: [socket.id],
      nicknames: { [socket.id]: nickname },
      status: "waiting",
      settings
    };

    socket.join(roomID);
    socket.emit("roomCreated", { roomID });
  });

  socket.on("joinRoom", ({ roomID, nickname }) => {
    const room = rooms[roomID];
    if (!room) return socket.emit("errorRoomNotFound");
    if (room.players.length >= 2) return socket.emit("roomFull");

    room.players.push(socket.id);
    room.nicknames[socket.id] = nickname;
    socket.join(roomID);

    io.to(roomID).emit("roomUpdated", {
      players: room.players.map(id => room.nicknames[id]),
      settings: room.settings
    });

    if (room.players.length === 2) {
      room.status = "in-game";
      io.to(roomID).emit("startGame");
    }
  });

  socket.on("syncArena", ({ roomID, data }) => {
    socket.to(roomID).emit("updateArena", data);
  });

  socket.on("disconnect", () => {
    for (const roomID in rooms) {
      const room = rooms[roomID];
      if (room.players.includes(socket.id)) {
        room.players = room.players.filter(id => id !== socket.id);
        delete room.nicknames[socket.id];

        if (room.players.length === 0) {
          delete rooms[roomID];
        } else {
          io.to(roomID).emit("playerLeft", socket.id);
        }
      }
    }
  });
});

server.listen(3000, () => console.log("🚀 Server running at http://localhost:3000"));
