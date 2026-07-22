import { Router } from "express";
import { logger } from "../lib/logger";
import { MongoClient, memoryStore } from "../lib/store";

const router = Router();

router.get("/clients", async (req, res) => {
  try {
    const { search } = req.query as { search?: string };
    let rows: any[] = [];

    try {
      const mongoDocs = await MongoClient.find({}).sort({ createdAt: -1 }).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB get clients notice");
    }

    if (rows.length === 0) {
      rows = memoryStore.clients;
    }

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) => (r.name || "").toLowerCase().includes(s) || (r.email || "").toLowerCase().includes(s) || (r.company || "").toLowerCase().includes(s));
    }

    return res.json(rows);
  } catch (err) {
    logger.error({ err }, "Get clients error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/clients", async (req, res) => {
  try {
    const newClient = {
      id: Date.now(),
      name: req.body.name,
      email: req.body.email,
      company: req.body.company || "",
      phone: req.body.phone || "",
      status: req.body.status || "active",
      activeProjects: 0,
      totalSpent: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      await MongoClient.create(newClient);
    } catch (e) {}

    memoryStore.clients.unshift(newClient);
    return res.status(201).json(newClient);
  } catch (err) {
    logger.error({ err }, "Create client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/clients/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const client = memoryStore.clients.find((c) => String(c.id) === String(id));
    if (!client) return res.status(404).json({ error: "Not found" });
    return res.json(client);
  } catch (err) {
    logger.error({ err }, "Get client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/clients/:id", async (req, res) => {
  try {
    const id = req.params.id;
    memoryStore.clients = memoryStore.clients.filter((c) => String(c.id) !== String(id));
    try {
      await MongoClient.deleteOne({ id: Number(id) });
    } catch (e) {}
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete client error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
