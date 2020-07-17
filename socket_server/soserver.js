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
  // socket.emit('detailReq');

  // socket.on('detailRes', (detail) => {
  //   console.log("detail retrived..");
  //   users.push(detail);

  // });

  socket.on('join room', (detail) => {
    if(detail.id !== null) {
      users.push(detail);
      console.log(users);
      console.log('he joined the room');
      const person = users.find(user => user.id === socket.id);
      if(person) { 
      usersInThisRoom = users.filter(user => user.room == person.room && user.id !== socket.id);
      if(usersInThisRoom.length <= 3) {
          socket.emit("all users", usersInThisRoom);
      }
      else {
          socket.emit("room full");
      }
      }
    }
    

  });
    //const person = users.find(user => user.id === socket.id);
    //socket.emit("join room", users.filter(user => user.room == person.room)); // joining person
    //socket.broadcast.emit("newEntry", person); // old people who is siting in the room


  socket.on("sending signal", payload => {
    console.log("i'm sending signal");
    io.to(payload.userToSignal).emit("user joined", {signal: payload.signal, callerID: payload.callerID});
  });

  socket.on("returning signal", payload => {
    console.log("i'm returning signal");
    io.to(payload.callerID).emit("recieved returning signal", {signal: payload.signal, id: socket.id});
  });

 
  socket.on('disconnect', () => {
    users = users.filter(user => user.id != socket.id);
    socket.broadcast.emit("someone left", socket.id);
  });

});

//app.listen(PORT, '0.0.0.0', () => console.log('server is running on port 25000'));
server.listen(PORT, "0.0.0.0");

