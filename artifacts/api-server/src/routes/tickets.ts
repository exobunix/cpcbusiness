import { Router } from "express";
import { db, ticketsTable, clientsTable, usersTable, activityTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import { MongoTicket, MongoNotification, memoryStore } from "../lib/store";

const router = Router();

router.get("/tickets", async (req, res) => {
  try {
    const { status, priority, clientId } = req.query as { status?: string; priority?: string; clientId?: string };
    
    let rows: any[] = [];

    // Try MongoDB
    try {
      const mongoDocs = await MongoTicket.find({}).sort({ createdAt: -1 }).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toISOString?.() || doc.updatedAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB ticket fetch error, checking PostgreSQL");
    }

    // Try PostgreSQL if MongoDB empty
    if (rows.length === 0 && db) {
      try {
        const pgRows = await db.select().from(ticketsTable).orderBy(sql`${ticketsTable.createdAt} DESC`);
        if (pgRows.length > 0) {
          rows = pgRows.map((r) => ({
            ...r,
            createdAt: r.createdAt.toISOString(),
            updatedAt: r.updatedAt.toISOString(),
          }));
        }
      } catch (e) {
        logger.warn({ err: e }, "PostgreSQL ticket fetch error");
      }
    }

    // Fallback to memoryStore
    if (rows.length === 0) {
      rows = memoryStore.tickets;
    }

    if (status) rows = rows.filter((r) => r.status === status);
    if (priority) rows = rows.filter((r) => r.priority === priority);
    if (clientId) rows = rows.filter((r) => r.clientId === parseInt(clientId));

    return res.json(rows);
  } catch (err) {
    logger.error({ err }, "Get tickets error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tickets", async (req, res) => {
  try {
    const newId = Date.now();
    const newTicket = {
      id: newId,
      subject: req.body.subject,
      description: req.body.description,
      clientId: req.body.clientId || 1,
      clientName: req.body.clientName || "Demo Client",
      assigneeId: req.body.assigneeId || 1,
      assigneeName: req.body.assigneeName || "Admin User",
      status: req.body.status || "open",
      priority: req.body.priority || "medium",
      category: req.body.category || "General",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to MongoDB
    try {
      await MongoTicket.create(newTicket);
    } catch (e) {
      logger.warn({ err: e }, "MongoDB save ticket error");
    }

    // Save to PostgreSQL
    try {
      if (db) {
        await db.insert(ticketsTable).values({
          subject: newTicket.subject,
          description: newTicket.description,
          priority: newTicket.priority,
          category: newTicket.category,
        });
      }
    } catch (e) {
      logger.warn({ err: e }, "PG save ticket error");
    }

    // Save to memoryStore
    memoryStore.tickets.unshift(newTicket);

    // Create Admin Notification
    const notif = {
      id: Date.now() + 1,
      userId: 1,
      title: "New Support Ticket",
      message: `New ticket created: "${newTicket.subject}"`,
      type: "ticket",
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    try {
      await MongoNotification.create(notif);
    } catch (e) {}
    memoryStore.notifications.unshift(notif);

    return res.status(201).json(newTicket);
  } catch (err) {
    logger.error({ err }, "Create ticket error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    const updates = req.body;

    // Update in memoryStore
    const idx = memoryStore.tickets.findIndex((t) => String(t.id) === String(ticketId));
    if (idx !== -1) {
      memoryStore.tickets[idx] = { ...memoryStore.tickets[idx], ...updates, updatedAt: new Date().toISOString() };
    }

    // Update in MongoDB
    try {
      await MongoTicket.updateOne({ id: Number(ticketId) }, { $set: { ...updates, updatedAt: new Date() } });
    } catch (e) {}

    const updated = idx !== -1 ? memoryStore.tickets[idx] : { id: ticketId, ...updates };
    return res.json(updated);
  } catch (err) {
    logger.error({ err }, "Update ticket error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
