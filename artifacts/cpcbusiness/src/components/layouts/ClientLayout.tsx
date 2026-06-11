import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Briefcase, DollarSign, Ticket,
  MessageSquare, Bell, LogOut, Menu
} from "lucide-react";
import { clearToken } from "@/lib/auth";

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

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-5 border-b border-white/5 shrink-0">
        <span className="text-lg font-black tracking-tighter text-white">
          CPC<span className="text-primary">BUSINESS</span>
          <span className="ml-2 text-xs font-medium text-gray-500 border border-white/10 px-1.5 py-0.5 rounded-full">Client</span>
        </span>
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
                  active ? "bg-primary/15 text-primary border border-primary/20" : "text-gray-500 hover:text-white hover:bg-white/5"
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
      <div className="p-3 border-t border-white/5 shrink-0">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <LogOut size={16} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="hidden md:flex flex-col w-56 border-r border-white/5 bg-[#050505] shrink-0">
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="md:hidden fixed inset-0 bg-black/70 z-40" />
            <motion.aside initial={{ x: -220 }} animate={{ x: 0 }} exit={{ x: -220 }} transition={{ duration: 0.25 }} className="md:hidden fixed left-0 top-0 bottom-0 w-[220px] border-r border-white/5 bg-[#050505] z-50">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b border-white/5 bg-black/50 backdrop-blur flex items-center px-5 justify-between shrink-0">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400">
            <Menu size={16} />
          </button>
          <div className="hidden md:block" />
          <div className="flex items-center gap-3">
            <Link href="/client/notifications">
              <span className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 hover:text-white cursor-pointer transition-colors">
                <Bell size={14} />
              </span>
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold">
              CL
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
