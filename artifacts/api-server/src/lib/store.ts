import mongoose, { Schema } from "mongoose";
import { logger } from "./logger";

// Mongoose Schemas for MongoDB Atlas
const UserSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, default: "client" },
  company: String,
  phone: String,
  status: { type: String, default: "active" },
  avatarUrl: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const ClientSchema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  company: String,
  phone: String,
  status: { type: String, default: "active" },
  activeProjects: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

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

export const MongoUser = mongoose.models.User || mongoose.model("User", UserSchema);
export const MongoClient = mongoose.models.Client || mongoose.model("Client", ClientSchema);
export const MongoProject = mongoose.models.Project || mongoose.model("Project", ProjectSchema);
export const MongoInvoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
export const MongoTicket = mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
export const MongoMessage = mongoose.models.Message || mongoose.model("Message", MessageSchema);
export const MongoNotification = mongoose.models.Notification || mongoose.model("Notification", NotificationSchema);

const SiteSettingsSchema = new Schema({
  id: { type: Number, default: 1, unique: true },
  logoText: { type: String, default: "CPC" },
  logoHighlight: { type: String, default: "BUSINESS" },
  logoUrl: { type: String, default: "" },
  headerAnnouncement: { type: String, default: "Enterprise Digital Agency Platform" },
  headerTitle: { type: String, default: "Build the Future" },
  headerSubtitle: { type: String, default: "Digital Empire" },
  headerDescription: { type: String, default: "We architect world-class digital solutions — from enterprise SaaS to AI-powered platforms — that define industries and outlast trends." },
  headerCtaText: { type: String, default: "Explore Services" },
  headerCtaLink: { type: String, default: "/services" },
  headerSecondaryCtaText: { type: String, default: "View Portfolio" },
  headerSecondaryCtaLink: { type: String, default: "/portfolio" },
  footerAbout: { type: String, default: "Enterprise-grade digital solutions for ambitious companies worldwide." },
  footerCopyright: { type: String, default: "© 2026 CPCBusiness. All rights reserved." },
  footerEmail: { type: String, default: "hello@cpcbusiness.com" },
  footerPhone: { type: String, default: "+1 (800) CPC-BIZZ" },
  footerAddress: { type: String, default: "San Francisco, CA 94102" },
  socialTwitter: { type: String, default: "https://x.com" },
  socialLinkedin: { type: String, default: "https://linkedin.com" },
  socialGithub: { type: String, default: "https://github.com" },
  socialInstagram: { type: String, default: "https://instagram.com" },
  menuLinks: { type: Array, default: [
    { label: "Services", href: "/services" },
    { label: "Portfolio", href: "/portfolio" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" }
  ] },
  bannerImages: { type: Object, default: { heroBg: "", aboutBanner: "", servicesBanner: "" } },
  homeStats: { type: Array, default: [
    { value: "500+", label: "Projects Delivered" },
    { value: "200+", label: "Enterprise Clients" },
    { value: "10+", label: "Years Experience" },
    { value: "99%", label: "Client Satisfaction" }
  ] },
  homeTechs: { type: Array, default: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "Python", "GraphQL", "Kubernetes", "TensorFlow", "Next.js", "MongoDB"] },
  homeTestimonials: { type: Array, default: [
    { name: "Sarah Chen", role: "CTO, Nexus Corp", text: "CPCBusiness transformed our entire digital infrastructure. The quality of their work is unparalleled.", rating: 5 },
    { name: "Marcus Williams", role: "CEO, Orbital Ventures", text: "Working with CPCBusiness felt like having a world-class tech team as an extension of our own.", rating: 5 },
    { name: "Priya Patel", role: "VP Engineering, DataStream", text: "Their AI solutions gave us a 3x increase in operational efficiency. Absolutely remarkable team.", rating: 5 }
  ] },
  homeFaqs: { type: Array, default: [
    { q: "What industries do you specialize in?", a: "We serve fintech, healthcare, SaaS, e-commerce, logistics, and enterprise software sectors." },
    { q: "How long does a typical project take?", a: "Projects range from 4 weeks (MVP) to 12+ months for enterprise platforms. We provide detailed timelines during discovery." },
    { q: "Do you offer ongoing support?", a: "Yes — we provide 24/7 support packages, dedicated DevOps, and continuous feature development." },
    { q: "What makes CPCBusiness different?", a: "We combine senior engineering talent with world-class design to deliver software that's both technically excellent and beautifully crafted." }
  ] },
  aboutTitle: { type: String, default: "We Build Digital Empires" },
  aboutDescription: { type: String, default: "Founded in 2014, CPCBusiness has grown from a 3-person boutique agency to a 50+ strong enterprise digital powerhouse trusted by companies in 30+ countries." },
  aboutMission: { type: String, default: "To empower ambitious companies with world-class digital solutions that drive measurable growth and lasting competitive advantage." },
  aboutVision: { type: String, default: "To be the most trusted enterprise technology partner in the world — where innovation meets execution and every build becomes a landmark." },
  aboutValues: { type: Array, default: [
    { title: "Excellence", desc: "We set the bar high and clear it every time — no exceptions." },
    { title: "Precision", desc: "Every decision is deliberate. Every line of code is intentional." },
    { title: "Partnership", desc: "We don't just build for you — we build with you." },
    { title: "Integrity", desc: "Transparent communication, honest timelines, real results." }
  ] },
  aboutTeam: { type: Array, default: [
    { name: "Alex Petrov", role: "CEO & Co-Founder", dept: "Executive" },
    { name: "Sarah Kim", role: "CTO & Co-Founder", dept: "Engineering" },
    { name: "Marcus Johnson", role: "Head of Design", dept: "Design" },
    { name: "Priya Sharma", role: "VP Engineering", dept: "Engineering" },
    { name: "David Chen", role: "Head of AI", dept: "AI" },
    { name: "Emma Wilson", role: "Head of Operations", dept: "Operations" }
  ] },
  updatedAt: { type: Date, default: Date.now }
});

export const MongoSiteSettings = mongoose.models.SiteSettings || mongoose.model("SiteSettings", SiteSettingsSchema);


// In-Memory Fallback Seed Data
export const memoryStore = {
  users: [
    {
      id: 1,
      name: "Admin User",
      email: "admin@cpcbusiness.com",
      role: "admin",
      company: "CPCBusiness",
      phone: "+1 (555) 000-1111",
      status: "active",
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      name: "Demo Client",
      email: "client@example.com",
      role: "client",
      company: "Acme Corp",
      phone: "+1 (555) 234-5678",
      status: "active",
      createdAt: new Date().toISOString(),
    },
  ],

  clients: [
    {
      id: 1,
      name: "Demo Client",
      email: "client@example.com",
      company: "Acme Corp",
      phone: "+1 (555) 234-5678",
      status: "active",
      activeProjects: 2,
      totalSpent: 16250,
      createdAt: new Date().toISOString(),
    },
  ],

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
