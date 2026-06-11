import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Globe, ToggleLeft, ToggleRight } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetServices, useCreateService, useUpdateService, useDeleteService, getGetServicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ServicesCMSPage() {
  const qc = useQueryClient();
  const { data: services, isLoading } = useGetServices();
  const createService = useCreateService({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetServicesQueryKey() }); setShowModal(false); } } });
  const updateService = useUpdateService({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetServicesQueryKey() }) } });
  const deleteService = useDeleteService({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetServicesQueryKey() }) } });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", description: "", shortDescription: "", technologies: "" });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Services CMS</h1>
            <p className="text-gray-500 text-sm mt-1">{services?.length ?? 0} services — manage your public service listings</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> Add Service
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-36 glass rounded-xl animate-pulse" />)
            : (services ?? []).map((svc: any, i) => (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">{svc.category}</span>
                    <h3 className="text-white font-bold mt-0.5">{svc.title}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateService.mutate({ id: svc.id, data: { isActive: !svc.isActive } })}
                      className={`transition-colors ${svc.isActive ? "text-primary" : "text-gray-600"}`}
                    >
                      {svc.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                    </button>
                    <button onClick={() => deleteService.mutate({ id: svc.id })} className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">{svc.shortDescription || svc.description}</p>
                {svc.technologies && svc.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {(svc.technologies as string[]).slice(0, 4).map((t: string) => (
                      <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-500">{t}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
        </div>

        {!isLoading && (!services || services.length === 0) && (
          <div className="text-center py-20 glass rounded-xl text-gray-600">
            <Globe size={40} className="mx-auto mb-3 opacity-20" />
            <p>No services defined yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Add Service</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { f: "title", l: "Service Name*", p: "Web Development" },
                  { f: "category", l: "Category*", p: "Development" },
                  { f: "shortDescription", l: "Short Description", p: "One-line summary" },
                  { f: "technologies", l: "Technologies (comma separated)", p: "React, Node.js, PostgreSQL" },
                ].map(({ f, l, p }) => (
                  <div key={f}>
                    <label className="text-xs text-gray-500 mb-1.5 block">{l}</label>
                    <input value={(form as any)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} placeholder={p} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description*</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Full description..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button
                  onClick={() => createService.mutate({ data: { title: form.title, category: form.category, description: form.description, shortDescription: form.shortDescription, technologies: form.technologies ? form.technologies.split(",").map(t => t.trim()) : [] } })}
                  disabled={!form.title || !form.category || !form.description}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Add Service
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
