import mongoose, { Schema } from "mongoose";
import { logger } from "./logger";

// Mongoose Schemas for MongoDB Atlas
const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  clientId: Number,
  clientName: String,
  status: { type: String, default: "active" },
  progress: { type: Number, default: 0 },
  startDate: String,
  endDate: String,
  budget: Number,
  spent: Number,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const InvoiceSchema = new Schema({
  invoiceNumber: { type: String, required: true },
  clientId: Number,
  clientName: String,
  projectId: Number,
  projectName: String,
  status: { type: String, default: "pending" },
  issueDate: String,
  dueDate: String,
  paidDate: String,
  subtotal: Number,
  tax: Number,
  total: Number,
  items: Array,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const TicketSchema = new Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  clientId: Number,
  clientName: String,
  assigneeId: Number,
  assigneeName: String,
  status: { type: String, default: "open" },
  priority: { type: String, default: "medium" },
  category: String,
  resolution: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MessageSchema = new Schema({
  senderId: Number,
  senderName: String,
  senderRole: String,
  recipientId: Number,
  projectId: Number,
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const NotificationSchema = new Schema({
  userId: Number,
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: String,
  isRead: { type: Boolean, default: false },
  link: String,
  createdAt: { type: Date, default: Date.now },
});

export const MongoProject = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export const MongoInvoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export const MongoTicket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export const MongoMessage = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const MongoNotification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

// In-Memory Fallback Seed Data
export const memoryStore = {
  projects: [
    {
      id: 1,
      name: "E-Commerce Platform Redesign",
      description: "Full redesign and development of online store with modern UX",
      clientId: 1,
      clientName: "Acme Corp",
      status: "active",
      progress: 65,
      startDate: "2026-06-01",
      endDate: "2026-08-15",
      budget: 25000,
      spent: 16250,
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Mobile App MVP",
      description: "Cross-platform React Native application for iOS and Android",
      clientId: 2,
      clientName: "Starlight Inc",
      status: "active",
      progress: 40,
      startDate: "2026-06-15",
      endDate: "2026-09-30",
      budget: 35000,
      spent: 14000,
      createdAt: new Date().toISOString(),
    },
  ],

  invoices: [
    {
      id: 1,
      invoiceNumber: "INV-1001",
      clientId: 1,
      clientName: "Acme Corp",
      projectId: 1,
      projectName: "E-Commerce Platform Redesign",
      status: "pending",
      issueDate: "2026-07-01",
      dueDate: "2026-07-30",
      subtotal: 5000,
      tax: 500,
      total: 5500,
      items: [{ description: "Phase 1 Frontend Development", quantity: 1, unitPrice: 5000, total: 5000 }],
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      invoiceNumber: "INV-1002",
      clientId: 2,
      clientName: "Starlight Inc",
      projectId: 2,
      projectName: "Mobile App MVP",
      status: "paid",
      issueDate: "2026-06-15",
      dueDate: "2026-07-15",
      paidDate: "2026-07-10",
      subtotal: 8000,
      tax: 800,
      total: 8800,
      items: [{ description: "Initial Deposit & Architecture Setup", quantity: 1, unitPrice: 8000, total: 8000 }],
      createdAt: new Date().toISOString(),
    },
  ],

  tickets: [
    {
      id: 1,
      subject: "Unable to upload product images",
      description: "When trying to upload PNG images in catalog, upload fails",
      clientId: 1,
      clientName: "Acme Corp",
      assigneeId: 1,
      assigneeName: "Admin User",
      status: "open",
      priority: "high",
      category: "Bug Report",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],

  messages: [
    {
      id: 1,
      senderId: 1,
      senderName: "Admin User",
      senderRole: "admin",
      recipientId: 2,
      content: "Hello! Welcome to CPCBusiness. How can we help your agency grow today?",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      senderId: 2,
      senderName: "Demo Client",
      senderRole: "client",
      recipientId: 1,
      content: "Hi team! We want to check our project timeline and invoice details.",
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
  ],

  notifications: [
    {
      id: 1,
      userId: 1,
      title: "Welcome to CPCBusiness",
      message: "Your agency command center is fully set up and ready.",
      type: "system",
      isRead: false,
      createdAt: new Date().toISOString(),
    },
  ],
};
