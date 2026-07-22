import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, UserCheck } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser } from "@/lib/auth";

export default function ClientMessagesPage() {
  const qc = useQueryClient();
  const currentUser = getUser();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll for new messages every 3 seconds for real-time chat experience
  const { data: messages } = useGetMessages(undefined, {
    query: { refetchInterval: 3000 } as any,
  });

  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
        setMessage("");
      },
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessage.mutate({
      data: {
        content: message.trim(),
        senderName: currentUser?.name || "Client User",
        senderRole: "client",
        senderId: currentUser?.id || 2,
        recipientId: 1, // Admin ID
      } as any,
    });
  };

  return (
    <ClientLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white">Live Support Chat</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected to CPCBusiness Support Team
            </p>
          </div>
        </div>

        <div className="flex-1 glass rounded-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages && messages.length > 0 ? (
              messages.map((msg: any) => {
                const isMe = msg.senderRole === "client" || msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id || msg._id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
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
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/5 p-4 shrink-0">
            <form onSubmit={handleSend} className="flex gap-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message to admin..."
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
              <motion.button
                type="submit"
                disabled={!message.trim() || sendMessage.isPending}
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
