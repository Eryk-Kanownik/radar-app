//server setup
const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);

//socket setup
const { Server } = require("socket.io");
const io = new Server(server);

const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile("index.html");
});

var users = [];

io.on("connection", (socket) => {
  socket.emit("data", { users, socketId: socket.id });

  socket.on("registration", (user) => {
    user.socketId = socket.id;
    users.push(user);
    socket.emit("users", users);
  });
  /*
  socket.on("move", ({ latitude, longitude }) => {
    users[users.map((user) => user.socketId).indexOf(socket.id)] = {
      ...users[users.map((user) => user.socketId).indexOf(socket.id)],
      latitude,
      longitude,
    };
    socket.emit("users", users);
  });
*/

  socket.on("disconnect", () => {
    users = users.filter((user) => user.socketId !== socket.socketId);
  });
});

server.listen(5000, () => "Server runs on http://localhost:5000");
