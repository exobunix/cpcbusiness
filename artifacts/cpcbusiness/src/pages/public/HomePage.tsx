import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight, Code2, Smartphone, Brain, Cloud, ShieldCheck,
  BarChart3, Globe, Users, Star, CheckCircle2, Zap, Award, TrendingUp
} from "lucide-react";
import PublicNav from "@/components/layouts/PublicNav";
import PublicFooter from "@/components/layouts/PublicFooter";
import { useGetServices, useGetPortfolioItems, customFetch } from "@workspace/api-client-react";

const stats = [
  { value: "500+", label: "Projects Delivered" },
  { value: "200+", label: "Enterprise Clients" },
  { value: "10+", label: "Years Experience" },
  { value: "99%", label: "Client Satisfaction" },
];

const techs = ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS", "Docker", "Python", "GraphQL", "Kubernetes", "TensorFlow", "Next.js", "MongoDB"];

const testimonials = [
  { name: "Sarah Chen", role: "CTO, Nexus Corp", text: "CPCBusiness transformed our entire digital infrastructure. The quality of their work is unparalleled.", rating: 5 },
  { name: "Marcus Williams", role: "CEO, Orbital Ventures", text: "Working with CPCBusiness felt like having a world-class tech team as an extension of our own.", rating: 5 },
  { name: "Priya Patel", role: "VP Engineering, DataStream", text: "Their AI solutions gave us a 3x increase in operational efficiency. Absolutely remarkable team.", rating: 5 },
];

const faqs = [
  { q: "What industries do you specialize in?", a: "We serve fintech, healthcare, SaaS, e-commerce, logistics, and enterprise software sectors." },
  { q: "How long does a typical project take?", a: "Projects range from 4 weeks (MVP) to 12+ months for enterprise platforms. We provide detailed timelines during discovery." },
  { q: "Do you offer ongoing support?", a: "Yes — we provide 24/7 support packages, dedicated DevOps, and continuous feature development." },
  { q: "What makes CPCBusiness different?", a: "We combine senior engineering talent with world-class design to deliver software that's both technically excellent and beautifully crafted." },
];

const serviceIcons: Record<string, any> = {
  "Web Development": Code2,
  "Mobile App Development": Smartphone,
  "AI Development": Brain,
  "Cloud Solutions": Cloud,
  "UI/UX Design": Star,
  "DevOps": ShieldCheck,
  "Digital Marketing": BarChart3,
  "SaaS Development": Globe,
};

