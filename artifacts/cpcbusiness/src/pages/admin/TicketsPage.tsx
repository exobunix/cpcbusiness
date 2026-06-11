import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Ticket } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetTickets, useCreateTicket, useUpdateTicket, getGetTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  open: "text-red-400 bg-red-400/10 border-red-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-primary bg-primary/10 border-primary/20",
  closed: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

const priorityColors: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

export default function TicketsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("");
  const { data: tickets, isLoading } = useGetTickets({ status: statusFilter || undefined });
  const createTicket = useCreateTicket({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetTicketsQueryKey() }); setShowModal(false); } } });
  const updateTicket = useUpdateTicket({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTicketsQueryKey() }) } });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium", category: "" });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Support Tickets</h1>
            <p className="text-gray-500 text-sm mt-1">{tickets?.length ?? 0} tickets</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> New Ticket
          </motion.button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["", "open", "in_progress", "pending", "completed", "closed"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-white/10 text-gray-500 hover:text-white"}`}>
              {s === "" ? "All" : s.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Subject</th>
                  <th className="text-left px-5 py-3">Client</th>
                  <th className="text-left px-5 py-3">Priority</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Created</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                  : (tickets ?? []).map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-white font-medium">{ticket.subject}</p>
                        {ticket.category && <p className="text-gray-600 text-xs">{ticket.category}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{ticket.clientName ?? "—"}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[ticket.status] ?? statusColors.open}`}>
                          {ticket.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-gray-600 text-xs">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2 justify-center">
                          {ticket.status === "open" && (
                            <button onClick={() => updateTicket.mutate({ id: ticket.id, data: { status: "in_progress" } })} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">In Progress</button>
                          )}
                          {ticket.status === "in_progress" && (
                            <button onClick={() => updateTicket.mutate({ id: ticket.id, data: { status: "completed" } })} className="text-xs text-primary hover:text-primary/80 transition-colors">Close</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && (!tickets || tickets.length === 0) && (
              <div className="text-center py-16 text-gray-600">
                <Ticket size={40} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">No tickets found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">New Ticket</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Subject*</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of issue" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description*</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Detailed description..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
                    <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Bug, Feature, etc." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={() => createTicket.mutate({ data: form })} disabled={!form.subject || !form.description} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                  Create Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
