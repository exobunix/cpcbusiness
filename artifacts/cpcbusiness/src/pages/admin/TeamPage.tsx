import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Users } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetTeamMembers, useCreateTeamMember, useDeleteTeamMember, getGetTeamMembersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { safeArray } from "@/lib/auth";

const ROLES = ["Super Admin", "Admin", "Project Manager", "Sales Manager", "Developer", "Designer", "Marketing Executive", "Client"];
const DEPTS = ["Executive", "Engineering", "Design", "Sales", "Marketing", "Operations", "Support"];

const roleColors: Record<string, string> = {
  "Super Admin": "text-red-400 bg-red-400/10 border-red-400/20",
  "Admin": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Project Manager": "text-blue-400 bg-blue-400/10 border-blue-400/20",
  "Developer": "text-primary bg-primary/10 border-primary/20",
  "Designer": "text-purple-400 bg-purple-400/10 border-purple-400/20",
  "Sales Manager": "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  "Marketing Executive": "text-pink-400 bg-pink-400/10 border-pink-400/20",
};

export default function TeamPage() {
  const qc = useQueryClient();
  const { data: team, isLoading } = useGetTeamMembers();
  const createMember = useCreateTeamMember({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetTeamMembersQueryKey() }); setShowModal(false); } } });
  const deleteMember = useDeleteTeamMember({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTeamMembersQueryKey() }) } });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Developer", department: "Engineering", phone: "" });

  const safeTeam = safeArray(team);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Team</h1>
            <p className="text-gray-500 text-sm mt-1">{safeTeam.length} members</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> Add Member
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-40 glass rounded-xl animate-pulse" />)
            : safeTeam.map((member: any, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-5 group hover:border-primary/10 transition-colors text-center"
              >
                <div className="relative inline-block mb-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/25 to-emerald-800/25 border-2 border-primary/20 flex items-center justify-center text-primary font-black text-lg mx-auto">
                    {(member.name || "User").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background ${member.isActive ? "bg-emerald-400" : "bg-gray-500"}`} />
                </div>
                <p className="text-white font-bold text-sm">{member.name}</p>
                <p className="text-gray-600 text-xs mb-2">{member.email}</p>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${roleColors[member.role] ?? "text-gray-400 bg-gray-400/10 border-gray-400/20"}`}>
                  {member.role}
                </span>
                <p className="text-gray-600 text-xs mt-2">{member.department}</p>
                <button
                  onClick={() => deleteMember.mutate({ id: member.id })}
                  className="mt-3 text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
        </div>

        {!isLoading && safeTeam.length === 0 && (
          <div className="text-center py-20 glass rounded-xl text-gray-600">
            <Users size={40} className="mx-auto mb-3 opacity-20" />
            <p>No team members yet.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Add Team Member</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                {[
                  { f: "name", l: "Full Name*", p: "John Doe" },
                  { f: "email", l: "Email*", p: "john@cpcbusiness.com" },
                  { f: "phone", l: "Phone", p: "+1 234 567 8901" },
                ].map(({ f, l, p }) => (
                  <div key={f}>
                    <label className="text-xs text-gray-500 mb-1.5 block">{l}</label>
                    <input value={(form as any)[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} placeholder={p} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Department</label>
                    <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button onClick={() => createMember.mutate({ data: form })} disabled={!form.name || !form.email} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50">
                  Add Member
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
