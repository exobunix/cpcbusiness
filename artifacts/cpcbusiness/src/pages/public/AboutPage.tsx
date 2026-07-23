import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Target, Eye, Heart, Users } from "lucide-react";
import PublicNav from "@/components/layouts/PublicNav";
import PublicFooter from "@/components/layouts/PublicFooter";
import { customFetch } from "@workspace/api-client-react";

const valueIcons: Record<string, any> = {
  "Excellence": Award,
  "Precision": Target,
  "Partnership": Users,
  "Integrity": Heart,
};

const defaultValues = [
  { icon: Award, title: "Excellence", desc: "We set the bar high and clear it every time — no exceptions." },
  { icon: Target, title: "Precision", desc: "Every decision is deliberate. Every line of code is intentional." },
  { icon: Users, title: "Partnership", desc: "We don't just build for you — we build with you." },
  { icon: Heart, title: "Integrity", desc: "Transparent communication, honest timelines, real results." },
];

const defaultTeam = [
  { name: "Alex Petrov", role: "CEO & Co-Founder", dept: "Executive" },
  { name: "Sarah Kim", role: "CTO & Co-Founder", dept: "Engineering" },
  { name: "Marcus Johnson", role: "Head of Design", dept: "Design" },
  { name: "Priya Sharma", role: "VP Engineering", dept: "Engineering" },
  { name: "David Chen", role: "Head of AI", dept: "AI" },
  { name: "Emma Wilson", role: "Head of Operations", dept: "Operations" },
];

export default function AboutPage() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const aboutTitle = settings?.aboutTitle ?? "We Build Digital Empires";
  const aboutDescription = settings?.aboutDescription ?? "Founded in 2014, CPCBusiness has grown from a 3-person boutique agency to a 50+ strong enterprise digital powerhouse trusted by companies in 30+ countries.";
  const aboutMission = settings?.aboutMission ?? "To empower ambitious companies with world-class digital solutions that drive measurable growth and lasting competitive advantage.";
  const aboutVision = settings?.aboutVision ?? "To be the most trusted enterprise technology partner in the world — where innovation meets execution and every build becomes a landmark.";

  const dbValues = settings?.aboutValues && Array.isArray(settings.aboutValues) && settings.aboutValues.length > 0
    ? settings.aboutValues
    : defaultValues;

  const dbTeam = settings?.aboutTeam && Array.isArray(settings.aboutTeam) && settings.aboutTeam.length > 0
    ? settings.aboutTeam
    : defaultTeam;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      <PublicNav />

      <section className="pt-32 pb-20 text-center px-6 relative">
        <div className="absolute inset-0 aurora-bg" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">About Us</span>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mt-4 mb-6">{aboutTitle}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{aboutDescription}</p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { icon: Target, title: "Our Mission", text: aboutMission },
          { icon: Eye, title: "Our Vision", text: aboutVision },
        ].map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: i === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-2xl p-8"
          >
            <item.icon size={32} className="text-primary mb-5" />
            <h2 className="text-2xl font-black text-foreground mb-3">{item.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{item.text}</p>
          </motion.div>
        ))}
      </section>

      {/* Values */}
      <section className="py-16 bg-card/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl font-black text-foreground">Our Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {dbValues.map((v: any, i: number) => {
              const Icon = valueIcons[v.title] ?? Award;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="glass rounded-xl p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                    <Icon size={20} className="text-primary" />
                  </div>
                  <h3 className="text-foreground font-bold mb-2">{v.title}</h3>
                  <p className="text-muted-foreground text-sm">{v.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Leadership</span>
          <h2 className="text-4xl font-black text-foreground mt-3">The Team Behind the Magic</h2>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {dbTeam.map((member: any, i: number) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="glass rounded-xl p-6 flex items-center gap-4"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg shrink-0">
                {member.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <div>
                <h3 className="text-foreground font-bold">{member.name}</h3>
                <p className="text-muted-foreground text-sm">{member.role}</p>
                <span className="text-xs text-primary/70 font-medium">{member.dept}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
