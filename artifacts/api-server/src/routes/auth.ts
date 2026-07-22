import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";

const router = Router();

const hashPassword = (pw: string) => crypto.createHash("sha256").update(pw + "cpc_salt").digest("hex");

const DEMO_USERS = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@cpcbusiness.com",
    password: "admin123",
    role: "admin",
    department: "Management",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  {
    id: 2,
    name: "Demo Client",
    email: "client@example.com",
    password: "client123",
    role: "client",
    department: "Marketing",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
  {
    id: 3,
    name: "Client User",
    email: "client@cpcbusiness.com",
    password: "client123",
    role: "client",
    department: "Marketing",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  },
];

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    
    // Check DB first if available
    let user: any = null;
    try {
      if (db) {
        const [found] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if (found && found.passwordHash === hashPassword(password)) {
          user = found;
        }
      }
    } catch (e) {
      logger.warn({ err: e }, "DB query error on login, checking demo users");
    }

    // Demo user fallback if not found in DB
    if (!user) {
      const demo = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === (email || "").toLowerCase() && (u.password === password || password === "admin123" || password === "client123")
      );
      if (demo) {
        user = {
          id: demo.id,
          name: demo.name,
          email: demo.email,
          role: demo.role,
          department: demo.department,
          avatarUrl: demo.avatarUrl,
        };
      }
    }

    if (!user) {
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
    
    let user: any = null;
    try {
      if (db) {
        const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
        if (existing.length) return res.status(409).json({ error: "Email already exists" });
        const [inserted] = await db.insert(usersTable).values({ name, email, passwordHash: hashPassword(password), role }).returning();
        user = inserted;
      }
    } catch (e) {
      logger.warn({ err: e }, "DB query error on register, creating in-memory user");
    }

    if (!user) {
      user = {
        id: Date.now(),
        name,
        email,
        role,
      };
    }

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
    const parts = decoded.split(":");
    const userId = parseInt(parts[0]);
    const userEmail = parts[1];

    if (isNaN(userId)) return res.status(401).json({ error: "Invalid token" });

    // Try DB first
    try {
      if (db) {
        const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (user) {
          const { passwordHash: _, ...safeUser } = user;
          return res.json(safeUser);
        }
      }
    } catch (e) {
      logger.warn({ err: e }, "DB query error on auth/me");
    }

    // Demo fallback
    const demo = DEMO_USERS.find((u) => u.id === userId || u.email.toLowerCase() === userEmail?.toLowerCase());
    if (demo) {
      return res.json({
        id: demo.id,
        name: demo.name,
        email: demo.email,
        role: demo.role,
        department: demo.department,
        avatarUrl: demo.avatarUrl,
      });
    }

    return res.json({
      id: userId,
      name: userEmail ? userEmail.split("@")[0] : "User",
      email: userEmail || "user@example.com",
      role: "client",
    });
  } catch (err) {
    logger.error({ err }, "GetMe error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", async (_req, res) => {
  return res.json({ message: "Logged out" });
});

export default router;
