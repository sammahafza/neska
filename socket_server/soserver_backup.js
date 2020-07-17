const express = require('express');
const https = require('https');
const socketio = require('socket.io');

const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cer')
};





const app = express();
const server = https.createServer(options, app);
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

    const person = users.find(user => user.id === socket.id);
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
    const person = users.find(user => user.id === socket.id);
    users = users.filter(user => user.id != socket.id);
    socket.broadcast.emit("update-list", users.filter(user => user.room === person.room));
  });

});

//app.listen(PORT, '0.0.0.0', () => console.log('server is running on port 25000'));
server.listen(PORT, "0.0.0.0");

