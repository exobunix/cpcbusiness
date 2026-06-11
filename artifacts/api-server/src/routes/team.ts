import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

const router = Router();

const hashPassword = (pw: string) => crypto.createHash("sha256").update(pw + "cpc_salt").digest("hex");

const fmt = (r: any) => ({
  ...r,
  skills: Array.isArray(r.skills) ? r.skills : [],
  activeProjects: 0,
  createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
});

router.get("/team", async (_req, res) => {
  try {
    const rows = await db.select().from(usersTable).orderBy(sql`${usersTable.createdAt} DESC`);
    return res.json(rows.map((r) => { const { passwordHash: _, ...safe } = r; return fmt(safe); }));
  } catch (err) {
    logger.error({ err }, "Get team error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/team", async (req, res) => {
  try {
    const { name, email, role, department, phone, skills } = req.body as any;
    const [row] = await db.insert(usersTable).values({
      name, email, role, department, phone,
      passwordHash: hashPassword("Welcome123!"),
    }).returning();
    const { passwordHash: _, ...safe } = row;
    return res.status(201).json(fmt(safe));
  } catch (err) {
    logger.error({ err }, "Create team member error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/team/:id", async (req, res) => {
  try {
    const { passwordHash: _ignore, ...updates } = req.body;
    const [row] = await db.update(usersTable).set({ ...updates, updatedAt: new Date() }).where(eq(usersTable.id, parseInt(req.params.id))).returning();
    if (!row) return res.status(404).json({ error: "Not found" });
    const { passwordHash: _, ...safe } = row;
    return res.json(fmt(safe));
  } catch (err) {
    logger.error({ err }, "Update team member error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/team/:id", async (req, res) => {
  try {
    await db.delete(usersTable).where(eq(usersTable.id, parseInt(req.params.id)));
    return res.json({ message: "Deleted" });
  } catch (err) {
    logger.error({ err }, "Delete team member error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
