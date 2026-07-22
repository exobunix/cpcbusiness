import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, UserCheck, Zap } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetMessages, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";
import { getSocket } from "@/lib/socket";

export default function ClientMessagesPage() {
  const qc = useQueryClient();
  const currentUser = getUser();
  const [message, setMessage] = useState("");
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages
  const { data: initialMessages } = useGetMessages();

  // Sync initial messages to live state
  useEffect(() => {
    if (initialMessages) {
      setLiveMessages(initialMessages);
    }
  }, [initialMessages]);

  // Connect Socket.IO
  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_room", "client_portal");

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
      if (data.role === "admin") {
        setTypingUser(data.isTyping ? data.userName || "Admin" : null);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleUserTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleUserTyping);
    };
  }, [qc]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [liveMessages, typingUser]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    const socket = getSocket();
    socket.emit("typing", { userName: currentUser?.name || "Client", isTyping: e.target.value.length > 0, role: "client" });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const socket = getSocket();
    const payload = {
      content: message.trim(),
      senderName: currentUser?.name || "Client User",
      senderRole: "client",
      senderId: currentUser?.id || 2,
      recipientId: 1, // Admin ID
    };

    socket.emit("send_message", payload);
    socket.emit("typing", { userName: currentUser?.name || "Client", isTyping: false, role: "client" });
    setMessage("");
  };

  return (
    <ClientLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Live Support Chat <span className="text-xs bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Zap size={12} /> Socket.IO</span>
            </h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected to CPCBusiness Support Team
            </p>
          </div>
        </div>

        <div className="flex-1 glass rounded-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {liveMessages && liveMessages.length > 0 ? (
              liveMessages.map((msg: any) => {
                const isMe = msg.senderRole === "client" || msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id || msg._id || Math.random()} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isMe ? "bg-primary text-primary-foreground" : "bg-white/10 text-white border border-white/15"}`}>
                      {(msg.senderName || (isMe ? "You" : "Admin")).slice(0, 2).toUpperCase()}
                    </div>
                    <div className={`max-w-md flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                      <span className="text-gray-500 text-xs font-medium">{isMe ? "You" : (msg.senderName || "Admin Support")}</span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-white/5 border border-white/8 text-gray-200 rounded-tl-none"}`}>
                        {msg.content}
                      </div>
                      <span className="text-gray-600 text-[10px]">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Just now"}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-600 text-sm gap-2">
                <UserCheck size={36} className="opacity-20" />
                <p>Start a live conversation with the CPCBusiness admin team.</p>
              </div>
            )}

            {typingUser && (
              <div className="flex gap-2 items-center text-xs text-primary italic">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" /> {typingUser} is typing...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/5 p-4 shrink-0">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                value={message}
                onChange={handleInputChange}
                placeholder="Type your message to admin..."
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
    </ClientLayout>
  );
}
