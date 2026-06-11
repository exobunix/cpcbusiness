import { Router } from "express";
import { db, tasksTable, projectsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/tasks", async (req, res) => {
  try {
    const { projectId, assigneeId, status } = req.query as { projectId?: string; assigneeId?: string; status?: string };
    let rows = await db.select().from(tasksTable).orderBy(sql`${tasksTable.createdAt} DESC`);
    if (projectId) rows = rows.filter((r) => r.projectId === parseInt(projectId));
    if (assigneeId) rows = rows.filter((r) => r.assigneeId === parseInt(assigneeId));
    if (status) rows = rows.filter((r) => r.status === status);

    const enriched = await Promise.all(
      rows.map(async (row) => {
        let projectName: string | null = null;
        let assigneeName: string | null = null;
        if (row.projectId) {
          const [p] = await db.select({ name: projectsTable.name }).from(projectsTable).where(eq(projectsTable.id, row.projectId)).limit(1);
          projectName = p?.name ?? null;
        }
        if (row.assigneeId) {
          const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, row.assigneeId)).limit(1);
          assigneeName = u?.name ?? null;
        }
        return { ...row, projectName, assigneeName, createdAt: row.createdAt.toISOString() };
      })
    );
    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Get tasks error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tasks", async (req, res) => {
  try {
    const [row] = await db.insert(tasksTable).values(req.body).returning();
    return res.status(201).json({ ...row, projectName: null, assigneeName: null, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Create task error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tasks/:id", async (req, res) => {
  try {
    const [row] = await db.update(tasksTable).set({ ...req.body, updatedAt: new Date() }).where(eq(tasksTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json({ ...row, projectName: null, assigneeName: null, createdAt: row.createdAt.toISOString() });
  } catch (err) {
    logger.error({ err }, "Update task error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tasks/:id", async (req, res) => {
  try {
    await db.delete(tasksTable).where(eq(tasksTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete task error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
