import { motion } from "framer-motion";
import { Bell, CheckCheck } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getGetNotificationsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const typeColors: Record<string, string> = {
  info: "text-blue-400 bg-blue-400/10",
  success: "text-emerald-400 bg-emerald-400/10",
  warning: "text-yellow-400 bg-yellow-400/10",
  error: "text-red-400 bg-red-400/10",
};

export default function ClientNotificationsPage() {
  const qc = useQueryClient();
  const { data: notifications } = useGetNotifications();
  const markRead = useMarkNotificationRead({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }) } });
  const markAllRead = useMarkAllNotificationsRead({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetNotificationsQueryKey() }) } });

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <ClientLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white">Notifications</h1>
            {unreadCount > 0 && <p className="text-primary text-sm mt-1">{unreadCount} unread</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={() => markAllRead.mutate()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors border border-white/10 px-3 py-1.5 rounded-lg">
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications && notifications.length > 0 ? notifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => !n.isRead && markRead.mutate({ id: n.id })}
              className={`glass rounded-xl p-4 flex items-start gap-3 cursor-pointer transition-all ${!n.isRead ? "border-primary/15" : "opacity-60"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${typeColors[n.type] ?? typeColors.info}`}>
                <Bell size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{n.title}</p>
                {n.body && <p className="text-gray-500 text-xs mt-0.5">{n.body}</p>}
                <p className="text-gray-700 text-xs mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />}
            </motion.div>
          )) : (
            <div className="text-center py-16 glass rounded-xl text-gray-600">
              <Bell size={40} className="mx-auto mb-3 opacity-20" />
              <p>No notifications yet.</p>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
