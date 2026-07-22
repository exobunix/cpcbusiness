import { Router } from "express";
import { logger } from "../lib/logger";
import { MongoNotification, memoryStore } from "../lib/store";

const router = Router();

router.get("/notifications", async (_req, res) => {
  try {
    let rows: any[] = [];

    try {
      const mongoDocs = await MongoNotification.find({}).sort({ createdAt: -1 }).limit(50).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB get notifications error");
    }

    if (rows.length === 0) {
      rows = memoryStore.notifications;
    }

    return res.json(rows);
  } catch (err) {
    logger.error({ err }, "Get notifications error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const id = req.params.id;
    const notif = memoryStore.notifications.find((n) => String(n.id) === String(id));
    if (notif) notif.isRead = true;

    try {
      await MongoNotification.updateOne({ id: Number(id) }, { $set: { isRead: true } });
    } catch (e) {}

    return res.json({ message: "Marked as read" });
  } catch (err) {
    logger.error({ err }, "Mark notification read error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", async (_req, res) => {
  try {
    memoryStore.notifications.forEach((n) => { n.isRead = true; });
    try {
      await MongoNotification.updateMany({}, { $set: { isRead: true } });
    } catch (e) {}
    return res.json({ message: "All marked as read" });
  } catch (err) {
    logger.error({ err }, "Mark all read error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
