import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save, Globe, Eye, Menu, Phone, Mail, MapPin, Share2, Sparkles, Plus, Trash2,
  ListOrdered, Star, MessageCircle, Info, Award, UserPlus, FileText
} from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { customFetch } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

type MenuLink = {
  label: string;
  href: string;
};

type StatItem = {
  value: string;
  label: string;
};

type TestimonialItem = {
  name: string;
  role: string;
  text: string;
  rating: number;
};

type FAQItem = {
  q: string;
  a: string;
};

type ValueItem = {
  title: string;
  desc: string;
};

type TeamItem = {
  name: string;
  role: string;
  dept: string;
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
    logoHeight: 56,
    logoHeightSidebar: 60,
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
    bannerImages: { heroBg: "", aboutBanner: "", servicesBanner: "" },
    
    // Expanded lists
    homeStats: [] as StatItem[],
    homeTechs: [] as string[],
    homeTestimonials: [] as TestimonialItem[],
    homeFaqs: [] as FAQItem[],
    aboutTitle: "We Build Digital Empires",
    aboutDescription: "Founded in 2014, CPCBusiness has grown from a 3-person boutique agency to a 50+ strong enterprise digital powerhouse trusted by companies in 30+ countries.",
    aboutMission: "To empower ambitious companies with world-class digital solutions that drive measurable growth and lasting competitive advantage.",
    aboutVision: "To be the most trusted enterprise technology partner in the world — where innovation meets execution and every build becomes a landmark.",
    aboutValues: [] as ValueItem[],
    aboutTeam: [] as TeamItem[]
  });

  // Local helper state for adding items
  const [newTech, setNewTech] = useState("");

  useEffect(() => {
    setLoading(true);
    customFetch<any>("/api/site-settings")
      .then((res) => {
        if (res) {
          // Parse JSON fields safely helper
          const parseJSON = (field: any, defaultVal: any) => {
            if (!field) return defaultVal;
            if (typeof field === "string") {
              try { return JSON.parse(field); } catch (e) { return defaultVal; }
            }
            return field;
          };

          setForm({
            ...res,
            menuLinks: parseJSON(res.menuLinks, []),
            bannerImages: parseJSON(res.bannerImages, { heroBg: "", aboutBanner: "", servicesBanner: "" }),
            homeStats: parseJSON(res.homeStats, []),
            homeTechs: parseJSON(res.homeTechs, []),
            homeTestimonials: parseJSON(res.homeTestimonials, []),
            homeFaqs: parseJSON(res.homeFaqs, []),
            aboutValues: parseJSON(res.aboutValues, []),
            aboutTeam: parseJSON(res.aboutTeam, [])
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
    setForm({ ...form, menuLinks: [...form.menuLinks, { label: "New Link", href: "/" }] });
  };
  const removeMenuLink = (index: number) => {
    const next = [...form.menuLinks];
    next.splice(index, 1);
    setForm({ ...form, menuLinks: next });
  };
  const updateMenuLink = (index: number, key: keyof MenuLink, val: string) => {
    const next = [...form.menuLinks];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, menuLinks: next });
  };

  const addStat = () => {
    setForm({ ...form, homeStats: [...form.homeStats, { value: "100%", label: "New Stat Metric" }] });
  };
  const removeStat = (index: number) => {
    const next = [...form.homeStats];
    next.splice(index, 1);
    setForm({ ...form, homeStats: next });
  };
  const updateStat = (index: number, key: keyof StatItem, val: string) => {
    const next = [...form.homeStats];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, homeStats: next });
  };

  const addTech = () => {
    if (!newTech.trim()) return;
    if (form.homeTechs.includes(newTech.trim())) return;
    setForm({ ...form, homeTechs: [...form.homeTechs, newTech.trim()] });
    setNewTech("");
  };
  const removeTech = (tech: string) => {
    setForm({ ...form, homeTechs: form.homeTechs.filter(t => t !== tech) });
  };

  const addTestimonial = () => {
    setForm({
      ...form,
      homeTestimonials: [...form.homeTestimonials, { name: "Client Name", role: "CEO, Company", text: "Incredible work!", rating: 5 }]
    });
  };
  const removeTestimonial = (index: number) => {
    const next = [...form.homeTestimonials];
    next.splice(index, 1);
    setForm({ ...form, homeTestimonials: next });
  };
  const updateTestimonial = (index: number, key: keyof TestimonialItem, val: any) => {
    const next = [...form.homeTestimonials];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, homeTestimonials: next });
  };

  const addFaq = () => {
    setForm({ ...form, homeFaqs: [...form.homeFaqs, { q: "Question?", a: "Answer text." }] });
  };
  const removeFaq = (index: number) => {
    const next = [...form.homeFaqs];
    next.splice(index, 1);
    setForm({ ...form, homeFaqs: next });
  };
  const updateFaq = (index: number, key: keyof FAQItem, val: string) => {
    const next = [...form.homeFaqs];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, homeFaqs: next });
  };

  const addValue = () => {
    setForm({ ...form, aboutValues: [...form.aboutValues, { title: "Value Title", desc: "Value description." }] });
  };
  const removeValue = (index: number) => {
    const next = [...form.aboutValues];
    next.splice(index, 1);
    setForm({ ...form, aboutValues: next });
  };
  const updateValue = (index: number, key: keyof ValueItem, val: string) => {
    const next = [...form.aboutValues];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, aboutValues: next });
  };

  const addTeamMember = () => {
    setForm({ ...form, aboutTeam: [...form.aboutTeam, { name: "Staff Name", role: "Developer", dept: "Engineering" }] });
  };
  const removeTeamMember = (index: number) => {
    const next = [...form.aboutTeam];
    next.splice(index, 1);
    setForm({ ...form, aboutTeam: next });
  };
  const updateTeamMember = (index: number, key: keyof TeamItem, val: string) => {
    const next = [...form.aboutTeam];
    next[index] = { ...next[index], [key]: val };
    setForm({ ...form, aboutTeam: next });
  };

  const tabs = [
    { id: "branding", label: "Branding & Logo", icon: Sparkles },
    { id: "hero", label: "Header & Hero", icon: Globe },
    { id: "menu", label: "Menu / Navigation", icon: Menu },
    { id: "stats", label: "Stats & Techs", icon: ListOrdered },
    { id: "testimonials", label: "Testimonials", icon: Star },
    { id: "faqs", label: "FAQs", icon: MessageCircle },
    { id: "about", label: "About Page", icon: Info },
    { id: "team", label: "Team Members", icon: UserPlus },
    { id: "footer", label: "Footer Settings", icon: Eye },
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
                      <label className="text-xs text-gray-500 mb-1.5 block">Logo Icon Image (Upload to ImageKit)</label>
                      <div className="flex gap-3">
                        <input
                          value={form.logoUrl || ""}
                          onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                          placeholder="https://ik.imagekit.io/..."
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                        <label className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2.5 rounded-lg cursor-pointer hover:bg-primary/90 transition-colors flex items-center justify-center min-w-[100px] select-none text-center">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              
                              const reader = new FileReader();
                              reader.onload = async () => {
                                try {
                                  toast({ title: "Uploading...", description: "Please wait while we upload the logo." });
                                  const base64 = (reader.result as string).split(",")[1];
                                  const res = await customFetch<any>("/api/imagekit/upload", {
                                    method: "POST",
                                    body: JSON.stringify({
                                      file: base64,
                                      fileName: file.name
                                    })
                                  });
                                  if (res && res.url) {
                                    setForm({ ...form, logoUrl: res.url });
                                    toast({ title: "Upload Success", description: "Logo uploaded to ImageKit." });
                                  }
                                } catch (err: any) {
                                  toast({ variant: "destructive", title: "Upload Failed", description: err.message || "Failed to upload logo." });
                                }
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Logo Height - Website Header (px)</label>
                        <input
                          type="number"
                          value={form.logoHeight || 56}
                          onChange={(e) => setForm({ ...form, logoHeight: parseInt(e.target.value) || 56 })}
                          placeholder="e.g. 56"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Logo Height - Sidebar Headers (px)</label>
                        <input
                          type="number"
                          value={form.logoHeightSidebar || 60}
                          onChange={(e) => setForm({ ...form, logoHeightSidebar: parseInt(e.target.value) || 60 })}
                          placeholder="e.g. 60"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                    </div>
                     <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-6">
                      <label className="text-xs text-gray-500 uppercase tracking-widest block mb-2">Live Logo Preview</label>
                      {form.logoUrl ? (
                        <div className="bg-slate-900 p-4 rounded-lg flex items-center justify-center animate-fadeIn">
                          <img src={form.logoUrl} alt="Logo Preview" style={{ height: `${form.logoHeight || 56}px` }} className="w-auto object-contain transition-all duration-300" />
                        </div>
                      ) : (
                        <div className="text-xl font-black tracking-tighter text-white">
                          {form.logoText}
                          <span className="text-primary">{form.logoHighlight}</span>
                        </div>
                      )}
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

                {activeTab === "stats" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-bold text-white">Homepage Statistics Counters</h3>
                        <button
                          type="button"
                          onClick={addStat}
                          className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Plus size={12} /> Add Stat
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {form.homeStats.map((stat, index) => (
                          <div key={index} className="bg-black/30 p-3 rounded-xl border border-white/5 flex gap-2 items-start">
                            <div className="flex-1 space-y-2">
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-0.5">Value (e.g. 500+)</label>
                                <input
                                  value={stat.value}
                                  onChange={(e) => updateStat(index, "value", e.target.value)}
                                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-white text-sm focus:outline-none focus:border-primary/50"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-gray-500 block mb-0.5">Label (e.g. Projects Delivered)</label>
                                <input
                                  value={stat.label}
                                  onChange={(e) => updateStat(index, "label", e.target.value)}
                                  className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-white text-sm focus:outline-none focus:border-primary/50"
                                />
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeStat(index)}
                              className="text-gray-600 hover:text-red-400 mt-5"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-5">
                      <h3 className="text-lg font-bold text-white mb-2">Technologies & Tech Stack Tags</h3>
                      <div className="flex gap-2 mb-4">
                        <input
                          value={newTech}
                          onChange={(e) => setNewTech(e.target.value)}
                          placeholder="e.g. React"
                          className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-primary/50 flex-1"
                        />
                        <button
                          type="button"
                          onClick={addTech}
                          className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Add Tag
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {form.homeTechs.map((tech) => (
                          <div key={tech} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300">
                            {tech}
                            <button
                              type="button"
                              onClick={() => removeTech(tech)}
                              className="text-gray-500 hover:text-red-400"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "testimonials" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">Homepage Client Testimonials</h3>
                      <button
                        type="button"
                        onClick={addTestimonial}
                        className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} /> Add Testimonial
                      </button>
                    </div>
                    <div className="space-y-4">
                      {form.homeTestimonials.map((test, index) => (
                        <div key={index} className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">Client Name</label>
                              <input
                                value={test.name}
                                onChange={(e) => updateTestimonial(index, "name", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">Role / Company</label>
                              <input
                                value={test.role}
                                onChange={(e) => updateTestimonial(index, "role", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">Rating (1 to 5 Stars)</label>
                              <select
                                value={test.rating}
                                onChange={(e) => updateTestimonial(index, "rating", parseInt(e.target.value))}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm"
                              >
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} Stars</option>)}
                              </select>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Testimonial Quote</label>
                            <textarea
                              value={test.text}
                              onChange={(e) => updateTestimonial(index, "text", e.target.value)}
                              rows={2}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm resize-none"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeTestimonial(index)}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "faqs" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">Homepage FAQ List</h3>
                      <button
                        type="button"
                        onClick={addFaq}
                        className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} /> Add FAQ
                      </button>
                    </div>
                    <div className="space-y-4">
                      {form.homeFaqs.map((faq, index) => (
                        <div key={index} className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Question</label>
                            <input
                              value={faq.q}
                              onChange={(e) => updateFaq(index, "q", e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Answer</label>
                            <textarea
                              value={faq.a}
                              onChange={(e) => updateFaq(index, "a", e.target.value)}
                              rows={2}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-sm resize-none"
                            />
                          </div>
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeFaq(index)}
                              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-400"
                            >
                              <Trash2 size={12} /> Remove FAQ
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "about" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white">About Us Main Copy</h3>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">About Section Title / Heading</label>
                        <input
                          value={form.aboutTitle}
                          onChange={(e) => setForm({ ...form, aboutTitle: e.target.value })}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">About Description Paragraph</label>
                        <textarea
                          value={form.aboutDescription}
                          onChange={(e) => setForm({ ...form, aboutDescription: e.target.value })}
                          rows={4}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/5 pt-5">
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Our Mission Statement</label>
                        <textarea
                          value={form.aboutMission}
                          onChange={(e) => setForm({ ...form, aboutMission: e.target.value })}
                          rows={3}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm resize-none"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1.5 block">Our Vision Statement</label>
                        <textarea
                          value={form.aboutVision}
                          onChange={(e) => setForm({ ...form, aboutVision: e.target.value })}
                          rows={3}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm resize-none"
                        />
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-white">Company Values</h3>
                        <button
                          type="button"
                          onClick={addValue}
                          className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <Plus size={12} /> Add Value
                        </button>
                      </div>
                      <div className="space-y-3">
                        {form.aboutValues.map((val, index) => (
                          <div key={index} className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-2">
                            <div className="flex items-center gap-3">
                              <input
                                value={val.title}
                                onChange={(e) => updateValue(index, "title", e.target.value)}
                                placeholder="Value Title"
                                className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => removeValue(index)}
                                className="text-gray-600 hover:text-red-400"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            <textarea
                              value={val.desc}
                              onChange={(e) => updateValue(index, "desc", e.target.value)}
                              placeholder="Value explanation..."
                              rows={2}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "team" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold text-white">Leadership & Team Members</h3>
                      <button
                        type="button"
                        onClick={addTeamMember}
                        className="flex items-center gap-1 bg-white/5 border border-white/10 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Plus size={12} /> Add Member
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {form.aboutTeam.map((member, index) => (
                        <div key={index} className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-3 relative group">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-0.5">Name</label>
                            <input
                              value={member.name}
                              onChange={(e) => updateTeamMember(index, "name", e.target.value)}
                              className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-white text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">Role</label>
                              <input
                                value={member.role}
                                onChange={(e) => updateTeamMember(index, "role", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-gray-500 block mb-0.5">Department</label>
                              <input
                                value={member.dept}
                                onChange={(e) => updateTeamMember(index, "dept", e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1 text-white text-sm"
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeTeamMember(index)}
                            className="absolute top-2 right-2 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={14} />
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
