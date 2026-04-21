import { io } from 'socket.io-client';
import { getApiBaseUrl } from '../api/client.js';

let socket;

export const connectSocket = (token) => {
  if (!token) {
    return null;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(import.meta.env.VITE_SOCKET_URL || getApiBaseUrl(), {
    autoConnect: true,
    transports: ['websocket'],
    auth: {
      token
    }
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
