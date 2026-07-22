import { Router } from "express";
import { logger } from "../lib/logger";
import { MongoUser, memoryStore } from "../lib/store";

const router = Router();

router.get("/users", async (req, res) => {
  try {
    const { role, search } = req.query as { role?: string; search?: string };
    let rows: any[] = [];

    try {
      const mongoDocs = await MongoUser.find({}).sort({ createdAt: -1 }).lean();
      if (mongoDocs.length > 0) {
        rows = mongoDocs.map((doc: any) => ({
          ...doc,
          id: doc.id || doc._id.toString(),
          createdAt: doc.createdAt?.toISOString?.() || doc.createdAt,
        }));
      }
    } catch (e) {
      logger.warn({ err: e }, "MongoDB get users notice");
    }

    if (rows.length === 0) {
      rows = memoryStore.users;
    }

    if (role) {
      rows = rows.filter((r) => (r.role || "").toLowerCase() === role.toLowerCase());
    }

    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(s) ||
          (r.email || "").toLowerCase().includes(s) ||
          (r.company || "").toLowerCase().includes(s)
      );
    }

    return res.json(rows);
  } catch (err) {
    logger.error({ err }, "Get users error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    memoryStore.users = memoryStore.users.filter((u) => String(u.id) !== String(id));
    try {
      await MongoUser.deleteOne({ id: Number(id) });
    } catch (e) {}
    return res.json({ message: "User deleted" });
  } catch (err) {
    logger.error({ err }, "Delete user error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
