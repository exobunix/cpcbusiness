import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Briefcase, Users, Ticket, CheckSquare, UserCheck, Percent } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import AdminLayout from "@/components/layouts/AdminLayout";
import {
  useGetDashboardStats, useGetRevenueChart, useGetRecentActivity, useGetLeadPipeline
} from "@workspace/api-client-react";
import { safeArray } from "@/lib/auth";

const statCards = [
  { key: "totalRevenue", label: "Total Revenue", icon: DollarSign, format: (v: number) => `$${(v / 1000).toFixed(0)}K`, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  { key: "totalLeads", label: "Total Leads", icon: TrendingUp, format: (v: number) => String(v), color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  { key: "totalProjects", label: "Projects", icon: Briefcase, format: (v: number) => String(v), color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  { key: "totalClients", label: "Clients", icon: UserCheck, format: (v: number) => String(v), color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  { key: "totalTeamMembers", label: "Team Members", icon: Users, format: (v: number) => String(v), color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/20" },
  { key: "openTickets", label: "Open Tickets", icon: Ticket, format: (v: number) => String(v), color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  { key: "pendingTasks", label: "Active Tasks", icon: CheckSquare, format: (v: number) => String(v), color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  { key: "conversionRate", label: "Conversion", icon: Percent, format: (v: number) => `${v}%`, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
];

const activityIcons: Record<string, string> = {
  lead_created: "🎯",
  client_added: "👤",
  project_created: "🚀",
  invoice_created: "📄",
  ticket_created: "🎫",
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: revenue } = useGetRevenueChart();
  const { data: activity } = useGetRecentActivity();
  const { data: pipeline } = useGetLeadPipeline();

  const safeRevenue = safeArray(revenue);
  const safePipeline = safeArray(pipeline);
  const safeAct = safeArray(activity);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-white">Command Center</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time overview of your agency performance.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            const value = stats ? (stats as any)[card.key] : null;
            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-500 text-xs font-medium">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${card.bg}`}>
                    <Icon size={14} className={card.color} />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {statsLoading ? <div className="h-7 w-16 bg-white/5 rounded animate-pulse" /> : card.format(value ?? 0)}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 glass rounded-xl p-6"
          >
            <h2 className="text-white font-bold mb-5">Revenue Overview</h2>
            {safeRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={safeRevenue}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6B7280" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" stroke="#4B5563" tick={{ fontSize: 11 }} />
                  <YAxis stroke="#4B5563" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: "#111", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", color: "#fff" }} formatter={(v: any) => [`$${(v / 1000).toFixed(1)}K`]} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
                  <Area type="monotone" dataKey="expenses" stroke="#6B7280" strokeWidth={1.5} fill="url(#expGrad)" name="Expenses" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-gray-600">Loading chart...</div>
            )}
          </motion.div>

          {/* Pipeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-xl p-6"
          >
            <h2 className="text-white font-bold mb-5">Lead Pipeline</h2>
            {safePipeline.length > 0 ? (
              <div className="space-y-3">
                {safePipeline.filter(s => s.count > 0).map((stage) => (
                  <div key={stage.stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400 capitalize">{stage.stage.replace("_", " ")}</span>
                      <span className="text-gray-500">{stage.count}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (stage.count / Math.max(...safePipeline.map(s => s.count))) * 100)}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-8 bg-white/3 rounded animate-pulse" />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Activity Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <h2 className="text-white font-bold mb-5">Recent Activity</h2>
          {safeAct.length > 0 ? (
            <div className="space-y-3">
              {safeAct.slice(0, 8).map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-2 border-b border-white/3 last:border-0">
                  <span className="text-base">{activityIcons[item.type] ?? "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-300 text-sm">{item.description}</p>
                    {item.userName && <p className="text-gray-600 text-xs mt-0.5">by {item.userName}</p>}
                  </div>
                  <span className="text-gray-600 text-xs shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              <p className="text-sm">No recent activity. Start creating leads, projects, or tickets.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
}
