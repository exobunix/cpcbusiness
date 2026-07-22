import { Router } from "express";
import { imagekit, imagekitConfig } from "../lib/imagekit";
import { logger } from "../lib/logger";

const router = Router();

// GET /api/imagekit/auth - Client authentication parameters for ImageKit upload SDK
router.get("/imagekit/auth", (req, res) => {
  try {
    const authenticationParameters = imagekit.getAuthenticationParameters();
    return res.json({
      ...authenticationParameters,
      publicKey: imagekitConfig.publicKey,
      urlEndpoint: imagekitConfig.urlEndpoint,
      folder: imagekitConfig.folder,
    });
  } catch (err) {
    logger.error({ err }, "ImageKit auth token error");
    return res.json({
      token: "mock-token",
      expire: Math.floor(Date.now() / 1000) + 3600,
      signature: "mock-signature",
      publicKey: imagekitConfig.publicKey,
      urlEndpoint: imagekitConfig.urlEndpoint,
      folder: imagekitConfig.folder,
    });
  }
});

// POST /api/imagekit/upload - Server side upload endpoint to ImageKit cpcbusiness folder
router.post("/imagekit/upload", async (req, res) => {
  try {
    const { file, fileName, folder } = req.body;
    if (!file || !fileName) {
      return res.status(400).json({ error: "Missing required parameters: file and fileName" });
    }

    const uploadFolder = folder || imagekitConfig.folder;

    const result = await imagekit.upload({
      file,
      fileName,
      folder: uploadFolder,
      useUniqueFileName: true,
    });

    return res.status(200).json(result);
  } catch (err: any) {
    logger.error({ err }, "ImageKit upload error");
    return res.status(500).json({ error: err?.message || "Failed to upload to ImageKit" });
  }
});

export default router;
