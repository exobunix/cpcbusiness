import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Search, UserCheck, Shield, Mail, Calendar, Trash2 } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { getUser, getRegisteredUsersLocally, safeArray } from "@/lib/auth";

interface RegisteredUser {
  id: number | string;
  name: string;
  email: string;
  role: string;
  company?: string;
  status?: string;
  createdAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const combineUsers = (apiUsers: any = []) => {
    const defaultSeed: RegisteredUser[] = [
      { id: 1, name: "Admin User", email: "admin@cpcbusiness.com", role: "admin", company: "CPCBusiness", status: "active", createdAt: new Date().toISOString() },
      { id: 2, name: "Demo Client", email: "client@example.com", role: "client", company: "Acme Corp", status: "active", createdAt: new Date().toISOString() },
    ];

    const localRegistered = getRegisteredUsersLocally();
    const currentUser = getUser();

    const currentAsUser = currentUser
      ? [
          {
            id: currentUser.id || Date.now(),
            name: currentUser.name || "Registered User",
            email: currentUser.email,
            role: currentUser.role || "client",
            company: currentUser.company || "Registered Client",
            status: "active",
            createdAt: currentUser.createdAt || new Date().toISOString(),
          },
        ]
      : [];

    const rawList = [...safeArray(apiUsers), ...safeArray(localRegistered), ...currentAsUser, ...defaultSeed];

    // Deduplicate by email
    const seen = new Set<string>();
    const uniqueList: RegisteredUser[] = [];

    for (const u of rawList) {
      if (!u || !u.email) continue;
      const key = u.email.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueList.push(u);
      }
    }

    return uniqueList;
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(combineUsers(data));
      } else {
        setUsers(combineUsers([]));
      }
    } catch (e) {
      setUsers(combineUsers([]));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number | string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
    } catch (e) {}
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || (u.role || "client").toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              Registered Users <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2.5 py-0.5 rounded-full font-bold">{users.length} Total</span>
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">Manage all registered accounts, clients, and platform members</p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass p-3 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, company..."
              className="w-full bg-black/50 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-white text-xs focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {["all", "client", "admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border ${roleFilter === r ? "bg-primary text-primary-foreground border-primary" : "border-white/10 text-gray-500 hover:text-white"}`}
              >
                {r === "all" ? "All Users" : r === "client" ? "Clients" : "Admins"}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">User / Details</th>
                  <th className="text-left px-5 py-3">Email Address</th>
                  <th className="text-left px-5 py-3">Role</th>
                  <th className="text-left px-5 py-3">Company</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Registered On</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-6 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                  : filteredUsers.map((u) => {
                    const initials = (u.name || "User").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
                    const isAdmin = u.role === "admin";
                    return (
                      <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full font-bold flex items-center justify-center text-xs shrink-0 ${isAdmin ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" : "bg-primary/20 text-primary border border-primary/30"}`}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-white font-bold text-xs">{u.name}</p>
                              <p className="text-gray-600 text-[11px]">ID: #{u.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-300 font-mono text-xs">
                          <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-600" /> {u.email}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1 w-fit ${isAdmin ? "text-purple-400 bg-purple-500/10 border-purple-500/20" : "text-primary bg-primary/10 border-primary/20"}`}>
                            {isAdmin ? <Shield size={10} /> : <UserCheck size={10} />}
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{u.company || "Registered Client"}</td>
                        <td className="px-5 py-3">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full border text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
                            {u.status || "active"}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          <span className="flex items-center gap-1"><Calendar size={11} /> {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recently"}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          {u.email !== "admin@cpcbusiness.com" && (
                            <button
                              onClick={() => handleDelete(u.id)}
                              className="text-gray-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10"
                              title="Delete user account"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
              </tbody>
            </table>
            {!isLoading && filteredUsers.length === 0 && (
              <div className="text-center py-16 text-gray-600 text-sm">
                <Users size={40} className="mx-auto mb-3 opacity-20" />
                <p>No registered users found matching filter.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
