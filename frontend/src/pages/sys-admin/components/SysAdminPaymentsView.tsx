import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
import { IPaymentRecord } from "../../../types";
import { SYSADMIN_PAYMENTS_TEXTS } from "../../../constants/billingTexts";

export const SysAdminPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Debounce search query to trigger backend API efficiently
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchPayments = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (isInitialLoadRef.current) {
        setLoading(true);
      } else {
        setTableLoading(true);
      }

      try {
        const params: Record<string, any> = {};
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (cycleFilter !== "all") params.billingCycle = cycleFilter;

        const res = await orgService.getAllPaymentsForAdmin(params);
        if (res?.success) {
          setPayments(res.payments || []);
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || SYSADMIN_PAYMENTS_TEXTS.ERR_LOAD_PAYMENTS);
      } finally {
        isInitialLoadRef.current = false;
        setLoading(false);
        setTableLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, cycleFilter]
  );

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(SYSADMIN_PAYMENTS_TEXTS.MSG_TXN_COPIED);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Aggregate stats
  const totalRevenue = useMemo(() => {
    return payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  }, [payments]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="h-6 w-44 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-4 w-72 ml-8 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-[38px] w-24 rounded-lg bg-slate-200 dark:bg-slate-800 self-start sm:self-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between"
            >
              <div className="space-y-2">
                <div className="h-3 w-28 rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-6 w-16 rounded bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800" />
            </div>
          ))}
        </div>

        <div className="h-[38px] w-72 rounded-lg bg-slate-100 dark:bg-slate-800" />

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs p-5 space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-full rounded-lg bg-slate-100 dark:bg-slate-800/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 md:w-6 md:h-6 text-sky-500 shrink-0" />
            <span>{SYSADMIN_PAYMENTS_TEXTS.PAGE_TITLE}</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7">
            {SYSADMIN_PAYMENTS_TEXTS.PAGE_SUBTITLE}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            className="h-[38px] px-3.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RotateCw className={`w-3.5 h-3.5 text-sky-500 ${refreshing ? "animate-spin" : ""}`} />
            <span>{SYSADMIN_PAYMENTS_TEXTS.BTN_REFRESH}</span>
          </button>
        </div>
      </div>

      {/* SUMMARY STATS BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {SYSADMIN_PAYMENTS_TEXTS.STAT_TOTAL_TXNS}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{payments.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-500">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {SYSADMIN_PAYMENTS_TEXTS.STAT_TOTAL_VALUE}
            </p>
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
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {SYSADMIN_PAYMENTS_TEXTS.STAT_SHOWING_RECORDS}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{payments.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500">
            <Building className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Billing Cycle Filter Dropdown */}
          <select
            value={cycleFilter}
            onChange={(e) => setCycleFilter(e.target.value)}
            className="h-[38px] px-3 bg-white dark:bg-gray-950 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer shadow-2xs"
          >
            <option value="all">{SYSADMIN_PAYMENTS_TEXTS.FILTER_ALL_CYCLES}</option>
            <option value="monthly">{SYSADMIN_PAYMENTS_TEXTS.FILTER_MONTHLY}</option>
            <option value="yearly">{SYSADMIN_PAYMENTS_TEXTS.FILTER_YEARLY}</option>
          </select>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={SYSADMIN_PAYMENTS_TEXTS.SEARCH_PLACEHOLDER}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[38px] pl-9 pr-3.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded-lg text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-sky-500 shadow-2xs transition-colors"
            />
          </div>
        </div>
      </div>

      {/* PAYMENTS TABLE */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-950/40">
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_INVOICE_DATE}</th>
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_ORGANIZATION}</th>
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_PLAN}</th>
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_PLAN_TYPE}</th>
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_AMOUNT}</th>
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_METHOD}</th>
                <th className="px-5 py-3">{SYSADMIN_PAYMENTS_TEXTS.COL_STATUS}</th>
                <th className="px-5 py-3 text-right">{SYSADMIN_PAYMENTS_TEXTS.COL_TRANSACTION_ID}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {tableLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-5 py-4">
                      <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-16 rounded-md bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-5 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-xs">
                    {SYSADMIN_PAYMENTS_TEXTS.EMPTY_PAYMENTS}
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const orgName =
                    typeof p.organization === "object" && p.organization?.name
                      ? p.organization.name
                      : p.organizationName || SYSADMIN_PAYMENTS_TEXTS.UNKNOWN_ORG;
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
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize border border-gray-200/80 dark:border-gray-700">
                          {p.billingCycle || "Monthly"}
                        </span>
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
                          title={SYSADMIN_PAYMENTS_TEXTS.MSG_TXN_COPIED}
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
