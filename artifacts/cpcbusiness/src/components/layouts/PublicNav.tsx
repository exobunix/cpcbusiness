import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const logoText = settings?.logoText ?? "CPC";
  const logoHighlight = settings?.logoHighlight ?? "BUSINESS";
  const links = settings?.menuLinks && Array.isArray(settings.menuLinks) && settings.menuLinks.length > 0
    ? settings.menuLinks
    : [
        { href: "/services", label: "Services" },
        { href: "/portfolio", label: "Portfolio" },
        { href: "/about", label: "About" },
        { href: "/contact", label: "Contact" },
      ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <span className="text-2xl font-black tracking-tighter text-white cursor-pointer select-none">
            {logoText}<span className="text-primary">{logoHighlight}</span>
          </span>
        </Link>


        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <span className={`text-sm font-medium transition-colors cursor-pointer ${
                location === l.href ? "text-primary" : "text-gray-400 hover:text-white"
              }`}>
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <span className="text-sm font-medium text-gray-400 hover:text-white transition-colors cursor-pointer px-4 py-2">
              Sign In
            </span>
          </Link>
          <Link href="/register">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Zap size={14} />
              Get Started
            </motion.span>
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg border border-white/10 text-gray-300"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/5"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  <span className="block py-2 text-gray-300 hover:text-white cursor-pointer" onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </span>
                </Link>
              ))}
              <Link href="/login">
                <span className="block py-2 text-gray-400 cursor-pointer" onClick={() => setMenuOpen(false)}>Sign In</span>
              </Link>
              <Link href="/register">
                <span className="block py-2 text-primary font-semibold cursor-pointer" onClick={() => setMenuOpen(false)}>Get Started</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
