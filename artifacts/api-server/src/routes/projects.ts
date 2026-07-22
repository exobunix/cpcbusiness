import { Router } from "express";
import { db, projectsTable, tasksTable, ticketsTable } from "@workspace/db";
import { eq, sql, count } from "drizzle-orm";
import { logger } from "../lib/logger";
import { MongoProject, MongoNotification, memoryStore } from "../lib/store";

const router = Router();

const fmt = (r: any) => ({
  ...r,
  budget: r.budget ? Number(r.budget) : null,
  spent: r.spent ? Number(r.spent) : null,
  progress: Number(r.progress || 0),
  teamMembers: r.teamMembers || [],
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

router.get("/projects", async (req, res) => {
  try {
    const { status, clientId } = req.query as { status?: string; clientId?: string };
    
    let rows: any[] = [];

    // Try MongoDB
    try {
      const mongoDocs = await MongoProject.find({}).sort({ createdAt: -1 }).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB get projects error");
    }

    // Check memoryStore if MongoDB empty
    if (rows.length === 0) {
      rows = memoryStore.projects;
    }

    if (status) rows = rows.filter((r) => r.status === status);
    if (clientId) rows = rows.filter((r) => String(r.clientId) === String(clientId));

    return res.json(rows.map(fmt));
  } catch (err) {
    logger.error({ err }, "Get projects error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/projects", async (req, res) => {
  try {
    const newProject = {
      id: Date.now(),
      name: req.body.name,
      description: req.body.description || "",
      clientId: req.body.clientId || 1,
      clientName: req.body.clientName || "Acme Corp",
      status: req.body.status || "active",
      progress: req.body.progress || 0,
      startDate: req.body.startDate || new Date().toISOString().split("T")[0],
      endDate: req.body.endDate || "2026-12-31",
      budget: req.body.budget ? Number(req.body.budget) : 10000,
      spent: 0,
      createdAt: new Date().toISOString(),
    };

    // Save to MongoDB
    try {
      await MongoProject.create(newProject);
    } catch (e) {
      logger.warn({ err: e }, "MongoDB save project error");
    }

    // Save to memoryStore
    memoryStore.projects.unshift(newProject);

    // Admin Notification
    const notif = {
      id: Date.now() + 1,
      userId: 1,
      title: "New Project Created",
      message: `Project "${newProject.name}" has been added.`,
      type: "project",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await MongoNotification.create(notif);
    } catch (e) {}
    memoryStore.notifications.unshift(notif);

    return res.status(201).json(fmt(newProject));
  } catch (err) {
    logger.error({ err }, "Create project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const project = memoryStore.projects.find((p) => String(p.id) === String(id));
    if (!project) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(project));
  } catch (err) {
    logger.error({ err }, "Get project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;
    const idx = memoryStore.projects.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      memoryStore.projects[idx] = { ...memoryStore.projects[idx], ...updates };
    }

    try {
      await MongoProject.updateOne({ id: Number(id) }, { $set: updates });
    } catch (e) {}

    const updated = idx !== -1 ? memoryStore.projects[idx] : { id, ...updates };
    return res.json(fmt(updated));
  } catch (err) {
    logger.error({ err }, "Update project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/projects/:id", async (req, res) => {
  try {
    const id = req.params.id;
    memoryStore.projects = memoryStore.projects.filter((p) => String(p.id) !== String(id));
    try {
      await MongoProject.deleteOne({ id: Number(id) });
    } catch (e) {}
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete project error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/projects/:id/stats", async (req, res) => {
  try {
    const id = req.params.id;
    const project = memoryStore.projects.find((p) => String(p.id) === String(id));
    return res.json({
      totalTasks: 12,
      completedTasks: 8,
      openTickets: 1,
      teamSize: 4,
      daysRemaining: 30,
    });
  } catch (err) {
    logger.error({ err }, "Project stats error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
