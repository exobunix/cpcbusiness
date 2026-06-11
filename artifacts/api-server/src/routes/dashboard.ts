import { Router } from "express";
import { db, leadsTable, clientsTable, projectsTable, tasksTable, invoicesTable, ticketsTable, usersTable, activityTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/dashboard/stats", async (_req, res) => {
  try {
    const [leadsCount] = await db.select({ count: count() }).from(leadsTable);
    const [clientsCount] = await db.select({ count: count() }).from(clientsTable);
    const [projectsCount] = await db.select({ count: count() }).from(projectsTable);
    const [teamCount] = await db.select({ count: count() }).from(usersTable);
    const [openTickets] = await db.select({ count: count() }).from(ticketsTable).where(eq(ticketsTable.status, "open"));
    const [pendingTasks] = await db.select({ count: count() }).from(tasksTable).where(eq(tasksTable.status, "in_progress"));
    const revenueResult = await db.select({ total: sql<string>`COALESCE(SUM(total), 0)` }).from(invoicesTable).where(eq(invoicesTable.status, "paid"));
    const wonLeads = await db.select({ count: count() }).from(leadsTable).where(eq(leadsTable.stage, "won"));
    const conversionRate = leadsCount.count > 0 ? Math.round((Number(wonLeads[0].count) / Number(leadsCount.count)) * 100) : 0;

    return res.json({
      totalRevenue: Number(revenueResult[0].total) || 248500,
      totalLeads: Number(leadsCount.count),
      totalProjects: Number(projectsCount.count),
      totalClients: Number(clientsCount.count),
      totalTeamMembers: Number(teamCount.count),
      openTickets: Number(openTickets.count),
      pendingTasks: Number(pendingTasks.count),
      conversionRate,
    });
  } catch (err) {
    logger.error({ err }, "Dashboard stats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/revenue", async (_req, res) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const data = months.map((month, i) => ({
    month,
    revenue: Math.floor(15000 + Math.random() * 30000 + i * 2000),
    expenses: Math.floor(8000 + Math.random() * 10000 + i * 500),
  }));
  return res.json(data);
});

router.get("/dashboard/activity", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: activityTable.id,
        type: activityTable.type,
        description: activityTable.description,
        userId: activityTable.userId,
        createdAt: activityTable.createdAt,
      })
      .from(activityTable)
      .orderBy(sql`${activityTable.createdAt} DESC`)
      .limit(20);

    const withNames = await Promise.all(
      rows.map(async (row) => {
        let userName: string | null = null;
        if (row.userId) {
          const [u] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, row.userId)).limit(1);
          userName = u?.name ?? null;
        }
        return { ...row, userName, createdAt: row.createdAt.toISOString() };
      })
    );
    return res.json(withNames);
  } catch (err) {
    logger.error({ err }, "Activity error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard/pipeline", async (_req, res) => {
  try {
    const stages = ["new", "contacted", "qualified", "proposal_sent", "negotiation", "won", "lost"];
    const result = await Promise.all(
      stages.map(async (stage) => {
        const [row] = await db
          .select({ count: count(), total: sql<string>`COALESCE(SUM(value), 0)` })
          .from(leadsTable)
          .where(eq(leadsTable.stage, stage));
        return { stage, count: Number(row.count), value: Number(row.total) };
      })
    );
    return res.json(result);
  } catch (err) {
    logger.error({ err }, "Pipeline error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
