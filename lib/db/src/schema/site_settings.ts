import { pgTable, integer, text, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: integer("id").primaryKey(), // always 1
  logoText: text("logo_text").notNull().default("CPC"),
  logoHighlight: text("logo_highlight").notNull().default("BUSINESS"),
  logoUrl: text("logo_url"),
  headerAnnouncement: text("header_announcement").notNull().default("Enterprise Digital Agency Platform"),
  headerTitle: text("header_title").notNull().default("Build the Future"),
  headerSubtitle: text("header_subtitle").notNull().default("Digital Empire"),
  headerDescription: text("header_description").notNull().default("We architect world-class digital solutions — from enterprise SaaS to AI-powered platforms — that define industries and outlast trends."),
  headerCtaText: text("header_cta_text").notNull().default("Explore Services"),
  headerCtaLink: text("header_cta_link").notNull().default("/services"),
  headerSecondaryCtaText: text("header_secondary_cta_text").notNull().default("View Portfolio"),
  headerSecondaryCtaLink: text("header_secondary_cta_link").notNull().default("/portfolio"),
  footerAbout: text("footer_about").notNull().default("Enterprise-grade digital solutions for ambitious companies worldwide."),
  footerCopyright: text("footer_copyright").notNull().default("© 2026 CPCBusiness. All rights reserved."),
  footerEmail: text("footer_email").notNull().default("hello@cpcbusiness.com"),
  footerPhone: text("footer_phone").notNull().default("+1 (800) CPC-BIZZ"),
  footerAddress: text("footer_address").notNull().default("San Francisco, CA 94102"),
  socialTwitter: text("social_twitter").notNull().default("https://x.com"),
  socialLinkedin: text("social_linkedin").notNull().default("https://linkedin.com"),
  socialGithub: text("social_github").notNull().default("https://github.com"),
  socialInstagram: text("social_instagram").notNull().default("https://instagram.com"),
  menuLinks: jsonb("menu_links").default(`[{"label": "Services", "href": "/services"}, {"label": "Portfolio", "href": "/portfolio"}, {"label": "About", "href": "/about"}, {"label": "Contact", "href": "/contact"}]`),
  bannerImages: jsonb("banner_images").default(`{"heroBg": "", "aboutBanner": "", "servicesBanner": ""}`),
  
  // Homepage custom lists
  homeStats: jsonb("home_stats").default(`[
    {"value": "500+", "label": "Projects Delivered"},
    {"value": "200+", "label": "Enterprise Clients"},
    {"value": "10+", "label": "Years Experience"},
    {"value": "99%", "label": "Client Satisfaction"}
  ]`),
  homeTechs: jsonb("home_techs").default(`["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "Python", "GraphQL", "Kubernetes", "TensorFlow", "Next.js", "MongoDB"]`),
  homeTestimonials: jsonb("home_testimonials").default(`[
    {"name": "Sarah Chen", "role": "CTO, Nexus Corp", "text": "CPCBusiness transformed our entire digital infrastructure. The quality of their work is unparalleled.", "rating": 5},
    {"name": "Marcus Williams", "role": "CEO, Orbital Ventures", "text": "Working with CPCBusiness felt like having a world-class tech team as an extension of our own.", "rating": 5},
    {"name": "Priya Patel", "role": "VP Engineering, DataStream", "text": "Their AI solutions gave us a 3x increase in operational efficiency. Absolutely remarkable team.", "rating": 5}
  ]`),
  homeFaqs: jsonb("home_faqs").default(`[
    {"q": "What industries do you specialize in?", "a": "We serve fintech, healthcare, SaaS, e-commerce, logistics, and enterprise software sectors."},
    {"q": "How long does a typical project take?", "a": "Projects range from 4 weeks (MVP) to 12+ months for enterprise platforms. We provide detailed timelines during discovery."},
    {"q": "Do you offer ongoing support?", "a": "Yes — we provide 24/7 support packages, dedicated DevOps, and continuous feature development."},
    {"q": "What makes CPCBusiness different?", "a": "We combine senior engineering talent with world-class design to deliver software that's both technically excellent and beautifully crafted."}
  ]`),

  // About page custom content
  aboutTitle: text("about_title").notNull().default("We Build Digital Empires"),
  aboutDescription: text("about_description").notNull().default("Founded in 2014, CPCBusiness has grown from a 3-person boutique agency to a 50+ strong enterprise digital powerhouse trusted by companies in 30+ countries."),
  aboutMission: text("about_mission").notNull().default("To empower ambitious companies with world-class digital solutions that drive measurable growth and lasting competitive advantage."),
  aboutVision: text("about_vision").notNull().default("To be the most trusted enterprise technology partner in the world — where innovation meets execution and every build becomes a landmark."),
  aboutValues: jsonb("about_values").default(`[
    {"title": "Excellence", "desc": "We set the bar high and clear it every time — no exceptions."},
    {"title": "Precision", "desc": "Every decision is deliberate. Every line of code is intentional."},
    {"title": "Partnership", "desc": "We don't just build for you — we build with you."},
    {"title": "Integrity", "desc": "Transparent communication, honest timelines, real results."}
  ]`),
  aboutTeam: jsonb("about_team").default(`[
    {"name": "Alex Petrov", "role": "CEO & Co-Founder", "dept": "Executive"},
    {"name": "Sarah Kim", "role": "CTO & Co-Founder", "dept": "Engineering"},
    {"name": "Marcus Johnson", "role": "Head of Design", "dept": "Design"},
    {"name": "Priya Sharma", "role": "VP Engineering", "dept": "Engineering"},
    {"name": "David Chen", "role": "Head of AI", "dept": "AI"},
    {"name": "Emma Wilson", "role": "Head of Operations", "dept": "Operations"}
  ]`),

  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable);
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
