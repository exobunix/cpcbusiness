import { motion } from "framer-motion";
import { Calendar, Briefcase } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetProjects } from "@workspace/api-client-react";

const statusColors: Record<string, string> = {
  active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  completed: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  on_hold: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
};

export default function ClientProjectsPage() {
  const { data: projects, isLoading } = useGetProjects();
  return (
    <ClientLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-white">My Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-44 glass rounded-xl animate-pulse" />)
            : (projects ?? []).map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white font-bold">{p.name}</p>
                    {p.description && <p className="text-gray-500 text-xs mt-1 line-clamp-1">{p.description}</p>}
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[p.status] ?? statusColors.active}`}>
                    {p.status.replace("_", " ")}
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
                  <span className="flex items-center gap-1"><Calendar size={10} /> Start: {p.startDate}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} /> Due: {p.endDate}</span>
                </div>
                {p.budget && (
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-xs">
                    <span className="text-gray-500">Budget</span>
                    <span className="text-emerald-400 font-semibold">${Number(p.budget).toLocaleString()}</span>
                  </div>
                )}
              </motion.div>
            ))}
        </div>
        {!isLoading && (!projects || projects.length === 0) && (
          <div className="text-center py-16 glass rounded-xl text-gray-600">
            <Briefcase size={40} className="mx-auto mb-3 opacity-20" />
            <p>No projects assigned yet.</p>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
