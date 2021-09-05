/* eslint-disable max-len */
import {Server} from 'socket.io';
import KServer from './Library/server';

const server = new KServer();

const io: Server = server.io;
const expressAPI = server.app;

expressAPI.get('/giveTarget', (req, res) => {
  res.json({error: false, msg: 'Sargent Dark'});
});

let i = 0;
const roomId: string = 'lobby';
io.on('connection', (socket) => {
  console.log('Client Count: ' + ++i);
  socket.join(roomId);

  socket.on('offer', (offer) => {
    socket.broadcast.to(roomId).emit('message', {offer});
  });

  socket.on('answer', (answer) => {
    socket.broadcast.to(roomId).emit('message', {answer});
  });

  socket.on('new-ice-candidate', (iceCandidate) => {
    socket.broadcast.to(roomId).emit('message', {iceCandidate});
  });

  socket.on('disconnect', () => {
    console.log('Client Count: ' + --i);
  });
});
