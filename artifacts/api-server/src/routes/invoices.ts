import { Router } from "express";
import { db, invoicesTable, clientsTable, projectsTable, activityTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const fmt = (r: any) => ({
  ...r,
  subtotal: Number(r.subtotal),
  tax: Number(r.tax),
  total: Number(r.total),
  items: Array.isArray(r.items) ? r.items : [],
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

let invoiceCounter = 1000;
const nextInvoiceNumber = () => `INV-${++invoiceCounter}`;

router.get("/invoices", async (req, res) => {
  try {
    const { clientId, status } = req.query as { clientId?: string; status?: string };
    let rows = await db.select().from(invoicesTable).orderBy(sql`${invoicesTable.createdAt} DESC`);
    if (clientId) rows = rows.filter((r) => r.clientId === parseInt(clientId));
    if (status) rows = rows.filter((r) => r.status === status);
    const enriched = await Promise.all(
      rows.map(async (row) => {
        let clientName = "";
        let projectName: string | null = null;
        const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, row.clientId)).limit(1);
        clientName = c?.name ?? "Unknown";
        if (row.projectId) {
          const [p] = await db.select({ name: projectsTable.name }).from(projectsTable).where(eq(projectsTable.id, row.projectId)).limit(1);
          projectName = p?.name ?? null;
        }
        return { ...fmt(row), clientName, projectName };
      })
    );
    return res.json(enriched);
  } catch (err) {
    logger.error({ err }, "Get invoices error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { items = [], tax = 0, ...rest } = req.body as any;
    const subtotal = items.reduce((s: number, item: any) => s + Number(item.total), 0);
    const total = subtotal + Number(tax);
    const [row] = await db.insert(invoicesTable).values({
      ...rest,
      invoiceNumber: nextInvoiceNumber(),
      items,
      subtotal: String(subtotal),
      tax: String(tax),
      total: String(total),
    }).returning();
    await db.insert(activityTable).values({ type: "invoice_created", description: `Invoice ${row.invoiceNumber} created` });
    return res.status(201).json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Create invoice error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/finance/summary", async (_req, res) => {
  try {
    const all = await db.select().from(invoicesTable);
    const totalRevenue = all.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.total), 0);
    const totalPending = all.filter((r) => r.status === "pending").reduce((s, r) => s + Number(r.total), 0);
    const totalOverdue = all.filter((r) => r.status === "overdue").reduce((s, r) => s + Number(r.total), 0);
    const totalPaid = totalRevenue;
    return res.json({ totalRevenue, totalPending, totalOverdue, totalPaid, invoiceCount: all.length });
  } catch (err) {
    logger.error({ err }, "Finance summary error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const [row] = await db.select().from(invoicesTable).where(eq(invoicesTable.id, parseInt(req.params.id))).limit(1);
    if (!row) return res.status(404).json({ error: "Not found" });
    const [c] = await db.select({ name: clientsTable.name }).from(clientsTable).where(eq(clientsTable.id, row.clientId)).limit(1);
    return res.json({ ...fmt(row), clientName: c?.name ?? "Unknown", projectName: null });
  } catch (err) {
    logger.error({ err }, "Get invoice error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/invoices/:id", async (req, res) => {
  try {
    const [row] = await db.update(invoicesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(invoicesTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Update invoice error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
