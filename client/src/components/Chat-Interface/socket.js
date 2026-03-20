import { io } from "socket.io-client";

const baseUrl = import.meta.env.VITE_BASE_URL;

const socket = io(`${baseUrl}`, {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

export default socket;