import React, { useState, useEffect, useMemo } from "react";
import {
  Receipt,
  Search,
  RotateCw,
  Building,
  Check,
  Copy,
  Calendar,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import { orgService } from "../../../services/orgService";

interface IPaymentRecord {
  _id: string;
  organization?: {
    _id: string;
    name: string;
    email?: string;
  } | string;
  organizationName?: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: string;
  paymentMethod: string;
  transactionId: string;
  invoiceNumber: string;
  status: string;
  maxMembers?: number;
  paidAt: string;
}

export const SysAdminPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPayments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await orgService.getAllPaymentsForAdmin();
      if (res?.success) {
        setPayments(res.payments || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load payment history");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Transaction ID copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter((p) => {
      const orgName = (
        typeof p.organization === "object" && p.organization?.name
          ? p.organization.name
          : p.organizationName || ""
      ).toLowerCase();
      const plan = (p.planName || "").toLowerCase();
      const invoice = (p.invoiceNumber || "").toLowerCase();
      const txn = (p.transactionId || "").toLowerCase();
      const user = (p.userName || p.userEmail || "").toLowerCase();

      return (
        orgName.includes(q) ||
        plan.includes(q) ||
        invoice.includes(q) ||
        txn.includes(q) ||
        user.includes(q)
      );
    });
  }, [payments, searchQuery]);

  // Aggregate stats
  const totalRevenue = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [payments]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 md:w-6 md:h-6 text-sky-500 shrink-0" />
            <span>Payment History</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
            Transaction and subscription records across all organizations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="h-[38px] px-3.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-sky-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Transactions</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{payments.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-500">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Subscriptions Value</p>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-500">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Showing Records</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{filteredPayments.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by organization, plan, invoice, or txn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[38px] pl-9 pr-3.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 shadow-2xs transition-colors"
          />
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-950/40">
                <th className="px-5 py-3">Invoice & Date</th>
                <th className="px-5 py-3">Organization</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-xs">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-xs">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => {
                  const orgName =
                    typeof p.organization === "object" && p.organization?.name
                      ? p.organization.name
                      : p.organizationName || "Unknown Org";
                  const dateStr = p.paidAt
                    ? new Date(p.paidAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";
                  const txn = p.transactionId || "-";

                  return (
                    <tr
                      key={p._id || txn}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900 dark:text-white">
                          {p.invoiceNumber || `INV-${p._id?.slice(-6).toUpperCase()}`}
                        </div>
                        <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                            <Building className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {orgName}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800">
                          {p.planName}
                        </span>
                        <div className="text-[10px] text-gray-400 mt-0.5 capitalize">
                          {p.billingCycle || "Monthly"}
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-bold text-gray-900 dark:text-white">
                          ₹{(p.amount || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400 font-medium">
                        {p.paymentMethod || "Card"}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {p.status || "Paid"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-gray-500">
                        <button
                          onClick={() => handleCopy(txn)}
                          className="inline-flex items-center gap-1 hover:text-sky-600 cursor-pointer ml-auto"
                          title="Copy Transaction ID"
                        >
                          <span>{txn.length > 16 ? `${txn.substring(0, 16)}...` : txn}</span>
                          {copiedId === txn ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SysAdminPaymentsView;
