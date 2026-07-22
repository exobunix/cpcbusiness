import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (typeof window !== "undefined" ? window.location.origin : "http://localhost:5000");

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.IO] Connected to live server:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("[Socket.IO] Disconnected from live server");
    });
  }

  return socket;
}
