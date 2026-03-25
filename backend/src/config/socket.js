import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (process.env.CORS_ORIGIN || 'http://localhost:5173')
        .split(',')
        .map((origin) => origin.trim()),
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Socket authentication failed.'));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id).select('-password');

      if (!user) {
        return next(new Error('Socket authentication failed.'));
      }

      socket.user = user;
      return next();
    } catch (_error) {
      return next(new Error('Socket authentication failed.'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`role:${socket.user.role}`);

    socket.on('disconnect', () => {
      socket.leave(`role:${socket.user.role}`);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized.');
  }

  return io;
};
