// utils/socket.js
import { io } from "socket.io-client";

let socket = null;

export const getSocket = (token) => {
  if (!socket) {
    socket = io("http://your-backend-url/chat", {
      extraHeaders: {
        auth: token,
      },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
