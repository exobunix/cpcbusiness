import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Sun, Moon } from "lucide-react";
import { customFetch } from "@workspace/api-client-react";
import { useTheme } from "@/hooks/useTheme";

export default function PublicNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();
  const [settings, setSettings] = useState<any>(null);
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
      className={`fixed top-0 w-full z-50 transition-all duration-300 bg-white border-b border-slate-200/80 shadow-sm`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer select-none">
            {/* The brand logo with black text is always rendered on light navbar background */}
            <img src="/logo.png" alt="CPCBusiness" className="h-14 w-auto object-contain" />
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              <span className={`text-sm font-semibold transition-colors cursor-pointer ${
                location === l.href ? "text-primary font-bold" : "text-slate-600 hover:text-slate-900"
              }`}>
                {l.label}
              </span>
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
          
          <Link href="/login">
            <span className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer px-4 py-2">
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

        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-200"
          >
            <div className="px-6 py-4 flex flex-col gap-3">
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  <span className="block py-2 text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => setMenuOpen(false)}>
                    {l.label}
                  </span>
                </Link>
              ))}
              <Link href="/login">
                <span className="block py-2 text-slate-600 cursor-pointer" onClick={() => setMenuOpen(false)}>Sign In</span>
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
