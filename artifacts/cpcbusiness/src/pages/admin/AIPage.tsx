import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Sparkles, FileText, Copy, Check } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGenerateContent, useGenerateProposal } from "@workspace/api-client-react";

export default function AIPage() {
  const [activeTab, setActiveTab] = useState<"content" | "proposal">("content");
  const [contentForm, setContentForm] = useState({ type: "blog", prompt: "", tone: "professional", keywords: "" });
  const [proposalForm, setProposalForm] = useState({ clientName: "", projectType: "", budget: "", requirements: "", timeline: "3 months" });
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generateContent = useGenerateContent({ mutation: { onSuccess: (data) => setOutput(data.content) } });
  const generateProposal = useGenerateProposal({ mutation: { onSuccess: (data) => setOutput(data.content) } });

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLoading = generateContent.isPending || generateProposal.isPending;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
            <Bot size={18} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">AI Center</h1>
            <p className="text-gray-500 text-sm">Generate content and proposals with AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Input Panel */}
          <div className="glass rounded-xl p-6">
            <div className="flex gap-2 mb-5">
              {(["content", "proposal"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setOutput(""); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-all ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-gray-500 hover:text-white border border-white/10"}`}
                >
                  {tab === "content" ? "Content Writer" : "Proposal Generator"}
                </button>
              ))}
            </div>

            {activeTab === "content" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Content Type</label>
                    <select value={contentForm.type} onChange={(e) => setContentForm({ ...contentForm, type: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      <option value="blog">Blog Post</option>
                      <option value="seo">SEO Content</option>
                      <option value="social">Social Media</option>
                      <option value="landing">Landing Page</option>
                      <option value="email">Email</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Tone</label>
                    <select value={contentForm.tone} onChange={(e) => setContentForm({ ...contentForm, tone: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50">
                      <option>professional</option>
                      <option>casual</option>
                      <option>authoritative</option>
                      <option>friendly</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Topic / Prompt*</label>
                  <textarea value={contentForm.prompt} onChange={(e) => setContentForm({ ...contentForm, prompt: e.target.value })} rows={3} placeholder="E.g. The benefits of enterprise SaaS for growing companies" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Keywords (comma separated)</label>
                  <input value={contentForm.keywords} onChange={(e) => setContentForm({ ...contentForm, keywords: e.target.value })} placeholder="enterprise, SaaS, scalable, cloud" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateContent.mutate({ data: { type: contentForm.type, prompt: contentForm.prompt, tone: contentForm.tone, keywords: contentForm.keywords ? contentForm.keywords.split(",").map(k => k.trim()) : [] } })}
                  disabled={!contentForm.prompt || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <Sparkles size={15} />
                  {isLoading ? "Generating..." : "Generate Content"}
                </motion.button>
              </div>
            ) : (
              <div className="space-y-4">
                {[
                  { f: "clientName", l: "Client Name*", p: "Acme Corp" },
                  { f: "projectType", l: "Project Type*", p: "E.g. Enterprise SaaS Platform" },
                  { f: "budget", l: "Budget ($)*", p: "50000" },
                  { f: "timeline", l: "Timeline", p: "3 months" },
                ].map(({ f, l, p }) => (
                  <div key={f}>
                    <label className="text-xs text-gray-500 mb-1.5 block">{l}</label>
                    <input value={(proposalForm as any)[f]} onChange={(e) => setProposalForm({ ...proposalForm, [f]: e.target.value })} placeholder={p} type={f === "budget" ? "number" : "text"} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50" />
                  </div>
                ))}
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Requirements</label>
                  <textarea value={proposalForm.requirements} onChange={(e) => setProposalForm({ ...proposalForm, requirements: e.target.value })} rows={3} placeholder="Key project requirements..." className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50 resize-none" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateProposal.mutate({ data: { clientName: proposalForm.clientName, projectType: proposalForm.projectType, budget: Number(proposalForm.budget), requirements: proposalForm.requirements, timeline: proposalForm.timeline } })}
                  disabled={!proposalForm.clientName || !proposalForm.projectType || !proposalForm.budget || isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-3 text-sm font-bold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                >
                  <FileText size={15} />
                  {isLoading ? "Generating..." : "Generate Proposal"}
                </motion.button>
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="glass rounded-xl p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-bold">Generated Output</h3>
              {output && (
                <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-white transition-colors">
                  {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full py-16">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full mb-4" />
                    <p className="text-gray-500 text-sm">AI is generating...</p>
                  </motion.div>
                ) : output ? (
                  <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert prose-sm max-w-none">
                    <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">{output}</pre>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <Bot size={40} className="text-primary/20 mb-3" />
                    <p className="text-gray-600 text-sm">Fill in the form and click generate to see AI output here.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
