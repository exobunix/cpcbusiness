import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Globe } from "lucide-react";
import PublicNav from "@/components/layouts/PublicNav";
import PublicFooter from "@/components/layouts/PublicFooter";
import { useGetPortfolioItems } from "@workspace/api-client-react";

const categories = ["All", "Web Development", "Mobile", "SaaS", "AI", "E-commerce", "Design"];

const defaultPortfolio = [
  { id: 1, title: "NexusFinance Platform", category: "SaaS", client: "NexusFinance", description: "Enterprise SaaS platform with real-time trading, analytics dashboards, and multi-tenant architecture.", shortDescription: "Enterprise fintech SaaS platform", technologies: ["React", "Node.js", "PostgreSQL", "AWS"], isFeatured: true, results: "3x revenue growth in 6 months" },
  { id: 2, title: "OrbitalAI Assistant", category: "AI", client: "Orbital Labs", description: "AI-powered business intelligence platform with natural language querying and predictive analytics.", shortDescription: "AI-powered BI platform", technologies: ["Python", "OpenAI", "React", "TensorFlow"], isFeatured: true, results: "60% faster decision-making" },
  { id: 3, title: "MetroCommerce Store", category: "E-commerce", client: "Metro Retail", description: "High-performance e-commerce platform handling 100k+ daily transactions.", shortDescription: "High-performance e-commerce platform", technologies: ["Next.js", "Stripe", "PostgreSQL", "Redis"], isFeatured: true, results: "250% increase in conversions" },
  { id: 4, title: "HealthTrack Mobile", category: "Mobile", client: "HealthTech Inc", description: "Cross-platform mobile app for patient health monitoring and telemedicine.", shortDescription: "Patient health monitoring app", technologies: ["React Native", "Node.js", "HIPAA-compliant DB"], isFeatured: false, results: "50k+ active users" },
  { id: 5, title: "LogiFlow Platform", category: "SaaS", client: "LogiCorp", description: "Enterprise logistics management platform with real-time tracking and automated dispatch.", shortDescription: "Logistics management SaaS", technologies: ["Vue.js", "Python", "PostgreSQL", "Maps API"], isFeatured: false, results: "40% cost reduction" },
  { id: 6, title: "BrandCraft Design System", category: "Design", client: "BrandCo", description: "Comprehensive design system with 200+ components, design tokens, and Figma integration.", shortDescription: "Enterprise design system", technologies: ["Figma", "Storybook", "React", "Tailwind"], isFeatured: false, results: "80% faster design-to-dev" },
];

const categoryColors: Record<string, string> = {
  SaaS: "text-blue-600 dark:text-blue-400",
  AI: "text-purple-600 dark:text-purple-400",
  "E-commerce": "text-orange-600 dark:text-orange-400",
  Mobile: "text-cyan-600 dark:text-cyan-400",
  Design: "text-pink-600 dark:text-pink-400",
  "Web Development": "text-primary",
};

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { data: portfolio } = useGetPortfolioItems();
  const displayPortfolio = (portfolio && portfolio.length > 0) ? portfolio : defaultPortfolio;

  const filtered = displayPortfolio.filter((item: any) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = !search || item.title.toLowerCase().includes(search.toLowerCase()) || item.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pt-20">
      <PublicNav />

      <section className="pt-32 pb-16 text-center px-6 relative">
        <div className="absolute inset-0 aurora-bg" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Portfolio</span>
            <h1 className="text-5xl md:text-6xl font-black text-foreground mt-4 mb-6">Our Work Speaks</h1>
            <p className="text-muted-foreground text-lg">500+ projects. Real results. Measurable impact.</p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "border border-border text-muted-foreground hover:text-foreground hover:bg-secondary/50 bg-card"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 w-full md:w-64"
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + search}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl overflow-hidden group"
              >
                <div className="h-44 bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center relative border-b border-border">
                  {item.isFeatured && (
                    <span className="absolute top-3 left-3 text-xs bg-primary/20 border border-primary/30 text-primary px-2.5 py-1 rounded-full font-medium">
                      Featured
                    </span>
                  )}
                  <Globe size={40} className="text-primary/25 group-hover:text-primary/40 transition-colors" />
                </div>
                <div className="p-5">
                  <span className={`text-xs font-bold uppercase tracking-wider ${categoryColors[item.category] ?? "text-primary"}`}>
                    {item.category}
                  </span>
                  <h3 className="text-foreground font-bold text-lg mt-1 mb-1">{item.title}</h3>
                  {item.client && <p className="text-muted-foreground/60 text-xs mb-2">Client: {item.client}</p>}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 line-clamp-2">{item.shortDescription || item.description}</p>
                  {item.results && (
                    <p className="text-primary text-xs font-semibold mb-3">Result: {item.results}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {(item.technologies as string[]).slice(0, 4).map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">No projects match your search.</div>
        )}
      </section>

      <PublicFooter />
    </div>
  );
}
