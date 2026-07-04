import { io, type Socket } from "socket.io-client";
import { getAccessToken } from "./api";

const SOCKET_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/api").replace(/\/api\/?$/, "");

let socket: Socket | null = null;

// Lazily creates a single shared Socket.IO connection, authenticated with the current
// access token. Safe to call repeatedly — reuses the existing connection if still open.
export function getSocket(): Socket {
  if (socket && socket.connected) return socket;

  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token: getAccessToken() },
      autoConnect: false,
    });
  }

  socket.auth = { token: getAccessToken() };
  socket.connect();
  return socket;
}
