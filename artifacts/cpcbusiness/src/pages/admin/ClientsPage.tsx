import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Building2 } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetClients, useCreateClient, useDeleteClient, getGetClientsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

import { safeArray } from "@/lib/auth";

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  inactive: "text-gray-400 bg-gray-400/10 border-gray-400/20",
  prospect: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

export default function ClientsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", industry: "", address: "" });
  const [localClients, setLocalClients] = useState<any[]>([]);

  const { data: serverClients, isLoading } = useGetClients({ search: search || undefined });

  const createClient = useCreateClient({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetClientsQueryKey() });
        setShowModal(false);
        setForm({ name: "", email: "", phone: "", company: "", industry: "", address: "" });
      },
      onError: (err) => {
        console.warn("API Add Client notice, applying local fallback:", err);
        const fallback = {
          id: Date.now(),
          name: form.name,
          email: form.email,
          phone: form.phone,
          company: form.company || "Independent Client",
          industry: form.industry || "General",
          status: "active",
          totalSpent: 0,
        };
        setLocalClients((prev) => [fallback, ...prev]);
        setShowModal(false);
        setForm({ name: "", email: "", phone: "", company: "", industry: "", address: "" });
      },
    },
  });

  const deleteClient = useDeleteClient({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetClientsQueryKey() }),
    },
  });

  const clients = [...localClients, ...safeArray(serverClients)];

  const handleAddSubmit = () => {
    if (!form.name || !form.email) return;

    const newClient = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      company: form.company || "Independent Client",
      industry: form.industry || "General",
      status: "active",
      totalSpent: 0,
    };

    setLocalClients((prev) => [newClient, ...prev]);
    setShowModal(false);

    createClient.mutate({ data: form });
    setForm({ name: "", email: "", phone: "", company: "", industry: "", address: "" });
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Clients</h1>
            <p className="text-gray-500 text-sm mt-1">{clients.length} clients</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> Add Client
          </motion.button>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="w-full bg-white/3 border border-white/8 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading && clients.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-44 glass rounded-xl animate-pulse" />)
            : clients.map((client, i) => (
              <motion.div
                key={client.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-5 hover:border-primary/15 transition-colors group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/25 to-emerald-800/25 border border-primary/20 flex items-center justify-center text-primary font-bold">
                      {(client.name || "Client").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{client.name}</p>
                      {client.company && <p className="text-gray-600 text-xs">{client.company}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setLocalClients((prev) => prev.filter((c) => c.id !== client.id));
                      deleteClient.mutate({ id: client.id });
                    }}
                    className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-gray-500">
                  <p className="truncate">{client.email}</p>
                  {client.phone && <p>{client.phone}</p>}
                  {client.industry && <p className="flex items-center gap-1"><Building2 size={10} />{client.industry}</p>}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[client.status] ?? statusColors.active}`}>
                    {client.status || "active"}
                  </span>
                  {client.totalSpent && (
                    <span className="text-xs text-emerald-400 font-semibold">${Number(client.totalSpent).toLocaleString()}</span>
                  )}
                </div>
              </motion.div>
            ))}
        </div>

        {!isLoading && clients.length === 0 && (
          <div className="text-center py-20 text-gray-600 glass rounded-xl">
            <Building2 size={40} className="mx-auto mb-3 opacity-20" />
            <p>No clients yet. Add your first client.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Add Client</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { f: "name", l: "Name*", p: "Client name" },
                  { f: "email", l: "Email*", p: "email@company.com" },
                  { f: "phone", l: "Phone", p: "+1 234 567 8901" },
                  { f: "company", l: "Company", p: "Company name" },
                  { f: "industry", l: "Industry", p: "Technology, Finance..." },
                  { f: "address", l: "Address", p: "City, Country" },
                ].map(({ f, l, p }) => (
                  <div key={f}>
                    <label className="text-xs text-gray-500 mb-1.5 block">{l}</label>
                    <input value={(form as any)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} placeholder={p} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={handleAddSubmit} disabled={!form.name || !form.email} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">Add Client</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
