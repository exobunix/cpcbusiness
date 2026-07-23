import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Briefcase, CheckSquare, DollarSign, Ticket,
  Settings, Globe, Image, Bot, MessageSquare, Bell, LogOut,
  TrendingUp, UserCheck, ChevronLeft, ChevronRight, Menu, X, Sun, Moon
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
import { customFetch } from "@workspace/api-client-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Registered Users", href: "/admin/users" },
  { icon: TrendingUp, label: "Leads / CRM", href: "/admin/leads" },
  { icon: UserCheck, label: "Clients", href: "/admin/clients" },
  { icon: Briefcase, label: "Projects", href: "/admin/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/admin/tasks" },
  { icon: Users, label: "Team", href: "/admin/team" },
  { icon: DollarSign, label: "Finance", href: "/admin/invoices" },
  { icon: Ticket, label: "Tickets", href: "/admin/tickets" },
  { icon: Globe, label: "Services CMS", href: "/admin/services" },
  { icon: Image, label: "Portfolio CMS", href: "/admin/portfolio" },
  { icon: Bot, label: "AI Center", href: "/admin/ai" },
  { icon: MessageSquare, label: "Messages", href: "/admin/messages" },
  { icon: Settings, label: "Site Settings", href: "/admin/site-settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const logoSrc = settings?.logoUrl || "/logo.png";
  const isDefaultLogo = !settings?.logoUrl || settings?.logoUrl === "/logo.png";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`h-20 flex items-center justify-center bg-sidebar border-b border-sidebar-border shrink-0 ${collapsed ? "px-1" : "px-4"}`}>
        {collapsed ? (
          <img src={logoSrc} alt="C" className={`h-10 w-auto object-contain ${isDefaultLogo ? "brightness-0 invert" : ""}`} />
        ) : (
          <img src={logoSrc} alt="CPCBusiness" className={`h-15 w-auto object-contain ${isDefaultLogo ? "brightness-0 invert" : ""}`} />
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
        <div className="space-y-0.5 px-2">
          {navItems.map(({ icon: Icon, label, href }) => {
            const active = location === href || (href !== "/admin" && location.startsWith(href));
            return (
              <Link key={href} href={href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all group ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/20"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={16} className={active ? "text-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"} />
                  {!collapsed && <span className="text-sm font-medium">{label}</span>}
                  {active && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={`border-t border-sidebar-border p-3 space-y-1 shrink-0`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={16} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 220 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col border-r border-sidebar-border bg-sidebar shrink-0 relative z-10"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors z-20"
        >
          {collapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
        </button>
      </motion.aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/70 z-40"
            />
            <motion.aside
              initial={{ x: -220 }}
              animate={{ x: 0 }}
              exit={{ x: -220 }}
              transition={{ duration: 0.25 }}
              className="md:hidden fixed left-0 top-0 bottom-0 w-[220px] border-r border-sidebar-border bg-sidebar z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white flex items-center px-5 justify-between shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800"
          >
            <Menu size={16} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 cursor-pointer transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
            </button>
            <Link href="/admin/messages">
              <span className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 cursor-pointer transition-colors">
                <MessageSquare size={14} />
              </span>
            </Link>
            <Link href="/admin">
              <span className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-850 hover:bg-slate-100 cursor-pointer transition-colors">
                <Bell size={14} />
              </span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
              AD
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 aurora-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
