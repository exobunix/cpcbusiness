import { Router } from "express";
import { db, messagesTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { MongoMessage, MongoNotification, memoryStore } from "../lib/store";

const router = Router();

router.get("/messages", async (req, res) => {
  try {
    const { projectId, recipientId, senderId } = req.query as { projectId?: string; recipientId?: string; senderId?: string };
    
    let rows: any[] = [];

    // Check MongoDB first
    try {
      const mongoDocs = await MongoMessage.find({}).sort({ createdAt: 1 }).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB fetch messages error");
    }

    // Check memoryStore if MongoDB empty
    if (rows.length === 0) {
      rows = memoryStore.messages;
    }

    if (projectId) rows = rows.filter((r) => String(r.projectId) === String(projectId));
    if (recipientId) rows = rows.filter((r) => String(r.recipientId) === String(recipientId) || String(r.senderId) === String(recipientId));
    if (senderId) rows = rows.filter((r) => String(r.senderId) === String(senderId) || String(r.recipientId) === String(senderId));

    return res.json(rows);
  } catch (err) {
    logger.error({ err }, "Get messages error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const auth = req.headers.authorization?.replace("Bearer ", "");
    let senderId = req.body.senderId || 1;
    let senderName = req.body.senderName || "User";
    let senderRole = req.body.senderRole || "client";

    if (auth) {
      try {
        const decoded = Buffer.from(auth, "base64").toString();
        const parts = decoded.split(":");
        if (parts[0]) {
          const parsedId = parseInt(parts[0]);
          if (!isNaN(parsedId)) senderId = parsedId;
          if (parts[1]) senderName = parts[1].split("@")[0];
        }
        if (auth.includes("admin")) senderRole = "admin";
      } catch (e) {}
    }

    const newMessage = {
      id: Date.now(),
      senderId,
      senderName: req.body.senderName || senderName,
      senderRole,
      recipientId: req.body.recipientId || (senderRole === "client" ? 1 : 2),
      projectId: req.body.projectId || null,
      content: req.body.content,
      createdAt: new Date().toISOString(),
    };

    // Save to MongoDB
    try {
      await MongoMessage.create(newMessage);
    } catch (e) {
      logger.warn({ err: e }, "MongoDB save message error");
    }

    // Save to memoryStore
    memoryStore.messages.push(newMessage);

    // If client sent message, notify Admin
    if (senderRole !== "admin") {
      const notif = {
        id: Date.now() + 1,
        userId: 1,
        title: "New Client Message",
        message: `${newMessage.senderName}: "${newMessage.content.slice(0, 50)}${newMessage.content.length > 50 ? "..." : ""}"`,
        type: "message",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      try {
        await MongoNotification.create(notif);
      } catch (e) {}
      memoryStore.notifications.unshift(notif);
    }

    return res.status(201).json(newMessage);
  } catch (err) {
    logger.error({ err }, "Send message error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
