import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import PublicNav from "@/components/layouts/PublicNav";
import PublicFooter from "@/components/layouts/PublicFooter";
import { customFetch } from "@workspace/api-client-react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const footerEmail = settings?.footerEmail ?? "hello@cpcbusiness.com";
  const footerPhone = settings?.footerPhone ?? "+1 (800) CPC-BIZZ";
  const footerAddress = settings?.footerAddress ?? "San Francisco, CA 94102";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      <PublicNav />

      <section className="pt-32 pb-16 text-center px-6 relative">
        <div className="absolute inset-0 aurora-bg" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Contact</span>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mt-4 mb-4">Let's Talk</h1>
            <p className="text-muted-foreground">Ready to start your next project? We're here to help.</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24 grid grid-cols-1 md:grid-cols-2 gap-10">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <h2 className="text-2xl font-black text-foreground mb-6">Get in Touch</h2>
          <div className="space-y-5">
            {[
              { icon: Mail, label: "Email", value: footerEmail },
              { icon: Phone, label: "Phone", value: footerPhone },
              { icon: MapPin, label: "Address", value: footerAddress },
            ].map((c) => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <c.icon size={16} className="text-primary" />
                </div>
                <div>
                  <div className="text-muted-foreground text-xs font-medium uppercase tracking-wider mb-0.5">{c.label}</div>
                  <div className="text-foreground text-sm">{c.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 glass rounded-xl p-5">
            <h3 className="text-foreground font-bold mb-1">Schedule a Discovery Call</h3>
            <p className="text-muted-foreground text-sm mb-4">Book a 30-minute session with our team to discuss your project.</p>
            <button className="w-full bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors">
              Book a Call
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          {sent ? (
            <div className="glass rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center">
              <CheckCircle2 size={48} className="text-primary mb-4" />
              <h3 className="text-foreground font-black text-xl mb-2">Message Sent!</h3>
              <p className="text-muted-foreground">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-7 space-y-5">
              <h2 className="text-xl font-black text-foreground">Send a Message</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">First Name</label>
                  <input required className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="John" />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Last Name</label>
                  <input required className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
                <input type="email" required className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors" placeholder="john@company.com" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Project Type</label>
                <select className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors">
                  <option value="" className="bg-card">Select service...</option>
                  <option className="bg-card">Web Development</option>
                  <option className="bg-card">Mobile App</option>
                  <option className="bg-card">AI / Machine Learning</option>
                  <option className="bg-card">SaaS Platform</option>
                  <option className="bg-card">Cloud Solutions</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Message</label>
                <textarea required rows={4} className="w-full bg-card border border-border rounded-lg px-3 py-2.5 text-foreground text-sm focus:outline-none focus:border-primary/50 transition-colors resize-none" placeholder="Tell us about your project..." />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-3 text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? "Sending..." : <><Send size={14} /> Send Message</>}
              </motion.button>
            </form>
          )}
        </motion.div>
      </section>

      <PublicFooter />
    </div>
  );
}
