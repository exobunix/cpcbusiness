import { pgTable, serial, text, numeric, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const invoicesTable = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  clientId: integer("client_id").notNull(),
  projectId: integer("project_id"),
  status: text("status").notNull().default("draft"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  tax: numeric("tax", { precision: 12, scale: 2 }).notNull().default("0"),
  total: numeric("total", { precision: 12, scale: 2 }).notNull().default("0"),
  currency: text("currency").notNull().default("USD"),
  issueDate: text("issue_date").notNull(),
  dueDate: text("due_date").notNull(),
  paidDate: text("paid_date"),
  notes: text("notes"),
  items: jsonb("items").default("[]"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertInvoiceSchema = createInsertSchema(invoicesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoicesTable.$inferSelect;
