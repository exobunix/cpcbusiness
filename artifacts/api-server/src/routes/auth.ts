import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";
import crypto from "crypto";
import { MongoUser, MongoClient, MongoNotification, memoryStore } from "../lib/store";

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
];

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    
    let user: any = null;

    // Check MongoDB MongoUser first
    try {
      const foundMongo = await MongoUser.findOne({ email: email.toLowerCase() }).lean();
      if (foundMongo) {
        user = {
          id: foundMongo.id || foundMongo._id.toString(),
          name: foundMongo.name,
          email: foundMongo.email,
          role: foundMongo.role || "client",
          company: foundMongo.company || "",
        };
      }
    } catch (e) {}

    // Check DB first if available
    if (!user) {
      try {
        if (db) {
          const [found] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
          if (found && found.passwordHash === hashPassword(password)) {
            user = found;
          }
        }
      } catch (e) {
        logger.warn({ err: e }, "DB query error on login");
      }
    }

    // Demo user fallback if not found
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

    // Check memoryStore.users fallback
    if (!user) {
      const memUser = memoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (memUser) {
        user = memUser;
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
    const { name, email, password, role = "client", company = "", phone = "" } = req.body as { name: string; email: string; password: string; role?: string; company?: string; phone?: string };
    
    const newUser = {
      id: Date.now(),
      name,
      email: email.toLowerCase(),
      role,
      company: company || (role === "client" ? "Independent Client" : "Agency Team"),
      phone: phone || "",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    // Save to MongoDB MongoUser & MongoClient
    try {
      await MongoUser.create(newUser);
      if (role === "client") {
        await MongoClient.create({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          company: newUser.company,
          phone: newUser.phone,
          status: "active",
          activeProjects: 0,
          totalSpent: 0,
          createdAt: newUser.createdAt,
        });
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB save user notice");
    }

    // Save to memoryStore
    memoryStore.users.unshift(newUser);
    if (role === "client") {
      memoryStore.clients.unshift({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        company: newUser.company,
        phone: newUser.phone,
        status: "active",
        activeProjects: 0,
        totalSpent: 0,
        createdAt: newUser.createdAt,
      });
    }

    // Trigger Admin Notification
    const notif = {
      id: Date.now() + 1,
      userId: 1,
      title: "New User Registered",
      message: `User "${newUser.name}" (${newUser.email}) registered as ${newUser.role}.`,
      type: "user",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    try {
      await MongoNotification.create(notif);
    } catch (e) {}
    memoryStore.notifications.unshift(notif);

    const token = Buffer.from(`${newUser.id}:${newUser.email}:${Date.now()}`).toString("base64");
    return res.status(201).json({ token, user: newUser });
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

    // Try MongoDB
    try {
      const foundMongo = await MongoUser.findOne({ $or: [{ id: userId }, { email: userEmail?.toLowerCase() }] }).lean();
      if (foundMongo) {
        return res.json({
          id: foundMongo.id || foundMongo._id.toString(),
          name: foundMongo.name,
          email: foundMongo.email,
          role: foundMongo.role || "client",
          company: foundMongo.company,
        });
      }
    } catch (e) {}

    // Check memoryStore
    const memUser = memoryStore.users.find((u) => u.id === userId || u.email.toLowerCase() === userEmail?.toLowerCase());
    if (memUser) {
      return res.json(memUser);
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
