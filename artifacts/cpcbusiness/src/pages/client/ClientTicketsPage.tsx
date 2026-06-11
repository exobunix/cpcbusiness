import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Ticket } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetTickets, useCreateTicket, getGetTicketsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  open: "text-red-400 bg-red-400/10 border-red-400/20",
  in_progress: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  completed: "text-primary bg-primary/10 border-primary/20",
  closed: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function ClientTicketsPage() {
  const qc = useQueryClient();
  const { data: tickets, isLoading } = useGetTickets();
  const createTicket = useCreateTicket({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetTicketsQueryKey() }); setShowModal(false); } } });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ subject: "", description: "", priority: "medium", category: "" });

  return (
    <ClientLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Support Tickets</h1>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold">
            <Plus size={15} /> New Ticket
          </motion.button>
        </div>

        <div className="space-y-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 glass rounded-xl animate-pulse" />)
            : (tickets ?? []).map((t) => (
              <div key={t.id} className="glass rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-medium text-sm">{t.subject}</p>
                  {t.category && <p className="text-gray-600 text-xs mt-0.5">{t.category}</p>}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs font-medium text-${t.priority === "high" || t.priority === "critical" ? "red" : t.priority === "medium" ? "yellow" : "gray"}-400`}>{t.priority}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[t.status] ?? statusColors.open}`}>{t.status.replace("_", " ")}</span>
                </div>
              </div>
            ))}
          {!isLoading && (!tickets || tickets.length === 0) && (
            <div className="text-center py-16 glass rounded-xl text-gray-600">
              <Ticket size={40} className="mx-auto mb-3 opacity-20" />
              <p>No tickets yet.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Submit Ticket</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Subject*</label>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Describe your issue briefly" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description*</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} placeholder="Provide details..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      <option>low</option><option>medium</option><option>high</option><option>critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Category</label>
                    <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Bug, Feature..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={() => createTicket.mutate({ data: form })} disabled={!form.subject || !form.description} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                  Submit Ticket
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}
