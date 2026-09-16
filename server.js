// server.js (npm install express socket.io cors)
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let queue = [];

io.on('connection', (socket) => {
  console.log('O\'yinchi ulandi:', socket.id);

  socket.on('join_game', () => {
    queue.push(socket);

    if (queue.length >= 2) {
      const p1 = queue.shift();
      const p2 = queue.shift();
      const roomId = `room_${p1.id}_${p2.id}`;

      p1.join(roomId);
      p2.join(roomId);

      p1.emit('game_start', { color: 'blue', roomId });
      p2.emit('game_start', { color: 'red', roomId });
    }
  });

  socket.on('make_move', (data) => {
    // data: { roomId, type: 'move'|'wall', payload: ... }
    socket.to(data.roomId).emit('opponent_move', data);
  });

  socket.on('disconnect', () => {
    queue = queue.filter(s => s.id !== socket.id);
  });
});

server.listen(3000, () => console.log('Server 3000-portda ishlayapti...'));
