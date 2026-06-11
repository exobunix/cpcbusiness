import { pgTable, serial, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: integer("client_id"),
  status: text("status").notNull().default("active"),
  priority: text("priority").notNull().default("medium"),
  progress: integer("progress").notNull().default(0),
  budget: numeric("budget", { precision: 12, scale: 2 }),
  spent: numeric("spent", { precision: 12, scale: 2 }).default("0"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
