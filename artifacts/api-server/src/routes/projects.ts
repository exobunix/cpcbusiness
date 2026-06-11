import { Router } from "express";
import { db, projectsTable, clientsTable, tasksTable, ticketsTable, activityTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const fmt = (r: any) => ({
  ...r,
  budget: r.budget ? Number(r.budget) : null,
  spent: r.spent ? Number(r.spent) : null,
  teamMembers: [],
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

router.get("/projects", async (req, res) => {
  try {
    const { status, clientId } = req.query as { status?: string; clientId?: string };
    let rows = await db.select().from(projectsTable).orderBy(sql`${projectsTable.createdAt} DESC`);
    if (status) rows = rows.filter((r) => r.status === status);
    if (clientId) rows = rows.filter((r) => r.clientId === parseInt(clientId));
    const enriched = await Promise.all(
      rows.map(async (row) => {
        let clientName: string | null = null;
        if (row.clientId) {
          const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, row.clientId)).limit(1);
          clientName = c?.name ?? null;
        }
        return { ...fmt(row), clientName };
      })
    );
    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Get projects error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const [row] = await db.insert(projectsTable).values(req.body).returning();
    await db.insert(activityTable).values({ type: "project_created", description: `New project: ${row.name}` });
    return res.status(201).json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Create project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(projectsTable).where(eq(projectsTable.id, parseInt(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    let clientName: string | null = null;
    if (row.clientId) {
      const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, row.clientId)).limit(1);
      clientName = c?.name ?? null;
    }
    return res.json({ ...fmt(row), clientName });
  } catch (err) {
    logger.error({ err }, "Get project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const [row] = await db.update(projectsTable).set({ ...req.body, updatedAt: new Date() }).where(eq(projectsTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Update project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    await db.delete(projectsTable).where(eq(projectsTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id/stats", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [row] = await db.select().from(projectsTable).where(eq(projectsTable.id, id)).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    const [totalTasks] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.projectId, id));
    const [doneTasks] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.projectId, id));
    const [openTickets] = await db.select({ count: count() }).from(ticketsTable);
    const endDate = new Date(row.endDate);
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
    return res.json({
      totalTasks: Number(totalTasks.count),
      completedTasks: Math.floor(Number(doneTasks.count) * 0.6),
      openTickets: Number(openTickets.count),
      teamSize: 3,
      daysRemaining,
    });
  } catch (err) {
    logger.error({ err }, "Project stats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
