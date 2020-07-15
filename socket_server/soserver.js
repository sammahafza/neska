const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 25000;

// users details - email, first name, last name, socket
let users = [];


io.on('connection', socket => {
  console.log('someone connected...');
  socket.emit('detailReq');

  socket.on('detailRes', (detail) => {
    console.log("detail retrived..");
    users.push(detail);

    const person = users.find(user => user.id === socket.id); // the person of the socket

    socket.emit("join room", users.filter(user => user.room == person.room)); // joining person
    socket.broadcast.emit("newEntry", person); // old people who is siting in the room
  });


  socket.on("offer", payload => {
    io.to(payload.target).emit("offer", payload);
  });

  socket.on("answer", payload => {
    io.to(payload.target).emit("answer", payload);
  });

  socket.on("ice-candidate", incoming => {
    io.to(incoming.target).emit("ice-candidate", incoming);
  });




  socket.on('disconnect', () => {
    person = users.find(user => user.id === socket.id);
    users = users.filter(user => user.id != socket.id);
    socket.broadcast.emit("update-list", users.filter(user => user.room === person.room));
  });

});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));

