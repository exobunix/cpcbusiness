import { Router } from "express";
import { db, portfolioTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

const fmt = (r: any) => ({
  ...r,
  technologies: Array.isArray(r.technologies) ? r.technologies : [],
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

router.get("/portfolio", async (req, res) => {
  try {
    const { category } = req.query as { category?: string };
    let rows = await db.select().from(portfolioTable).orderBy(sql`${portfolioTable.createdAt} DESC`);
    if (category && category !== "all") rows = rows.filter((r) => r.category === category);
    return res.json(rows.map(fmt));
  } catch (err) {
    logger.error({ err }, "Get portfolio error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/portfolio", async (req, res) => {
  try {
    const slug = req.body.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const [row] = await db.insert(portfolioTable).values({ ...req.body, slug }).returning();
    return res.status(201).json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Create portfolio error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/portfolio/:id", async (req, res) => {
  try {
    const [row] = await db.update(portfolioTable).set({ ...req.body, updatedAt: new Date() }).where(eq(portfolioTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    return res.json(fmt(row));
  } catch (err) {
    logger.error({ err }, "Update portfolio error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/portfolio/:id", async (req, res) => {
  try {
    await db.delete(portfolioTable).where(eq(portfolioTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete portfolio error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
