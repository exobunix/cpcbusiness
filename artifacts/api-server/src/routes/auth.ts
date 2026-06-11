import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

const router = Router();

const hashPassword = (pw: string) => crypto.createHash("sha256").update(pw + "cpc_salt").digest("hex");

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64");
    const { passwordHash: _, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (err) {
    logger.error({ err }, "Login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password, role = "client" } = req.body as { name: string; email: string; password: string; role?: string };
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length) return res.status(409).json({ error: "Email already exists" });
    const [user] = await db.insert(usersTable).values({ name, email, passwordHash: hashPassword(password), role }).returning();
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString("base64");
    const { passwordHash: _, ...safeUser } = user;
    return res.status(201).json({ token, user: safeUser });
  } catch (err) {
    logger.error({ err }, "Register error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/auth/me", async (req, res) => {
  try {
    const auth = req.headers.authorization?.replace("Bearer ", "");
    if (!auth) return res.status(401).json({ error: "Unauthorized" });
    const decoded = Buffer.from(auth, "base64").toString();
    const userId = parseInt(decoded.split(":")[0]);
    if (isNaN(userId)) return res.status(401).json({ error: "Invalid token" });
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { passwordHash: _, ...safeUser } = user;
    return res.json(safeUser);
  } catch (err) {
    logger.error({ err }, "GetMe error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", async (_req, res) => {
  return res.json({ message: "Logged out" });
});

export default router;
