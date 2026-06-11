import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  clientId: integer("client_id"),
  assigneeId: integer("assignee_id"),
  status: text("status").notNull().default("open"),
  priority: text("priority").notNull().default("medium"),
  category: text("category"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTicketSchema = createInsertSchema(ticketsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTicket = z.infer<typeof insertTicketSchema>;
export type Ticket = typeof ticketsTable.$inferSelect;
