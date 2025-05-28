const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
app.use(express.static("public"));

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const PORT = process.env.PORT || 3000; // ⬅️ WAJIB gunakan ini

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("🟢 Reverse Tetris multiplayer server is running.");
});
