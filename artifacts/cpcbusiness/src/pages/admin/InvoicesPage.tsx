import { motion } from "framer-motion";
import { DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";
import AdminLayout from "@/components/layouts/AdminLayout";
import { useGetInvoices, useGetFinanceSummary, useUpdateInvoice, getGetInvoicesQueryKey, getGetFinanceSummaryQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const statusColors: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  overdue: "text-red-400 bg-red-400/10 border-red-400/20",
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function InvoicesPage() {
  const qc = useQueryClient();
  const { data: invoices, isLoading } = useGetInvoices();
  const { data: summary } = useGetFinanceSummary();
  const updateInvoice = useUpdateInvoice({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetInvoicesQueryKey() });
        qc.invalidateQueries({ queryKey: getGetFinanceSummaryQueryKey() });
      }
    }
  });

  const summaryCards = [
    { label: "Total Revenue", value: summary?.totalRevenue ?? 0, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
    { label: "Pending", value: summary?.totalPending ?? 0, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20" },
    { label: "Overdue", value: summary?.totalOverdue ?? 0, icon: AlertCircle, color: "text-red-400", bg: "bg-red-400/10 border-red-400/20" },
    { label: "Total Paid", value: summary?.totalPaid ?? 0, icon: TrendingUp, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-white">Finance & Invoices</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-500 text-xs">{card.label}</span>
                <div className={`w-7 h-7 rounded-lg border flex items-center justify-center ${card.bg}`}>
                  <card.icon size={13} className={card.color} />
                </div>
              </div>
              <div className="text-xl font-black text-white">${(card.value / 1000).toFixed(1)}K</div>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-bold">Invoices</h2>
            <span className="text-gray-600 text-xs">{invoices?.length ?? 0} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Invoice #</th>
                  <th className="text-left px-5 py-3">Client</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Issue Date</th>
                  <th className="text-left px-5 py-3">Due Date</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={7} className="px-5 py-3"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                  : (invoices ?? []).map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-3 text-primary font-mono text-xs">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3 text-white font-medium">{inv.clientName}</td>
                      <td className="px-5 py-3 text-emerald-400 font-semibold">${Number(inv.total).toLocaleString()}</td>
                      <td className="px-5 py-3 text-gray-500">{inv.issueDate}</td>
                      <td className="px-5 py-3 text-gray-500">{inv.dueDate}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[inv.status] ?? statusColors.draft}`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {inv.status === "pending" && (
                          <button
                            onClick={() => updateInvoice.mutate({ id: inv.id, data: { status: "paid", paidDate: new Date().toISOString().split("T")[0] } })}
                            className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && (!invoices || invoices.length === 0) && (
              <div className="text-center py-16 text-gray-600 text-sm">No invoices yet.</div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
