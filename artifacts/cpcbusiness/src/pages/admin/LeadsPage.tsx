import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, DollarSign } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetLeads, useCreateLead, useUpdateLead, useDeleteLead, getGetLeadsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const STAGES = [
  { key: "new", label: "New Lead", color: "border-blue-500/30 bg-blue-500/5" },
  { key: "contacted", label: "Contacted", color: "border-yellow-500/30 bg-yellow-500/5" },
  { key: "qualified", label: "Qualified", color: "border-purple-500/30 bg-purple-500/5" },
  { key: "proposal_sent", label: "Proposal Sent", color: "border-orange-500/30 bg-orange-500/5" },
  { key: "negotiation", label: "Negotiation", color: "border-primary/30 bg-primary/5" },
  { key: "won", label: "Won", color: "border-emerald-400/30 bg-emerald-400/5" },
  { key: "lost", label: "Lost", color: "border-red-500/30 bg-red-500/5" },
];

const stageColors: Record<string, string> = {
  new: "text-blue-400",
  contacted: "text-yellow-400",
  qualified: "text-purple-400",
  proposal_sent: "text-orange-400",
  negotiation: "text-primary",
  won: "text-emerald-400",
  lost: "text-red-400",
};

export default function LeadsPage() {
  const qc = useQueryClient();
  const { data: leads, isLoading } = useGetLeads();
  const createLead = useCreateLead({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() }) } });
  const updateLead = useUpdateLead({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() }) } });
  const deleteLead = useDeleteLead({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetLeadsQueryKey() }) } });
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", stage: "new", source: "website", value: "" });

  const handleCreate = () => {
    createLead.mutate({ data: { ...form, value: form.value ? Number(form.value) : undefined } });
    setShowModal(false);
    setForm({ name: "", email: "", phone: "", company: "", stage: "new", source: "website", value: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Lead Pipeline</h1>
            <p className="text-gray-500 text-sm mt-1">{leads?.length ?? 0} leads in pipeline</p>
          </div>
          <div className="flex gap-3">
            <div className="flex rounded-lg border border-white/10 overflow-hidden text-sm">
              {(["kanban", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)} className={`px-3 py-1.5 capitalize transition-colors ${view === v ? "bg-primary text-primary-foreground" : "text-gray-500 hover:text-white"}`}>
                  {v}
                </button>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
            >
              <Plus size={15} /> Add Lead
            </motion.button>
          </div>
        </div>

        {view === "kanban" ? (
          <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
            {STAGES.map((stage) => {
              const stageLeads = leads?.filter((l) => l.stage === stage.key) ?? [];
              return (
                <div key={stage.key} className={`flex-shrink-0 w-64 rounded-xl border p-3 ${stage.color}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-xs font-bold ${stageColors[stage.key]}`}>{stage.label}</span>
                    <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>
                  <div className="space-y-2">
                    {stageLeads.map((lead) => (
                      <motion.div
                        key={lead.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-black/40 border border-white/5 rounded-lg p-3 cursor-pointer hover:border-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{lead.name}</p>
                            {lead.company && <p className="text-gray-600 text-xs mt-0.5">{lead.company}</p>}
                          </div>
                          <button onClick={() => deleteLead.mutate({ id: lead.id })} className="text-gray-700 hover:text-red-400 transition-colors ml-2 shrink-0">
                            <X size={12} />
                          </button>
                        </div>
                        {lead.value && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-emerald-400">
                            <DollarSign size={10} /> {lead.value.toLocaleString()}
                          </div>
                        )}
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {STAGES.filter(s => s.key !== stage.key).slice(0, 2).map(s => (
                            <button
                              key={s.key}
                              onClick={() => updateLead.mutate({ id: lead.id, data: { stage: s.key } })}
                              className="text-xs text-gray-600 hover:text-white transition-colors"
                            >
                              → {s.label.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Company</th>
                  <th className="text-left px-5 py-3">Stage</th>
                  <th className="text-left px-5 py-3">Source</th>
                  <th className="text-left px-5 py-3">Value</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {(isLoading ? [] : leads ?? []).map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-white font-medium">{lead.name}</div>
                      <div className="text-gray-600 text-xs">{lead.email}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{lead.company ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold ${stageColors[lead.stage]}`}>
                        {STAGES.find(s => s.key === lead.stage)?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 capitalize">{lead.source}</td>
                    <td className="px-5 py-3 text-emerald-400">{lead.value ? `$${lead.value.toLocaleString()}` : "—"}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => deleteLead.mutate({ id: lead.id })} className="text-gray-700 hover:text-red-400 transition-colors">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && (!leads || leads.length === 0) && (
              <div className="text-center py-16 text-gray-600">
                <p>No leads yet. Add your first lead.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Add New Lead</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                {[
                  { field: "name", label: "Name*", placeholder: "Lead name" },
                  { field: "email", label: "Email*", placeholder: "email@company.com" },
                  { field: "phone", label: "Phone", placeholder: "+1 234 567 8901" },
                  { field: "company", label: "Company", placeholder: "Company name" },
                  { field: "value", label: "Deal Value ($)", placeholder: "5000" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label className="text-xs text-gray-500 mb-1.5 block font-medium">{label}</label>
                    <input
                      value={(form as any)[field]}
                      onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                      placeholder={placeholder}
                      className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block font-medium">Stage</label>
                  <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                    {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={handleCreate} disabled={!form.name || !form.email} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors">
                  Create Lead
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
