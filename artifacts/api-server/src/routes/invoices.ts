import { Router } from "express";
import { logger } from "../lib/logger";
import { MongoInvoice, MongoNotification, memoryStore } from "../lib/store";

const router = Router();

const fmt = (r: any) => ({
  ...r,
  subtotal: Number(r.subtotal || 0),
  tax: Number(r.tax || 0),
  total: Number(r.total || 0),
  items: Array.isArray(r.items) ? r.items : [],
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

let invoiceSeq = 1002;
const nextInvoiceNumber = () => `INV-${++invoiceSeq}`;

router.get("/invoices", async (req, res) => {
  try {
    const { clientId, status } = req.query as { clientId?: string; status?: string };
    
    let rows: any[] = [];

    try {
      const mongoDocs = await MongoInvoice.find({}).sort({ createdAt: -1 }).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB get invoices error");
    }

    if (rows.length === 0) {
      rows = memoryStore.invoices;
    }

    if (clientId) rows = rows.filter((r) => String(r.clientId) === String(clientId));
    if (status) rows = rows.filter((r) => r.status === status);

    return res.json(rows.map(fmt));
  } catch (err) {
    logger.error({ err }, "Get invoices error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/invoices", async (req, res) => {
  try {
    const { items = [], tax = 0, clientId = 1, clientName = "Acme Corp", ...rest } = req.body as any;
    const subtotal = items.reduce((s: number, item: any) => s + Number(item.total || item.unitPrice || 0), 0);
    const total = subtotal + Number(tax);

    const newInvoice = {
      id: Date.now(),
      invoiceNumber: nextInvoiceNumber(),
      clientId: Number(clientId),
      clientName,
      projectId: req.body.projectId || null,
      projectName: req.body.projectName || null,
      status: req.body.status || "pending",
      issueDate: req.body.issueDate || new Date().toISOString().split("T")[0],
      dueDate: req.body.dueDate || "2026-08-30",
      subtotal,
      tax: Number(tax),
      total: total || 5000,
      items: items.length > 0 ? items : [{ description: "Digital Services", quantity: 1, unitPrice: 5000, total: 5000 }],
      createdAt: new Date().toISOString(),
    };

    try {
      await MongoInvoice.create(newInvoice);
    } catch (e) {
      logger.warn({ err: e }, "MongoDB save invoice error");
    }

    memoryStore.invoices.unshift(newInvoice);

    // Create Notification
    const notif = {
      id: Date.now() + 1,
      userId: 1,
      title: "Invoice Generated",
      message: `Invoice ${newInvoice.invoiceNumber} ($${newInvoice.total}) generated for ${newInvoice.clientName}.`,
      type: "invoice",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await MongoNotification.create(notif);
    } catch (e) {}
    memoryStore.notifications.unshift(notif);

    return res.status(201).json(fmt(newInvoice));
  } catch (err) {
    logger.error({ err }, "Create invoice error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/finance/summary", async (_req, res) => {
  try {
    let all = memoryStore.invoices;
    try {
      const mongoDocs = await MongoInvoice.find({}).lean();
      if (mongoDocs.length > 0) {
        all = mongoDocs.map((d: any) => fmt(d));
      }
    } catch (e) {}

    const totalRevenue = all.filter((r) => r.status === "paid").reduce((s, r) => s + Number(r.total || 0), 0);
    const totalPending = all.filter((r) => r.status === "pending").reduce((s, r) => s + Number(r.total || 0), 0);
    const totalOverdue = all.filter((r) => r.status === "overdue").reduce((s, r) => s + Number(r.total || 0), 0);
    const totalPaid = totalRevenue;

    return res.json({ totalRevenue, totalPending, totalOverdue, totalPaid, invoiceCount: all.length });
  } catch (err) {
    logger.error({ err }, "Finance summary error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/invoices/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const inv = memoryStore.invoices.find((i) => String(i.id) === String(id));
    if (!inv) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(inv));
  } catch (err) {
    logger.error({ err }, "Get invoice error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/invoices/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const idx = memoryStore.invoices.findIndex((i) => String(i.id) === String(id));
    if (idx !== -1) {
      memoryStore.invoices[idx] = {
        ...memoryStore.invoices[idx],
        ...updates,
        paidDate: updates.status === "paid" ? (updates.paidDate || new Date().toISOString().split("T")[0]) : memoryStore.invoices[idx].paidDate,
      };
    }

    try {
      await MongoInvoice.updateOne({ id: Number(id) }, { $set: updates });
    } catch (e) {}

    const updated = idx !== -1 ? memoryStore.invoices[idx] : { id, ...updates };

    // Create Notification if paid
    if (updates.status === "paid") {
      const notif = {
        id: Date.now(),
        userId: 1,
        title: "Invoice Paid",
        message: `Invoice ${updated.invoiceNumber || id} ($${updated.total || 0}) was marked as paid!`,
        type: "invoice",
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      try { await MongoNotification.create(notif); } catch (e) {}
      memoryStore.notifications.unshift(notif);
    }

    return res.json(fmt(updated));
  } catch (err) {
    logger.error({ err }, "Update invoice error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
