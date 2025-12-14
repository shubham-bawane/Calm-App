const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;
const rooms = {};

app.use(express.static(path.join(__dirname, 'public')));

const generateRoomId = () => Math.random().toString(16).slice(2, 8);

io.on('connection', (socket) => {
  socket.on('create-room', (callback) => {
    const roomId = generateRoomId();
    rooms[roomId] = { videoId: null, currentTime: 0, isPlaying: false };
    socket.join(roomId);
    callback({ roomId, state: rooms[roomId] });
  });

  socket.on('join-room', ({ roomId }, callback) => {
    if (!roomId || !rooms[roomId]) {
      callback({ error: 'Room not found' });
      return;
    }
    socket.join(roomId);
    callback({ roomId, state: rooms[roomId] });
  });

  socket.on('set-video', ({ roomId, videoId }) => {
    if (!roomId || !rooms[roomId] || !videoId) return;
    rooms[roomId] = { videoId, currentTime: 0, isPlaying: false };
    io.to(roomId).emit('load-video', { videoId, currentTime: 0 });
  });

  socket.on('player-action', ({ roomId, action, currentTime = 0 }) => {
    const room = rooms[roomId];
    if (!room || !['play', 'pause', 'seek', 'skip'].includes(action)) return;

    if (action === 'skip') {
      rooms[roomId] = { videoId: null, currentTime: 0, isPlaying: false };
      io.to(roomId).emit('sync', { action: 'skip', currentTime: 0 });
      return;
    }

    if (typeof currentTime !== 'number') return;

    if (action === 'play') {
      room.isPlaying = true;
      room.currentTime = currentTime;
    }
    if (action === 'pause') {
      room.isPlaying = false;
      room.currentTime = currentTime;
    }
    if (action === 'seek') {
      room.currentTime = currentTime;
    }

    socket.to(roomId).emit('sync', { action, currentTime });
  });
});

server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
