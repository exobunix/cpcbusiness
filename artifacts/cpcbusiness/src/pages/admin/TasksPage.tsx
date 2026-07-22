import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, CheckSquare } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetTasks, useCreateTask, useUpdateTask, useDeleteTask, getGetTasksQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { safeArray } from "@/lib/auth";

const COLS = [
  { key: "todo", label: "To Do", color: "border-gray-500/20" },
  { key: "in_progress", label: "In Progress", color: "border-blue-500/20" },
  { key: "review", label: "Review", color: "border-purple-500/20" },
  { key: "done", label: "Done", color: "border-emerald-500/20" },
];

const priorityColors: Record<string, string> = {
  low: "text-gray-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

export default function TasksPage() {
  const qc = useQueryClient();
  const { data: tasks, isLoading } = useGetTasks();
  const createTask = useCreateTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTasksQueryKey() }) } });
  const updateTask = useUpdateTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTasksQueryKey() }) } });
  const deleteTask = useDeleteTask({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetTasksQueryKey() }) } });
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", status: "todo", priority: "medium", dueDate: "" });

  const safeTasksList = safeArray(tasks);

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Tasks</h1>
            <p className="text-gray-500 text-sm mt-1">{safeTasksList.length} tasks</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold"
          >
            <Plus size={15} /> Add Task
          </motion.button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
          {COLS.map((col) => {
            const colTasks = safeTasksList.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className={`flex-shrink-0 w-64 rounded-xl border ${col.color} bg-white/2 p-3`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-300">{col.label}</span>
                  <span className="text-xs bg-white/5 text-gray-500 px-2 py-0.5 rounded-full">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-black/40 border border-white/5 rounded-lg p-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-white text-xs font-medium flex-1 pr-2">{task.title}</p>
                        <button onClick={() => deleteTask.mutate({ id: task.id })} className="text-gray-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0">
                          <X size={11} />
                        </button>
                      </div>
                      {task.assigneeName && <p className="text-gray-600 text-xs mt-1">{task.assigneeName}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs font-medium ${priorityColors[task.priority]}`}>{task.priority}</span>
                        {task.dueDate && <span className="text-gray-700 text-xs">{task.dueDate}</span>}
                      </div>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {COLS.filter(c => c.key !== col.key).map(c => (
                          <button key={c.key} onClick={() => updateTask.mutate({ id: task.id, data: { status: c.key } })} className="text-xs text-gray-700 hover:text-primary transition-colors">
                            →{c.label.split(" ")[0]}
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
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Add Task</h2>
                <button onClick={() => setShowModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Title*</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Task details..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">Cancel</button>
                <button
                  onClick={() => { createTask.mutate({ data: { title: form.title, description: form.description, status: form.status, priority: form.priority, dueDate: form.dueDate || undefined } }); setShowModal(false); setForm({ title: "", description: "", status: "todo", priority: "medium", dueDate: "" }); }}
                  disabled={!form.title}
                  className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                >
                  Create Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
