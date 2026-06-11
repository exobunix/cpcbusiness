import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/notifications", async (_req, res) => {
  try {
    const rows = await db.select().from(notificationsTable).orderBy(sql`${notificationsTable.createdAt} DESC`).limit(50);
    return res.json(rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "Get notifications error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/:id/read", async (req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true }).where(eq(notificationsTable.id, parseInt(req.params.id)));
    return res.json({ message: "Marked as read" });
  } catch (err) {
    logger.error({ err }, "Mark notification read error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/notifications/read-all", async (_req, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true });
    return res.json({ message: "All marked as read" });
  } catch (err) {
    logger.error({ err }, "Mark all read error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
