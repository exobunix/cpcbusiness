import { Router } from "express";
import { db, servicesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const fmt = (r: any) => ({
  ...r,
  features: Array.isArray(r.features) ? r.features : [],
  technologies: Array.isArray(r.technologies) ? r.technologies : [],
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

router.get("/services", async (_req, res) => {
  try {
    const rows = await db.select().from(servicesTable).orderBy(servicesTable.sortOrder, sql`${servicesTable.createdAt} ASC`);
    return res.json(rows.map(fmt));
  } catch (err) {
    logger.error({ err }, "Get services error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/services", async (req, res) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const [row] = await db.insert(servicesTable).values({ ...req.body, slug }).returning();
    return res.status(201).json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Create service error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/services/:id", async (req, res) => {
  try {
    const [row] = await db.update(servicesTable).set({ ...req.body, updatedAt: new Date() }).where(eq(servicesTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Update service error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/services/:id", async (req, res) => {
  try {
    await db.delete(servicesTable).where(eq(servicesTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete service error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
