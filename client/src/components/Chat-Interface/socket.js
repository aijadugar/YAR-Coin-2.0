import { io } from "socket.io-client";

const socket = io("https://fictional-journey-9796755g5qgwc7gwg-5000.app.github.dev", {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Make sure we're exporting default
export default socket;