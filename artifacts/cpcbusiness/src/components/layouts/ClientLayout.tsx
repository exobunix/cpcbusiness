import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, DollarSign, Ticket,
  MessageSquare, Bell, LogOut, Menu, Sun, Moon
} from "lucide-react";
import { clearToken, getUser } from "@/lib/auth";
import { useTheme } from "@/hooks/useTheme";
import { customFetch } from "@workspace/api-client-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/client" },
  { icon: Briefcase, label: "My Projects", href: "/client/projects" },
  { icon: DollarSign, label: "Invoices", href: "/client/invoices" },
  { icon: Ticket, label: "Support", href: "/client/tickets" },
  { icon: MessageSquare, label: "Messages", href: "/client/messages" },
  { icon: Bell, label: "Notifications", href: "/client/notifications" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    customFetch<any>("/api/site-settings")
      .then(setSettings)
      .catch(() => {});
  }, []);

  const user = getUser();
  const initials = user?.name ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "CL";

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const logoSrc = settings?.logoUrl || "/logo.png";
  const isDefaultLogo = !settings?.logoUrl || settings?.logoUrl === "/logo.png";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-20 flex items-center justify-center bg-white border-b border-sidebar-border shrink-0 px-4">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer select-none">
            <img src={logoSrc} alt="CPCBusiness" style={{ height: `${settings?.logoHeightSidebar || 60}px` }} className="w-auto object-contain" />
            <span className="text-[10px] font-bold text-primary/70 border border-primary/20 px-1 py-0.2 rounded-full shrink-0">Portal</span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="px-4 py-3 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground text-xs font-semibold truncate">{user?.name ?? "Client"}</p>
            <p className="text-sidebar-foreground/50 text-[10px] truncate">{user?.email ?? ""}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto hide-scrollbar">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = location === href || (href !== "/client" && location.startsWith(href));
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 2 }}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all ${
                  active
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sidebar-foreground/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 border-r border-sidebar-border bg-sidebar shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 bg-black/70 z-40" />
            <motion.aside initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }} transition={{ duration: 0.25 }} className="md:hidden fixed left-0 top-0 bottom-0 w-[220px] border-r border-sidebar-border bg-sidebar z-50">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 border-b border-slate-200 bg-white flex items-center px-5 justify-between shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800">
            <Menu size={16} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun size={14} className="text-amber-500" /> : <Moon size={14} />}
            </button>
            <Link href="/client/notifications">
              <span className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors">
                <Bell size={14} />
              </span>
            </Link>
            <Link href="/client/messages">
              <span className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors">
                <MessageSquare size={14} />
              </span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
              {initials}
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
