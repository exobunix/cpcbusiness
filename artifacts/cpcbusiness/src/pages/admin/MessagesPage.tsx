import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function MessagesPage() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages } = useGetMessages();
  const sendMessage = useSendMessage({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetMessagesQueryKey() });
        setMessage("");
      }
    }
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <AdminLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <h1 className="text-2xl font-black text-white mb-5 shrink-0">Messages</h1>
        <div className="flex-1 glass rounded-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages && messages.length > 0 ? (
              messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex gap-3 ${msg.senderId === 1 ? "flex-row-reverse" : ""}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {msg.senderName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className={`max-w-md ${msg.senderId === 1 ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <span className="text-gray-600 text-xs">{msg.senderName}</span>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === 1 ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-white/5 border border-white/8 text-gray-200 rounded-bl-sm"}`}>
                      {msg.content}
                    </div>
                    <span className="text-gray-700 text-xs">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-600 py-20 text-sm">
                No messages yet. Start the conversation.
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-white/5 p-4 shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMessage.mutate({ data: { content: message } }); }}
              className="flex gap-3"
            >
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
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
    </AdminLayout>
  );
}
