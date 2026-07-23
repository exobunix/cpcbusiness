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
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable);
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
