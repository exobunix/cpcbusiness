import { motion } from "framer-motion";
import { Briefcase, CheckSquare, Ticket, DollarSign } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetProjects, useGetTasks, useGetTickets, useGetInvoices } from "@workspace/api-client-react";

export default function ClientDashboardPage() {
  const { data: projects } = useGetProjects();
  const { data: tasks } = useGetTasks();
  const { data: tickets } = useGetTickets();
  const { data: invoices } = useGetInvoices();

  const cards = [
    { label: "Active Projects", value: projects?.filter(p => p.status === "active").length ?? 0, icon: Briefcase, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
    { label: "Open Tasks", value: tasks?.filter(t => t.status !== "done").length ?? 0, icon: CheckSquare, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
    { label: "Open Tickets", value: tickets?.filter(t => t.status === "open").length ?? 0, icon: Ticket, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
    { label: "Unpaid Invoices", value: invoices?.filter(i => i.status === "pending").length ?? 0, icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Welcome Back</h1>
          <p className="text-gray-500 text-sm mt-1">Here's your project overview.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${card.bg}`}>
                  <card.icon size={13} className={card.color} />
                </div>
              </div>
              <div className="text-3xl font-black text-white">{card.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Active Projects */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-bold mb-4">Active Projects</h2>
          {projects && projects.filter(p => p.status === "active").length > 0 ? (
            <div className="space-y-3">
              {projects.filter(p => p.status === "active").map((project) => (
                <div key={project.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/3 border border-white/5">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm">{project.name}</p>
                    <p className="text-gray-600 text-xs mt-0.5">Due: {project.endDate}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No active projects.</p>
          )}
        </div>

        {/* Recent Invoices */}
        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-bold mb-4">Recent Invoices</h2>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-2">
              {invoices.slice(0, 5).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg bg-white/3 border border-white/5">
                  <div>
                    <p className="text-white text-sm font-medium">{inv.invoiceNumber}</p>
                    <p className="text-gray-600 text-xs">Due: {inv.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-semibold text-sm">${Number(inv.total).toLocaleString()}</p>
                    <span className={`text-xs font-medium ${inv.status === "paid" ? "text-primary" : inv.status === "overdue" ? "text-red-400" : "text-yellow-400"}`}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No invoices yet.</p>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