export default function HomePage() {

  const { data: services } = useGetServices();
  const { data: portfolio } = useGetPortfolioItems();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const headerAnnouncement = settings?.headerAnnouncement ?? "Enterprise Digital Agency Platform";
  const headerTitle = settings?.headerTitle ?? "Build the Future";
  const headerSubtitle = settings?.headerSubtitle ?? "Digital Empire";
  const headerDescription = settings?.headerDescription ?? "We architect world-class digital solutions — from enterprise SaaS to AI-powered platforms — that define industries and outlast trends.";
  const headerCtaText = settings?.headerCtaText ?? "Explore Services";
  const headerCtaLink = settings?.headerCtaLink ?? "/services";
  const headerSecondaryCtaText = settings?.headerSecondaryCtaText ?? "View Portfolio";
  const headerSecondaryCtaLink = settings?.headerSecondaryCtaLink ?? "/portfolio";


  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />

      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* animated bg */}
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        {/* grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

        <motion.div style={{ y }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-8">
              <Zap size={12} /> {headerAnnouncement}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-8"
          >
            {headerTitle}<br />
            <span className="gradient-text">{headerSubtitle}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-12"
          >
            {headerDescription}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href={headerCtaLink}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold text-sm cursor-pointer emerald-glow hover:bg-primary/90 transition-all"
              >
                {headerCtaText} <ArrowRight size={16} />
              </motion.span>
            </Link>
            <Link href={headerSecondaryCtaLink}>
              <motion.span
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-sm cursor-pointer hover:bg-white/5 transition-all"
              >
                {headerSecondaryCtaText}
              </motion.span>
            </Link>
          </motion.div>
        </motion.div>


        <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="w-5 h-8 border-2 border-white/10 rounded-full flex justify-center pt-1.5">
            <div className="w-1 h-2 bg-primary rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="py-20 border-y border-white/5 bg-black/40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-black gradient-text mb-2">{s.value}</div>
                <div className="text-gray-500 text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">What We Build</span>
          <h2 className="text-4xl md:text-5xl font-black text-white mt-3">Enterprise-Grade Services</h2>
          <p className="text-gray-500 mt-4 max-w-xl mx-auto">From cutting-edge AI to bulletproof infrastructure, we deliver complete digital transformation.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(services?.slice(0, 6) ?? [
            { id: 1, title: "Web Development", shortDescription: "Enterprise web applications built with modern stack", category: "Development" },
            { id: 2, title: "Mobile App Development", shortDescription: "Native iOS & Android apps that scale", category: "Mobile" },
            { id: 3, title: "AI Development", shortDescription: "Machine learning and AI-powered solutions", category: "AI" },
            { id: 4, title: "SaaS Development", shortDescription: "Full-featured SaaS platforms from day one", category: "SaaS" },
            { id: 5, title: "Cloud Solutions", shortDescription: "AWS, GCP, Azure architecture and DevOps", category: "Cloud" },
            { id: 6, title: "UI/UX Design", shortDescription: "World-class design systems and user experiences", category: "Design" },
          ]).map((s: any, i) => {
            const Icon = serviceIcons[s.title] ?? Code2;
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass rounded-2xl p-6 group cursor-pointer hover:border-primary/20 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <Icon size={20} className="text-primary" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{s.shortDescription || s.description?.slice(0, 80) + "..." || "Premium enterprise solutions"}</p>
                <div className="mt-5 flex items-center text-primary text-sm font-semibold gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight size={14} />
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Link href="/services">
            <motion.span
              whileHover={{ scale: 1.03 }}
              className="inline-flex items-center gap-2 border border-white/10 text-white px-7 py-3 rounded-full text-sm font-semibold cursor-pointer hover:bg-white/5 transition-all"
            >
              View All Services <ArrowRight size={14} />
            </motion.span>
          </Link>
        </div>
      </section>

      {/* PORTFOLIO PREVIEW */}
      {portfolio && portfolio.length > 0 && (
        <section className="py-24 bg-black/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <span className="text-primary text-sm font-semibold uppercase tracking-widest">Our Work</span>
              <h2 className="text-4xl md:text-5xl font-black text-white mt-3">Featured Projects</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolio.filter((p: any) => p.isFeatured).slice(0, 3).map((item: any, i: number) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl overflow-hidden group"
                >
                  <div className="h-48 bg-gradient-to-br from-primary/10 to-emerald-900/20 flex items-center justify-center">
                    <Globe size={48} className="text-primary/30 group-hover:text-primary/50 transition-colors" />
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-white font-bold mt-1">{item.title}</h3>
                    <p className="text-gray-500 text-sm mt-2 line-clamp-2">{item.shortDescription || item.description}</p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {(item.technologies as string[]).slice(0, 3).map((t: string) => (
                        <span key={t} className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary/80">{t}</span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/portfolio">
                <motion.span whileHover={{ scale: 1.03 }} className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-full text-sm font-bold cursor-pointer hover:bg-primary/90 transition-all">
                  View All Projects <ArrowRight size={14} />
                </motion.span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* TECH STACK */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">Technology</span>
          <h2 className="text-4xl font-black text-white mt-3">Built with Best-in-Class Stack</h2>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-3">
          {techs.map((t, i) => (
            <motion.span
              key={t}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="px-5 py-2.5 rounded-xl border border-white/8 bg-white/3 text-gray-400 text-sm font-medium hover:border-primary/30 hover:text-primary transition-all cursor-default"
            >
              {t}
            </motion.span>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-black/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <span className="text-primary text-sm font-semibold uppercase tracking-widest">Testimonials</span>
            <h2 className="text-4xl font-black text-white mt-3">What Our Clients Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-2xl p-7"
              >
                <div className="flex mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-primary fill-primary" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div>
                  <div className="text-white font-bold text-sm">{t.name}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-primary text-sm font-semibold uppercase tracking-widest">FAQ</span>
          <h2 className="text-4xl font-black text-white mt-3">Common Questions</h2>
        </motion.div>
        <div className="space-y-4">
          {faqs.map((f, i) => (
            <motion.div
              key={f.q}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass rounded-xl p-6"
            >
              <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-3">
                <CheckCircle2 size={16} className="text-primary shrink-0" />
                {f.q}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed pl-7">{f.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 aurora-bg opacity-50" />
            <div className="relative z-10">
              <Award size={40} className="text-primary mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Ready to Build Something Legendary?</h2>
              <p className="text-gray-400 mb-10 max-w-lg mx-auto">Let's discuss your project. Our team is ready to architect your next breakthrough.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold cursor-pointer hover:bg-primary/90 transition-all emerald-glow"
                  >
                    Start a Project <ArrowRight size={16} />
                  </motion.span>
                </Link>
                <Link href="/portfolio">
                  <motion.span
                    whileHover={{ scale: 1.04 }}
                    className="flex items-center gap-2 border border-white/15 text-white px-8 py-4 rounded-full font-bold cursor-pointer hover:bg-white/5 transition-all"
                  >
                    Browse Work
                  </motion.span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
