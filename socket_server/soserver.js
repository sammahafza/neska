const express = require('express');
const http = require('http');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = 25000;


io.on('connection', socket => {
    console.log('someone connected...');
    socket.emit('detailReq');
});

server.listen(PORT, () => console.log(`server is running on port ${PORT}`));

