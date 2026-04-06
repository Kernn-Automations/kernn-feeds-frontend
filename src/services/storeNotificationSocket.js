import { io } from "socket.io-client";
import authService from "./authService";

const resolveSocketBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;

  if (!configured || configured === "/api") {
    return window.location.origin;
  }

  return configured.replace(/\/api\/?$/, "");
};

export const connectStoreNotificationSocket = ({ storeIds = [], onNotification }) => {
  const { accessToken } = authService.getTokens();

  if (!accessToken) return null;

  const socket = io(`${resolveSocketBaseUrl()}/store-notifications`, {
    transports: ["websocket"],
    auth: { token: accessToken },
  });

  socket.on("connect", () => {
    socket.emit("subscribe_store_notifications", storeIds);
  });

  if (typeof onNotification === "function") {
    socket.on("store_notification", onNotification);
  }

  return socket;
};

