import { motion } from "framer-motion";
import { ArrowRight, Code2, Smartphone, Brain, Cloud, ShieldCheck, BarChart3, Globe, Settings, Package } from "lucide-react";
import PublicNav from "@/components/layouts/PublicNav";
import PublicFooter from "@/components/layouts/PublicFooter";
import { useGetServices } from "@workspace/api-client-react";

const iconMap: Record<string, any> = {
  "Web Development": Code2,
  "Mobile App Development": Smartphone,
  "AI Development": Brain,
  "Cloud Solutions": Cloud,
  "DevOps": ShieldCheck,
  "Digital Marketing": BarChart3,
  "SaaS Development": Globe,
  "UI/UX Design": Package,
};

const defaultServices = [
  { id: 1, title: "Web Development", category: "Development", shortDescription: "Enterprise-grade web applications", features: ["React/Next.js", "Node.js APIs", "PostgreSQL", "AWS Deployment"], technologies: ["React", "TypeScript", "Node.js"] },
  { id: 2, title: "Mobile App Development", category: "Mobile", shortDescription: "Native iOS & Android applications", features: ["React Native", "Flutter", "Native iOS/Android", "App Store deployment"], technologies: ["React Native", "Flutter", "Swift"] },
  { id: 3, title: "AI Development", category: "AI", shortDescription: "Machine learning & AI-powered solutions", features: ["Custom ML models", "NLP systems", "Computer vision", "AI automation"], technologies: ["Python", "TensorFlow", "OpenAI"] },
  { id: 4, title: "SaaS Development", category: "SaaS", shortDescription: "Full-featured SaaS platforms", features: ["Multi-tenant architecture", "Subscription billing", "Analytics dashboards", "Enterprise SSO"], technologies: ["React", "Node.js", "PostgreSQL"] },
  { id: 5, title: "Cloud Solutions", category: "Cloud", shortDescription: "AWS, GCP, Azure architecture", features: ["Cloud migration", "Kubernetes orchestration", "CI/CD pipelines", "Cost optimization"], technologies: ["AWS", "Docker", "Kubernetes"] },
  { id: 6, title: "UI/UX Design", category: "Design", shortDescription: "World-class design systems", features: ["Design systems", "Prototyping", "User research", "Accessibility"], technologies: ["Figma", "Framer", "Storybook"] },
  { id: 7, title: "DevOps", category: "DevOps", shortDescription: "Infrastructure automation", features: ["CI/CD", "Monitoring", "Security audits", "Performance"], technologies: ["GitHub Actions", "Terraform", "Prometheus"] },
  { id: 8, title: "Digital Marketing", category: "Marketing", shortDescription: "Data-driven marketing campaigns", features: ["SEO optimization", "PPC campaigns", "Analytics", "Content strategy"], technologies: ["Google Analytics", "HubSpot", "Semrush"] },
];

export default function ServicesPage() {
  const { data: services } = useGetServices();
  const displayServices = (services && services.length > 0) ? services : defaultServices;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      <PublicNav />

      <section className="pt-32 pb-20 text-center px-6 relative">
        <div className="absolute inset-0 aurora-bg" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Our Services</span>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mt-4 mb-6">What We Build</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">From concept to deployment — we architect digital solutions that define industries.</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayServices.map((s: any, i) => {
            const Icon = iconMap[s.title] ?? Settings;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="glass rounded-2xl p-8 group"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{s.category}</span>
                    <h3 className="text-foreground font-bold text-xl mt-1 mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-4">{s.shortDescription || s.description?.slice(0, 100)}</p>
                    {s.features && s.features.length > 0 && (
                      <ul className="space-y-1.5 mb-4">
                        {(s.features as string[]).slice(0, 4).map((f: string) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {s.technologies && s.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(s.technologies as string[]).slice(0, 4).map((t: string) => (
                          <span key={t} className="text-xs px-2.5 py-1 rounded-lg bg-card border border-border text-muted-foreground">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
