import { Router } from "express";
import { db, clientsTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/clients", async (req, res) => {
  try {
    const { search } = req.query as { search?: string };
    let rows = await db.select().from(clientsTable).orderBy(sql`${clientsTable.createdAt} DESC`);
    if (search) rows = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));
    return res.json(rows.map((r) => ({ ...r, totalSpent: r.totalSpent ? Number(r.totalSpent) : null, createdAt: r.createdAt.toISOString() })));
  } catch (err) {
    logger.error({ err }, "Get clients error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const [row] = await db.insert(clientsTable).values(req.body).returning();
    await db.insert(activityTable).values({ type: "client_added", description: `New client: ${row.name}` });
    return res.status(201).json({ ...row, totalSpent: row.totalSpent ? Number(row.totalSpent) : null, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Create client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(clientsTable).where(eq(clientsTable.id, parseInt(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, totalSpent: row.totalSpent ? Number(row.totalSpent) : null, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Get client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/clients/:id", async (req, res) => {
  try {
    const [row] = await db.update(clientsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(clientsTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, totalSpent: row.totalSpent ? Number(row.totalSpent) : null, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Update client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    await db.delete(clientsTable).where(eq(clientsTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
