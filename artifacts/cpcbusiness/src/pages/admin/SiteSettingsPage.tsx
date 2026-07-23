import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Eye, Menu, Phone, Mail, MapPin, Share2, Image as ImageIcon, Sparkles, Plus, Trash2, ArrowRight } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type MenuLink = {
  label: string;
  href: string;
};

export default function SiteSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("branding");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    logoText: "CPC",
    logoHighlight: "BUSINESS",
    logoUrl: "",
    headerAnnouncement: "Enterprise Digital Agency Platform",
    headerTitle: "Build the Future",
    headerSubtitle: "Digital Empire",
    headerDescription: "We architect world-class digital solutions — from enterprise SaaS to AI-powered platforms — that define industries and outlast trends.",
    headerCtaText: "Explore Services",
    headerCtaLink: "/services",
    headerSecondaryCtaText: "View Portfolio",
    headerSecondaryCtaLink: "/portfolio",
    footerAbout: "Enterprise-grade digital solutions for ambitious companies worldwide.",
    footerCopyright: "© 2026 CPCBusiness. All rights reserved.",
    footerEmail: "hello@cpcbusiness.com",
    footerPhone: "+1 (800) CPC-BIZZ",
    footerAddress: "San Francisco, CA 94102",
    socialTwitter: "https://x.com",
    socialLinkedin: "https://linkedin.com",
    socialGithub: "https://github.com",
    socialInstagram: "https://instagram.com",
    menuLinks: [] as MenuLink[],
    bannerImages: { heroBg: "", aboutBanner: "", servicesBanner: "" }
  });

  useEffect(() => {
    setLoading(true);
    customFetch<any>("/api/site-settings")
      .then((res) => {
        if (res) {
          // If menuLinks or bannerImages come as string, parse them
          let menuLinks = res.menuLinks || [];
          if (typeof menuLinks === "string") {
            try { menuLinks = JSON.parse(menuLinks); } catch (e) {}
          }
          let bannerImages = res.bannerImages || { heroBg: "", aboutBanner: "", servicesBanner: "" };
          if (typeof bannerImages === "string") {
            try { bannerImages = JSON.parse(bannerImages); } catch (e) {}
          }
          setForm({
            ...res,
            menuLinks,
            bannerImages: {
              heroBg: bannerImages.heroBg || "",
              aboutBanner: bannerImages.aboutBanner || "",
              servicesBanner: bannerImages.servicesBanner || ""
            }
          });
        }
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Error fetching settings",
          description: err.message || "Could not retrieve website settings."
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await customFetch("/api/site-settings", {
        method: "PATCH",
        body: JSON.stringify(form)
      });
      toast({
        title: "Settings Saved",
        description: "Website content settings updated successfully."
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error saving settings",
        description: err.message || "Failed to update settings."
      });
    } finally {
      setSaving(false);
    }
  };

  const addMenuLink = () => {
    setForm({
      ...form,
      menuLinks: [...form.menuLinks, { label: "New Link", href: "/" }]
    });
  };

  const removeMenuLink = (index: number) => {
    const next = [...form.menuLinks];
    next.splice(index, 1);
    setForm({ ...form, menuLinks: next });
  };

  const updateMenuLink = (index: number, key: "label" | "href", val: string) => {
    const next = [...form.menuLinks];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, menuLinks: next });
  };

  const tabs = [
    { id: "branding", label: "Branding & Logo", icon: Sparkles },
    { id: "hero", label: "Header & Hero", icon: Globe },
    { id: "menu", label: "Menu / Navigation", icon: Menu },
    { id: "footer", label: "Footer", icon: Eye },
    { id: "contact", label: "Contact Info", icon: Phone },
    { id: "socials", label: "Social Media", icon: Share2 }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Site Settings & CMS</h1>
            <p className="text-gray-500 text-sm mt-1">Manage global website copy, branding, navigation, and visual theme.</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-bold emerald-glow hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {loading ? (
          <div className="space-y-5">
            <div className="h-12 bg-white/5 rounded-xl animate-pulse w-full" />
            <div className="h-64 bg-white/5 rounded-xl animate-pulse w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Tabs Sidebar */}
            <div className="lg:col-span-1 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible gap-1 pb-3 lg:pb-0 border-b lg:border-b-0 lg:border-r border-white/5 pr-0 lg:pr-4">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all shrink-0 text-left ${
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab content area */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-6">
                {activeTab === "branding" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Website Logo & Branding</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Logo Standard Text</label>
                        <input
                          value={form.logoText}
                          onChange={(e) => setForm({ ...form, logoText: e.target.value })}
                          placeholder="e.g. CPC"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Logo Highlight Text</label>
                        <input
                          value={form.logoHighlight}
                          onChange={(e) => setForm({ ...form, logoHighlight: e.target.value })}
                          placeholder="e.g. BUSINESS"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Logo Icon Image URL (Optional)</label>
                      <input
                        value={form.logoUrl || ""}
                        onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
                      <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Live Logo Preview</label>
                      <div className="text-xl font-black tracking-tighter text-white">
                        {form.logoText}
                        <span className="text-primary">{form.logoHighlight}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "hero" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Hero Header Content</h3>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Top Announcement Badge</label>
                      <input
                        value={form.headerAnnouncement}
                        onChange={(e) => setForm({ ...form, headerAnnouncement: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Hero Title Main</label>
                        <input
                          value={form.headerTitle}
                          onChange={(e) => setForm({ ...form, headerTitle: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Hero Title Highlight (Gradient Color)</label>
                        <input
                          value={form.headerSubtitle}
                          onChange={(e) => setForm({ ...form, headerSubtitle: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Hero Description Text</label>
                      <textarea
                        value={form.headerDescription}
                        onChange={(e) => setForm({ ...form, headerDescription: e.target.value })}
                        rows={3}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Primary CTA Label</label>
                        <input
                          value={form.headerCtaText}
                          onChange={(e) => setForm({ ...form, headerCtaText: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Primary CTA Target Route</label>
                        <input
                          value={form.headerCtaLink}
                          onChange={(e) => setForm({ ...form, headerCtaLink: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Secondary CTA Label</label>
                        <input
                          value={form.headerSecondaryCtaText}
                          onChange={(e) => setForm({ ...form, headerSecondaryCtaText: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Secondary CTA Target Route</label>
                        <input
                          value={form.headerSecondaryCtaLink}
                          onChange={(e) => setForm({ ...form, headerSecondaryCtaLink: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "menu" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">Header Navigation Links</h3>
                      <button
                        type="button"
                        onClick={addMenuLink}
                        className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} /> Add Link
                      </button>
                    </div>

                    <div className="space-y-3">
                      {form.menuLinks.map((link, index) => (
                        <div key={index} className="flex items-center gap-3 bg-black/30 p-3 rounded-xl border border-white/5">
                          <div className="grid grid-cols-2 gap-3 flex-1">
                            <div>
                              <label className="text-[10px] text-gray-500 mb-1 block">Link Text</label>
                              <input
                                value={link.label}
                                onChange={(e) => updateMenuLink(index, "label", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 mb-1 block">Link Destination</label>
                              <input
                                value={link.href}
                                onChange={(e) => updateMenuLink(index, "href", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMenuLink(index)}
                            className="mt-4 p-2 text-gray-600 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "footer" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Footer Layout Content</h3>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Footer About Summary Description</label>
                      <textarea
                        value={form.footerAbout}
                        onChange={(e) => setForm({ ...form, footerAbout: e.target.value })}
                        rows={3}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Footer Copyright Text</label>
                      <input
                        value={form.footerCopyright}
                        onChange={(e) => setForm({ ...form, footerCopyright: e.target.value })}
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                )}

                {activeTab === "contact" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Contact Information Settings</h3>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Contact Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 text-gray-500" size={16} />
                        <input
                          value={form.footerEmail}
                          onChange={(e) => setForm({ ...form, footerEmail: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Contact Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 text-gray-500" size={16} />
                        <input
                          value={form.footerPhone}
                          onChange={(e) => setForm({ ...form, footerPhone: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Office / Agency Address Location</label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-500" size={16} />
                        <input
                          value={form.footerAddress}
                          onChange={(e) => setForm({ ...form, footerAddress: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "socials" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white mb-4">Social Media Profile Links</h3>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">X / Twitter Profile URL</label>
                      <input
                        value={form.socialTwitter}
                        onChange={(e) => setForm({ ...form, socialTwitter: e.target.value })}
                        placeholder="https://x.com/username"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">LinkedIn Profile URL</label>
                      <input
                        value={form.socialLinkedin}
                        onChange={(e) => setForm({ ...form, socialLinkedin: e.target.value })}
                        placeholder="https://linkedin.com/company/name"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">GitHub Organization / Account URL</label>
                      <input
                        value={form.socialGithub}
                        onChange={(e) => setForm({ ...form, socialGithub: e.target.value })}
                        placeholder="https://github.com/org"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1.5 block">Instagram Account URL</label>
                      <input
                        value={form.socialInstagram}
                        onChange={(e) => setForm({ ...form, socialInstagram: e.target.value })}
                        placeholder="https://instagram.com/name"
                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                      />
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
