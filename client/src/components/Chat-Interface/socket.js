import { io } from "socket.io-client";

const socket = io("https://supreme-space-funicular-wr7vr55qgw5jfgjww-5000.app.github.dev", {
  transports: ["websocket"],
  withCredentials: true,
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

// Make sure we're exporting default
export default socket;