import { Server } from "socket.io";

let ioInstance: Server | null = null;

export function setIo(instance: Server) {
  ioInstance = instance;
}

export function io(): Server {
  if (!ioInstance) throw new Error("Socket.IO not initialized");
  return ioInstance;
}
