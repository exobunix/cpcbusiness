import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Briefcase, Plus, X, Loader2 } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetProjects, useCreateProject, getGetProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser, safeArray } from "@/lib/auth";

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  completed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  on_hold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export default function ClientProjectsPage() {
  const qc = useQueryClient();
  const currentUser = getUser();
  const isNewUser = currentUser && currentUser.email !== "client@example.com" && currentUser.email !== "admin@cpcbusiness.com";

  const { data: serverProjects, isLoading } = useGetProjects();
  const [createdProjects, setCreatedProjects] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", budget: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createProject = useCreateProject({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetProjectsQueryKey() });
      },
    },
  });

  const visibleProjects = isNewUser
    ? createdProjects
    : [...createdProjects, ...safeArray(serverProjects)];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || isSubmitting) return;
    setIsSubmitting(true);

    const budgetNum = form.budget ? Number(form.budget) : 50000;
    const newProject = {
      id: Date.now(),
      name: form.name.trim(),
      description: form.description.trim(),
      budget: budgetNum,
      status: "active",
      progress: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
    };

    // Instant UI update
    setCreatedProjects((prev) => [newProject, ...prev]);
    setShowModal(false);
    setForm({ name: "", description: "", budget: "" });
    setIsSubmitting(false);

    // Background server call
    createProject.mutate({
      data: {
        name: newProject.name,
        description: newProject.description,
        budget: budgetNum,
        status: "active",
        progress: 0,
      } as any,
    });
  };

  return (
    <ClientLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">My Projects</h1>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Request New Project
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading && visibleProjects.length === 0
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 glass rounded-xl animate-pulse" />)
            : visibleProjects.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{p.name}</p>
                    {p.description && <p className="text-gray-500 text-xs mt-1 line-clamp-2">{p.description}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[p.status] ?? statusColors.active}`}>
                    {(p.status || "active").replace("_", " ")}
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Progress</span>
                    <span className="text-white font-medium">{p.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${p.progress}%` }} transition={{ duration: 0.8 }} className="h-full bg-primary rounded-full" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1"><Calendar size={10} /> Start: {p.startDate || "2026-07-01"}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> Due: {p.endDate || "2026-12-31"}</span>
                </div>
                {p.budget && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-gray-500">Budget</span>
                    <span className="text-emerald-400 font-semibold">₹{Number(p.budget).toLocaleString()}</span>
                  </div>
                )}
              </motion.div>
            ))}
        </div>

        {!isLoading && visibleProjects.length === 0 && (
          <div className="text-center py-16 glass rounded-xl text-gray-600">
            <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
            <p className="mb-4">No projects assigned yet.</p>
            <button onClick={() => setShowModal(true)} className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold">
              Request Your First Project
            </button>
          </div>
        )}
      </div>

      {/* New Project Request Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Request New Project</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Project Name*</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Website Redesign"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Project Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    placeholder="Describe project requirements..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    placeholder="50000"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !form.name.trim()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Submitting...</> : "Submit Request"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}

