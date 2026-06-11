import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, Briefcase, CheckSquare, DollarSign, Ticket,
  Settings, Globe, Image, Bot, MessageSquare, Bell, LogOut,
  TrendingUp, UserCheck, ChevronLeft, ChevronRight, Menu, X
} from "lucide-react";
import { clearToken } from "@/lib/auth";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
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
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className={`h-16 flex items-center border-b border-white/5 shrink-0 ${collapsed ? "justify-center px-0" : "px-5"}`}>
        {collapsed ? (
          <span className="text-primary font-black text-lg">C</span>
        ) : (
          <span className="text-lg font-black tracking-tighter text-white">
            CPC<span className="text-primary">BUSINESS</span>
          </span>
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
                      : "text-gray-500 hover:text-white hover:bg-white/5"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon size={16} className={active ? "text-primary" : "text-gray-500 group-hover:text-white"} />
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

      <div className={`border-t border-white/5 p-3 space-y-1 shrink-0`}>
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? "justify-center" : ""}`}
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
        className="hidden md:flex flex-col border-r border-white/5 bg-[#050505] shrink-0 relative z-10"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border border-white/10 bg-background flex items-center justify-center text-gray-500 hover:text-white hover:border-primary transition-colors z-20"
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
              className="md:hidden fixed left-0 top-0 bottom-0 w-[220px] border-r border-white/5 bg-[#050505] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 border-b border-white/5 bg-black/50 backdrop-blur flex items-center px-5 justify-between shrink-0">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white"
          >
            <Menu size={16} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Link href="/admin/messages">
              <span className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 cursor-pointer transition-colors">
                <MessageSquare size={14} />
              </span>
            </Link>
            <Link href="/admin">
              <span className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:border-white/20 cursor-pointer transition-colors">
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
