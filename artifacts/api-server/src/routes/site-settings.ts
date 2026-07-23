import { Router } from "express";
import { MongoSiteSettings } from "../lib/store";
import { logger } from "../lib/logger";

const router = Router();

router.get("/site-settings", async (_req, res) => {
  try {
    let settings = await MongoSiteSettings.findOne({ id: 1 }).lean();
    if (!settings) {
      // Seed default settings by inserting a document with id 1
      settings = await MongoSiteSettings.create({ id: 1 });
    }
    return res.json(settings);
  } catch (err) {
    logger.error({ err }, "Get site settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/site-settings", async (req, res) => {
  try {
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

    const settings = await MongoSiteSettings.findOneAndUpdate(
      { id: 1 },
      { $set: updateData },
      { new: true, upsert: true, lean: true }
    );
    return res.json(settings);
  } catch (err) {
    logger.error({ err }, "Update site settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
