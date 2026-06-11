import { Router } from "express";
import { db, messagesTable, usersTable } from "@workspace/db";
import { eq, or, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/messages", async (req, res) => {
  try {
    const { projectId, recipientId } = req.query as { projectId?: string; recipientId?: string };
    let rows = await db.select().from(messagesTable).orderBy(sql`${messagesTable.createdAt} ASC`).limit(100);
    if (projectId) rows = rows.filter((r) => r.projectId === parseInt(projectId));
    const enriched = await Promise.all(
      rows.map(async (row) => {
        const [u] = await db.select({ name: usersTable.name, avatarUrl: usersTable.avatarUrl }).from(usersTable).where(eq(usersTable.id, row.senderId)).limit(1);
        return { ...row, senderName: u?.name ?? "Unknown", senderAvatarUrl: u?.avatarUrl ?? null, createdAt: row.createdAt.toISOString() };
      })
    );
    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Get messages error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages", async (req, res) => {
  try {
    const senderId = 1;
    const [row] = await db.insert(messagesTable).values({ ...req.body, senderId }).returning();
    const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, senderId)).limit(1);
    return res.status(201).json({ ...row, senderName: u?.name ?? "Unknown", senderAvatarUrl: null, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Send message error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
