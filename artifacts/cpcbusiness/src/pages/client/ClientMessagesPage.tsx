import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetMessages, useSendMessage, getGetMessagesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export default function ClientMessagesPage() {
  const qc = useQueryClient();
  const [message, setMessage] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { data: messages } = useGetMessages();
  const sendMessage = useSendMessage({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getGetMessagesQueryKey() }); setMessage(""); } } });

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <ClientLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <h1 className="text-2xl font-black text-white mb-5 shrink-0">Messages</h1>
        <div className="flex-1 glass rounded-xl flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {messages && messages.length > 0 ? messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.senderId === 1 ? "" : "flex-row-reverse"}`}>
                <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                  {msg.senderName.slice(0, 2).toUpperCase()}
                </div>
                <div className={`max-w-md flex flex-col gap-1 ${msg.senderId === 1 ? "items-start" : "items-end"}`}>
                  <span className="text-gray-600 text-xs">{msg.senderName}</span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.senderId === 1 ? "bg-white/5 border border-white/8 text-gray-200 rounded-bl-sm" : "bg-primary text-primary-foreground rounded-br-sm"}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            )) : (
              <div className="flex items-center justify-center h-full text-gray-600 text-sm">Start a conversation with the CPCBusiness team.</div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-white/5 p-4 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMessage.mutate({ data: { content: message } }); }} className="flex gap-3">
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
              <motion.button type="submit" disabled={!message.trim()} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50">
                <Send size={15} />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
