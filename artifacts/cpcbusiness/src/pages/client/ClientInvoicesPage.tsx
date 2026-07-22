import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, CheckCircle, Plus, X, Receipt, Loader2 } from "lucide-react";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetInvoices, useUpdateInvoice, useCreateInvoice, getGetInvoicesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getUser, safeArray } from "@/lib/auth";

const statusColors: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  overdue: "text-red-400 bg-red-400/10 border-red-400/20",
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function ClientInvoicesPage() {
  const qc = useQueryClient();
  const currentUser = getUser();
  const isNewUser = currentUser && currentUser.email !== "client@example.com" && currentUser.email !== "admin@cpcbusiness.com";

  const { data: serverInvoices, isLoading } = useGetInvoices();
  const [createdInvoices, setCreatedInvoices] = useState<any[]>([]);
  const [paidInvoiceIds, setPaidInvoiceIds] = useState<Set<any>>(new Set());

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ description: "", amount: "" });
  const [paying, setPaying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateInvoice = useUpdateInvoice({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
      },
    },
  });

  const createInvoice = useCreateInvoice({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
      },
    },
  });

  const baseList = isNewUser ? createdInvoices : [...createdInvoices, ...safeArray(serverInvoices)];

  const allInvoices = baseList.map((inv) => {
    if (paidInvoiceIds.has(inv.id)) {
      return { ...inv, status: "paid", paidDate: inv.paidDate || new Date().toISOString().split("T")[0] };
    }
    return inv;
  });

  const handlePay = () => {
    if (!selectedInvoice) return;
    setPaying(true);
    const invId = selectedInvoice.id;

    setPaidInvoiceIds((prev) => new Set(prev).add(invId));
    setPaying(false);
    setSelectedInvoice(null);

    updateInvoice.mutate({
      id: invId,
      data: {
        status: "paid",
        paidDate: new Date().toISOString().split("T")[0],
      } as any,
    });
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.amount || isSubmitting) return;
    setIsSubmitting(true);

    const amountNum = Number(requestForm.amount);
    const newInv = {
      id: Date.now(),
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientName: currentUser?.name || "Registered Client",
      projectName: requestForm.description || "Digital Agency Services",
      total: amountNum,
      subtotal: amountNum,
      tax: 0,
      status: "pending",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "2026-08-30",
    };

    setCreatedInvoices((prev) => [newInv, ...prev]);
    setShowRequestModal(false);
    setRequestForm({ description: "", amount: "" });
    setIsSubmitting(false);

    createInvoice.mutate({
      data: {
        clientId: 1,
        clientName: currentUser?.name || "Registered Client",
        total: amountNum,
        subtotal: amountNum,
        tax: 0,
        status: "pending",
        items: [{ description: requestForm.description || "Digital Service Payment", quantity: 1, unitPrice: amountNum, total: amountNum }],
      } as any,
    });
  };

  return (
    <ClientLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Invoices & Payments</h1>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowRequestModal(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus size={15} /> Request Invoice
          </motion.button>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Invoice #</th>
                  <th className="text-left px-5 py-3">Issue Date</th>
                  <th className="text-left px-5 py-3">Due Date</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {isLoading && allInvoices.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                  : allInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-primary font-mono text-xs font-bold">{inv.invoiceNumber}</p>
                        {inv.projectName && <p className="text-gray-600 text-xs">{inv.projectName}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{inv.issueDate}</td>
                      <td className="px-5 py-3 text-gray-400">{inv.dueDate}</td>
                      <td className="px-5 py-3 text-white font-semibold">₹{Number(inv.total).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusColors[inv.status] ?? statusColors.draft}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        {inv.status !== "paid" ? (
                          <button
                            onClick={() => setSelectedInvoice(inv)}
                            className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-lg text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            Pay Now
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-xs font-medium flex items-center justify-end gap-1">
                            <CheckCircle size={13} /> Paid {inv.paidDate || ""}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && allInvoices.length === 0 && (
              <div className="text-center py-16 text-gray-600 text-sm">
                <Receipt size={40} className="mx-auto mb-3 opacity-20" />
                <p>No invoices found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay Invoice Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Invoice Payment</h2>
                <button onClick={() => setSelectedInvoice(null)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <div className="glass rounded-xl p-4 mb-5 space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Invoice Number</span>
                  <span className="text-primary font-mono font-bold">{selectedInvoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Due Date</span>
                  <span className="text-white">{selectedInvoice.dueDate}</span>
                </div>
                <div className="flex justify-between text-sm font-bold border-t border-white/5 pt-2 mt-2">
                  <span className="text-gray-300">Total Amount</span>
                  <span className="text-emerald-400 text-lg">₹{Number(selectedInvoice.total).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cardholder Name</label>
                  <input defaultValue={currentUser?.name || "Registered Client"} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Card Number</label>
                  <input defaultValue="•••• •••• •••• 4242" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Expiry</label>
                    <input defaultValue="12/28" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">CVC</label>
                    <input defaultValue="888" className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedInvoice(null)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={handlePay} disabled={paying} className="flex-1 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2">
                  {paying ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <><CreditCard size={15} /> Pay ₹{Number(selectedInvoice.total).toLocaleString()}</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Request Invoice Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="glass-strong rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Request Invoice / Payment</h2>
                <button onClick={() => setShowRequestModal(false)}><X size={18} className="text-gray-500 hover:text-white" /></button>
              </div>
              <form onSubmit={handleRequestSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Description / Note</label>
                  <input
                    value={requestForm.description}
                    onChange={(e) => setRequestForm({ ...requestForm, description: e.target.value })}
                    placeholder="e.g. Deposit for Mobile App Project"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Amount (₹)*</label>
                  <input
                    type="number"
                    value={requestForm.amount}
                    onChange={(e) => setRequestForm({ ...requestForm, amount: e.target.value })}
                    required
                    placeholder="25000"
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 border border-white/10 text-gray-400 rounded-xl py-2.5 text-sm hover:text-white transition-colors">
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting || !requestForm.amount}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : "Generate Invoice"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ClientLayout>
  );
}

