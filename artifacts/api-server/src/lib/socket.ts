import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { logger } from "./logger";
import { MongoMessage, MongoNotification, memoryStore } from "./store";

let io: SocketIOServer | null = null;

export function initSocketIO(server: HTTPServer) {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "Client connected to Socket.IO live chat");

    socket.on("join_room", (room: string) => {
      socket.join(room);
      logger.info({ socketId: socket.id, room }, "Socket joined room");
    });

    socket.on("send_message", async (data: {
      senderId?: number;
      senderName?: string;
      senderRole?: string;
      recipientId?: number;
      projectId?: number;
      content: string;
    }) => {
      try {
        const newMessage = {
          id: Date.now(),
          senderId: data.senderId || 1,
          senderName: data.senderName || "User",
          senderRole: data.senderRole || "client",
          recipientId: data.recipientId || (data.senderRole === "client" ? 1 : 2),
          projectId: data.projectId || null,
          content: data.content,
          createdAt: new Date().toISOString(),
        };

        // Save to MongoDB
        try {
          await MongoMessage.create(newMessage);
        } catch (e) {
          logger.warn({ err: e }, "MongoDB socket message save error");
        }

        // Save to memoryStore
        memoryStore.messages.push(newMessage);

        // Broadcast to all connected clients & rooms
        io?.emit("new_message", newMessage);

        // Create Admin Notification if client sent message
        if (data.senderRole !== "admin") {
          const notif = {
            id: Date.now() + 1,
            userId: 1,
            title: "New Live Message",
            message: `${newMessage.senderName}: "${newMessage.content.slice(0, 50)}${newMessage.content.length > 50 ? "..." : ""}"`,
            type: "message",
            isRead: false,
            createdAt: new Date().toISOString(),
          };
          try {
            await MongoNotification.create(notif);
          } catch (e) {}
          memoryStore.notifications.unshift(notif);
          io?.emit("new_notification", notif);
        }
      } catch (err) {
        logger.error({ err }, "Error handling socket send_message");
      }
    });

    socket.on("typing", (data: { userName: string; isTyping: boolean; role: string }) => {
      socket.broadcast.emit("user_typing", data);
    });

    socket.on("disconnect", () => {
      logger.info({ socketId: socket.id }, "Client disconnected from Socket.IO");
    });
  });

  return io;
}

export function getIO(): SocketIOServer | null {
  return io;
}
