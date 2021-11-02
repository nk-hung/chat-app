const express = require("express");
const socketio = require('socket.io');
const http = require("http");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const {addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');
const router = require('./router/index'); 
const { connect } = require("./router/index");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "https://kind-dijkstra-0b96b7.netlify.app/",
    credentials: true
  }
});

app.use(cors());

io.on("connect", (socket) => {
  socket.on('join', ({name, room}, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if(error) return callback(error);

    socket.emit('message', { user: 'admin', text:`${user.name}, welcome to the room ${user.room}` });
    socket.broadcast.to(user.room).emit('message', { user: 'admin', text:`${user.name} has joined!` });

    socket.join(user.room);

    io.to(user.room).emit('roomData', { room: user.room , users: getUsersInRoom(user.room)} );

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    
    io.to(user.room).emit('message', {user: user.name, text: message });
    io.to(user.room).emit('roomData', {room: user.room, text: message });

    callback();
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', { user: 'admin', text: `${user.name} has left.`})
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port: ${PORT}`));