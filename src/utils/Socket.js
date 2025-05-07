// utils/socket.js
import { io } from "socket.io-client";

let socket = null;

const VITE_API = import.meta.env.VITE_API_URL;

export const getSocket = () => {
  const token = localStorage.getItem("access_token");
  if (!socket) {
    socket = io(`${VITE_API}/chat`, {
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
