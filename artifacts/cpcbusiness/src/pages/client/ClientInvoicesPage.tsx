import { motion } from "framer-motion";
import ClientLayout from "@/components/layouts/ClientLayout";
import { useGetInvoices } from "@workspace/api-client-react";

const statusColors: Record<string, string> = {
  paid: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  overdue: "text-red-400 bg-red-400/10 border-red-400/20",
  draft: "text-gray-400 bg-gray-400/10 border-gray-400/20",
};

export default function ClientInvoicesPage() {
  const { data: invoices, isLoading } = useGetInvoices();
  return (
    <ClientLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-black text-white">Invoices</h1>
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="text-left px-5 py-3">Invoice</th>
                  <th className="text-left px-5 py-3">Issue Date</th>
                  <th className="text-left px-5 py-3">Due Date</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/3">
                {isLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-5 py-3"><div className="h-5 bg-white/5 rounded animate-pulse" /></td></tr>
                  ))
                  : (invoices ?? []).map((inv) => (
                    <tr key={inv.id} className="hover:bg-white/2">
                      <td className="px-5 py-3">
                        <p className="text-primary font-mono text-xs">{inv.invoiceNumber}</p>
                        {inv.projectName && <p className="text-gray-600 text-xs">{inv.projectName}</p>}
                      </td>
                      <td className="px-5 py-3 text-gray-400">{inv.issueDate}</td>
                      <td className="px-5 py-3 text-gray-400">{inv.dueDate}</td>
                      <td className="px-5 py-3 text-white font-semibold">${Number(inv.total).toLocaleString()}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[inv.status] ?? statusColors.draft}`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {!isLoading && (!invoices || invoices.length === 0) && (
              <div className="text-center py-12 text-gray-600 text-sm">No invoices found.</div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}
