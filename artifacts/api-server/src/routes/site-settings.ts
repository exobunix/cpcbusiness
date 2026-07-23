import { Router } from "express";
import { MongoSiteSettings, memoryStore } from "../lib/store";
import { logger } from "../lib/logger";

const router = Router();

router.get("/site-settings", async (_req, res) => {
  try {
    let settings = await MongoSiteSettings.findOne({ id: 1 }).lean();
    if (!settings) {
      settings = await MongoSiteSettings.create({ id: 1 });
    }
    return res.json(settings);
  } catch (err) {
    logger.warn({ err }, "Get site settings error, returning memoryStore fallback");
    return res.json(memoryStore.siteSettings);
  }
});

router.patch("/site-settings", async (req, res) => {
  const updateData = { ...req.body, updatedAt: new Date() };
  delete updateData.id;
  delete updateData._id;

  // Parse JSON lists safely if passed as strings
  if (typeof updateData.menuLinks === "string") {
    try { updateData.menuLinks = JSON.parse(updateData.menuLinks); } catch (e) {}
  }
  if (typeof updateData.bannerImages === "string") {
    try { updateData.bannerImages = JSON.parse(updateData.bannerImages); } catch (e) {}
  }
  if (typeof updateData.homeStats === "string") {
    try { updateData.homeStats = JSON.parse(updateData.homeStats); } catch (e) {}
  }
  if (typeof updateData.homeTechs === "string") {
    try { updateData.homeTechs = JSON.parse(updateData.homeTechs); } catch (e) {}
  }
  if (typeof updateData.homeTestimonials === "string") {
    try { updateData.homeTestimonials = JSON.parse(updateData.homeTestimonials); } catch (e) {}
  }
  if (typeof updateData.homeFaqs === "string") {
    try { updateData.homeFaqs = JSON.parse(updateData.homeFaqs); } catch (e) {}
  }
  if (typeof updateData.aboutValues === "string") {
    try { updateData.aboutValues = JSON.parse(updateData.aboutValues); } catch (e) {}
  }
  if (typeof updateData.aboutTeam === "string") {
    try { updateData.aboutTeam = JSON.parse(updateData.aboutTeam); } catch (e) {}
  }

  // Update memoryStore fallback anyway
  memoryStore.siteSettings = {
    ...memoryStore.siteSettings,
    ...updateData
  };

  try {
    const settings = await MongoSiteSettings.findOneAndUpdate(
      { id: 1 },
      { $set: updateData },
      { new: true, upsert: true, lean: true }
    );
    return res.json(settings);
  } catch (err) {
    logger.warn({ err }, "Update site settings database error, saved to memoryStore fallback");
    return res.json(memoryStore.siteSettings);
  }
});

export default router;
