const socketIO = require('socket.io');
const logger = require('../utils/logger');

const initializeSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });

    // Add your socket event handlers here
    socket.on('message', (data) => {
      io.emit('message', data);
    });
  });

  return io;
};

module.exports = initializeSocket;