import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Image, Star } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetPortfolioItems, useCreatePortfolioItem, useUpdatePortfolioItem, useDeletePortfolioItem, getGetPortfolioItemsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function PortfolioCMSPage() {
  const qc = useQueryClient();
  const { data: items, isLoading } = useGetPortfolioItems();
  const createItem = useCreatePortfolioItem({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetPortfolioItemsQueryKey() }); setShowModal(false); } } });
  const updateItem = useUpdatePortfolioItem({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetPortfolioItemsQueryKey() }) } });
  const deleteItem = useDeletePortfolioItem({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetPortfolioItemsQueryKey() }) } });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", category: "", client: "", description: "", shortDescription: "", technologies: "", results: "", liveUrl: "", isFeatured: false });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Portfolio CMS</h1>
            <p className="text-gray-500 text-sm mt-1">{items?.length ?? 0} projects</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> Add Project
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 glass rounded-xl animate-pulse" />)
            : (items ?? []).map((item: any, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-5 group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-primary font-semibold uppercase tracking-wider">{item.category}</span>
                    <h3 className="text-white font-bold mt-0.5 truncate">{item.title}</h3>
                    {item.client && <p className="text-gray-600 text-xs">{item.client}</p>}
                  </div>
                  <div className="flex gap-2 ml-2 shrink-0">
                    <button
                      onClick={() => updateItem.mutate({ id: item.id, data: { isFeatured: !item.isFeatured } })}
                      className={`transition-colors ${item.isFeatured ? "text-yellow-400" : "text-gray-700 hover:text-yellow-400"}`}
                    >
                      <Star size={14} className={item.isFeatured ? "fill-yellow-400" : ""} />
                    </button>
                    <button onClick={() => deleteItem.mutate({ id: item.id })} className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-500 text-xs mb-3 line-clamp-2">{item.shortDescription || item.description}</p>
                {item.results && <p className="text-primary text-xs font-semibold mb-2">{item.results}</p>}
                <div className="flex flex-wrap gap-1">
                  {(item.technologies as string[]).slice(0, 3).map((t: string) => (
                    <span key={t} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-600">{t}</span>
                  ))}
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Add Portfolio Project</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-3">
                {[
                  { f: "title", l: "Title*", p: "Project name" },
                  { f: "category", l: "Category*", p: "Web Development, AI, SaaS..." },
                  { f: "client", l: "Client", p: "Client name" },
                  { f: "shortDescription", l: "Short Description", p: "One-line summary" },
                  { f: "technologies", l: "Technologies (comma separated)", p: "React, Node.js" },
                  { f: "results", l: "Results", p: "E.g. 3x revenue increase" },
                  { f: "liveUrl", l: "Live URL", p: "https://example.com" },
                ].map(({ f, l, p }) => (
                  <div key={f}>
                    <label className="text-xs text-gray-500 mb-1.5 block">{l}</label>
                    <input value={(form as any)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} placeholder={p} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description*</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Full project description" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="rounded border-white/20" />
                  <span className="text-sm text-gray-400">Feature on homepage</span>
                </label>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button
                  onClick={() => createItem.mutate({ data: { title: form.title, category: form.category, client: form.client, description: form.description, shortDescription: form.shortDescription, technologies: form.technologies ? form.technologies.split(",").map(t => t.trim()) : [], results: form.results, liveUrl: form.liveUrl, isFeatured: form.isFeatured } })}
                  disabled={!form.title || !form.category || !form.description}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Add Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
