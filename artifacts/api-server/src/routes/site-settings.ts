import { Router } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

router.get("/site-settings", async (_req, res) => {
  try {
    const settings = await db.select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 1)).limit(1);
    if (!settings || settings.length === 0) {
      // Seed default settings by inserting with just the ID
      const [inserted] = await db.insert(siteSettingsTable).values({ id: 1 }).returning();
      return res.json(inserted);
    }
    return res.json(settings[0]);
  } catch (err) {
    logger.error({ err }, "Get site settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/site-settings", async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    delete updateData.id; // ensure ID cannot be altered

    // Support JSON updates since drizzle/pg handles strings differently sometimes
    if (typeof updateData.menuLinks === "string") {
      try {
        updateData.menuLinks = JSON.parse(updateData.menuLinks);
      } catch (e) {}
    }
    if (typeof updateData.bannerImages === "string") {
      try {
        updateData.bannerImages = JSON.parse(updateData.bannerImages);
      } catch (e) {}
    }

    const [row] = await db.update(siteSettingsTable).set(updateData).where(eq(siteSettingsTable.id, 1)).returning();
    if (!row) {
      const [inserted] = await db.insert(siteSettingsTable).values({ id: 1, ...updateData }).returning();
      return res.json(inserted);
    }
    return res.json(row);
  } catch (err) {
    logger.error({ err }, "Update site settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
