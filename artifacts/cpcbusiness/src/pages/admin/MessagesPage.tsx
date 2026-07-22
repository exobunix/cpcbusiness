import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, Zap } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";
import { getSocket } from "@/lib/socket";

export default function MessagesPage() {
  const qc = useQueryClient();
  const currentUser = getUser();
  const [message, setMessage] = useState("");
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [activeClient, setActiveClient] = useState<{ id: number; name: string; email: string }>({
    id: 2,
    name: "Demo Client",
    email: "client@example.com",
  });
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll HTTP API every 3s as guaranteed fallback
  const { data: serverMessages } = useGetMessages(undefined, {
    query: { refetchInterval: 3000 } as any,
  });

  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      },
    },
  });

  // Sync server messages into live state
  useEffect(() => {
    if (serverMessages && serverMessages.length > 0) {
      setLiveMessages((prev) => {
        const serverMap = new Map(serverMessages.map((m: any) => [String(m.id || m._id), m]));
        const localUnsynced = prev.filter((m: any) => !serverMap.has(String(m.id || m._id)));
        return [...serverMessages, ...localUnsynced];
      });
    }
  }, [serverMessages]);

  // Connect Socket.IO
  useEffect(() => {
    let socket: any = null;
    try {
      socket = getSocket();
      socket.emit("join_room", "admin_portal");

      const handleNewMessage = (newMsg: any) => {
        setLiveMessages((prev) => {
          if (prev.some((m) => String(m.id || m._id) === String(newMsg.id || newMsg._id))) {
            return prev;
          }
          return [...prev, newMsg];
        });
        qc.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
      };

      const handleUserTyping = (data: { userName: string; isTyping: boolean; role: string }) => {
        if (data.role === "client") {
          setTypingUser(data.isTyping ? data.userName || "Client" : null);
        }
      };

      socket.on("new_message", handleNewMessage);
      socket.on("user_typing", handleUserTyping);

      return () => {
        if (socket) {
          socket.off("new_message", handleNewMessage);
          socket.off("user_typing", handleUserTyping);
        }
      };
    } catch (e) {
      console.warn("Socket.IO admin init notice:", e);
      return () => {};
    }
  }, [qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages, typingUser]);

  // Extract unique client conversations from message history
  const conversationsMap = new Map<string, { id: number; name: string; lastMsg: string; time: string }>();
  (liveMessages || []).forEach((msg: any) => {
    if (msg.senderRole === "client" || msg.senderId !== 1) {
      const clientId = msg.senderId || 2;
      const clientName = msg.senderName || "Client";
      conversationsMap.set(String(clientId), {
        id: clientId,
        name: clientName,
        lastMsg: msg.content,
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      });
    }
  });

  if (conversationsMap.size === 0) {
    conversationsMap.set("2", { id: 2, name: "Demo Client", lastMsg: "Hi team!", time: "12:00 PM" });
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    try {
      const socket = getSocket();
      socket.emit("typing", { userName: currentUser?.name || "Admin", isTyping: e.target.value.length > 0, role: "admin" });
    } catch (e) {}
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    const newMsgObj = {
      id: Date.now(),
      content: text,
      senderName: currentUser?.name || "Admin User",
      senderRole: "admin",
      senderId: 1,
      recipientId: activeClient.id,
      createdAt: new Date().toISOString(),
    };

    // 1. Instant local UI update
    setLiveMessages((prev) => [...prev, newMsgObj]);
    setMessage("");

    // 2. Dual Dispatch: HTTP REST API + Socket.IO
    try {
      sendMessage.mutate({
        data: {
          content: text,
          senderName: currentUser?.name || "Admin User",
          senderRole: "admin",
          senderId: 1,
          recipientId: activeClient.id,
        } as any,
      });
    } catch (e) {}

    try {
      const socket = getSocket();
      socket.emit("send_message", newMsgObj);
      socket.emit("typing", { userName: currentUser?.name || "Admin", isTyping: false, role: "admin" });
    } catch (e) {}
  };

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Client Conversations <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Zap size={12} /> Socket.IO + Polling</span>
            </h1>
            <p className="text-xs text-gray-500">Live multi-client messaging center with instant push & guaranteed HTTP sync</p>
          </div>
        </div>

        <div className="flex-1 glass rounded-xl flex overflow-hidden">
          {/* Client List Sidebar */}
          <div className="w-64 border-r border-white/5 p-4 space-y-2 shrink-0 overflow-y-auto">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Conversations</p>
            {Array.from(conversationsMap.values()).map((conv) => {
              const isSelected = activeClient.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveClient({ id: conv.id, name: conv.name, email: `${conv.name.toLowerCase().replace(/\s+/g, "")}@example.com` })}
                  className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 ${isSelected ? "bg-primary/20 border border-primary/30" : "hover:bg-white/5 border border-transparent"}`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs shrink-0">
                    {conv.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="text-white text-xs font-bold truncate">{conv.name}</p>
                      <span className="text-[10px] text-gray-600">{conv.time}</span>
                    </div>
                    <p className="text-gray-500 text-[11px] truncate">{conv.lastMsg}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Chat Window */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                  {activeClient.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{activeClient.name}</p>
                  <p className="text-gray-500 text-[11px]">{activeClient.email}</p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-0.5 rounded-full font-medium">
                Active Client
              </span>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {liveMessages && liveMessages.length > 0 ? (
                liveMessages.map((msg: any, i: number) => {
                  const isAdmin = msg.senderRole === "admin" || msg.senderId === 1;
                  return (
                    <motion.div
                      key={msg.id || msg._id || i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 ${isAdmin ? "flex-row-reverse" : ""}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isAdmin ? "bg-primary text-primary-foreground" : "bg-white/10 text-white border border-white/15"}`}>
                        {(msg.senderName || (isAdmin ? "Admin" : "Client")).slice(0, 2).toUpperCase()}
                      </div>
                      <div className={`max-w-md ${isAdmin ? "items-end" : "items-start"} flex flex-col gap-1`}>
                        <span className="text-gray-500 text-xs font-medium">{isAdmin ? "Admin Support" : msg.senderName}</span>
                        <div className={`px-4 py-2.5 rounded-2xl text-sm ${isAdmin ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white/5 border border-white/8 text-gray-200 rounded-tl-none"}`}>
                          {msg.content}
                        </div>
                        <span className="text-gray-600 text-[10px]">
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                        </span>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm gap-2">
                  <MessageSquare size={36} className="opacity-20" />
                  <p>No messages yet. Send a message to start conversing.</p>
                </div>
              )}

              {typingUser && (
                <div className="flex gap-2 items-center text-xs text-primary italic">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> {typingUser} is typing...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input Box */}
            <div className="border-t border-white/5 p-4 shrink-0">
              <form onSubmit={handleSend} className="flex gap-3">
                <input
                  value={message}
                  onChange={handleInputChange}
                  placeholder={`Reply to ${activeClient.name}...`}
                  className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
                />
                <motion.button
                  type="submit"
                  disabled={!message.trim()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <Send size={15} />
                </motion.button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
