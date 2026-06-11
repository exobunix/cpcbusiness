import { Router } from "express";
import { db, ticketsTable, clientsTable, usersTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/tickets", async (req, res) => {
  try {
    const { status, priority, clientId } = req.query as { status?: string; priority?: string; clientId?: string };
    let rows = await db.select().from(ticketsTable).orderBy(sql`${ticketsTable.createdAt} DESC`);
    if (status) rows = rows.filter((r) => r.status === status);
    if (priority) rows = rows.filter((r) => r.priority === priority);
    if (clientId) rows = rows.filter((r) => r.clientId === parseInt(clientId));
    const enriched = await Promise.all(
      rows.map(async (row) => {
        let clientName: string | null = null;
        let assigneeName: string | null = null;
        if (row.clientId) {
          const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, row.clientId)).limit(1);
          clientName = c?.name ?? null;
        }
        if (row.assigneeId) {
          const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, row.assigneeId)).limit(1);
          assigneeName = u?.name ?? null;
        }
        return { ...row, clientName, assigneeName, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
      })
    );
    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Get tickets error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const [row] = await db.insert(ticketsTable).values(req.body).returning();
    await db.insert(activityTable).values({ type: "ticket_created", description: `Ticket: ${row.subject}` });
    return res.status(201).json({ ...row, clientName: null, assigneeName: null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Create ticket error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/tickets/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(ticketsTable).where(eq(ticketsTable.id, parseInt(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, clientName: null, assigneeName: null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Get ticket error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tickets/:id", async (req, res) => {
  try {
    const [row] = await db.update(ticketsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(ticketsTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, clientName: null, assigneeName: null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Update ticket error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
