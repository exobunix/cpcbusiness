import { Router } from "express";
import { db, leadsTable, usersTable, activityTable } from "@workspace/db";
import { eq, ilike, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/leads", async (req, res) => {
  try {
    const { stage, search } = req.query as { stage?: string; search?: string };
    let rows = await db.select().from(leadsTable).orderBy(sql`${leadsTable.createdAt} DESC`);
    if (stage) rows = rows.filter((r) => r.stage === stage);
    if (search) rows = rows.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase()));

    const enriched = await Promise.all(
      rows.map(async (row) => {
        let assigneeName: string | null = null;
        if (row.assignedTo) {
          const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, row.assignedTo)).limit(1);
          assigneeName = u?.name ?? null;
        }
        return { ...row, value: row.value ? Number(row.value) : null, assigneeName, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
      })
    );
    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Get leads error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/leads", async (req, res) => {
  try {
    const [row] = await db.insert(leadsTable).values(req.body).returning();
    await db.insert(activityTable).values({ type: "lead_created", description: `New lead: ${row.name}` });
    return res.status(201).json({ ...row, value: row.value ? Number(row.value) : null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Create lead error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/leads/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(leadsTable).where(eq(leadsTable.id, parseInt(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, value: row.value ? Number(row.value) : null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Get lead error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/leads/:id", async (req, res) => {
  try {
    const [row] = await db.update(leadsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(leadsTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, value: row.value ? Number(row.value) : null, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Update lead error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/leads/:id", async (req, res) => {
  try {
    await db.delete(leadsTable).where(eq(leadsTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete lead error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
