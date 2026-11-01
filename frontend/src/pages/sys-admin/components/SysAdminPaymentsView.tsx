import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  History,
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
import {
  FilterSelect,
  SearchInput,
  Pagination,
  TableCard,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from "../../../components/ui";

const ITEMS_PER_PAGE = 10;

export const SysAdminPaymentsView: React.FC = () => {
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [cycleFilter, setCycleFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // Debounce search query to trigger backend API efficiently
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, cycleFilter]);

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

  const totalPages = Math.max(1, Math.ceil(payments.length / ITEMS_PER_PAGE));
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return payments.slice(start, start + ITEMS_PER_PAGE);
  }, [payments, currentPage]);

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {SYSADMIN_PAYMENTS_TEXTS.PAGE_TITLE}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
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

      {/* FILTER & SEARCH (Placed above Hero Stats so filters control the stats & table) */}
      <div className="p-3 bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 rounded-2xl shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Billing Cycle Filter Dropdown */}
          <FilterSelect
            label="Cycle"
            value={cycleFilter}
            options={[
              { label: SYSADMIN_PAYMENTS_TEXTS.FILTER_ALL_CYCLES, value: "all" },
              { label: SYSADMIN_PAYMENTS_TEXTS.FILTER_MONTHLY, value: "monthly" },
              { label: SYSADMIN_PAYMENTS_TEXTS.FILTER_YEARLY, value: "yearly" },
            ]}
            onChange={setCycleFilter}
          />

          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={SYSADMIN_PAYMENTS_TEXTS.SEARCH_PLACEHOLDER}
            className="flex-1 min-w-[200px] max-w-md"
          />

          {(cycleFilter !== "all" || searchQuery.trim() !== "") && (
            <button
              onClick={() => {
                setCycleFilter("all");
                setSearchQuery("");
              }}
              className="px-3 py-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY STATS BAR (Hero stats reflecting active filter) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {SYSADMIN_PAYMENTS_TEXTS.STAT_TOTAL_TXNS}
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{payments.length}</p>
          </div>
          <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-500">
            <History className="w-5 h-5" />
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

      {/* PAYMENTS TABLE (Using unified TableCard & Table components) */}
      <TableCard>
        <Table>
          <TableHeader>
            <tr>
              <TableHead>{SYSADMIN_PAYMENTS_TEXTS.COL_INVOICE_DATE}</TableHead>
              <TableHead>{SYSADMIN_PAYMENTS_TEXTS.COL_ORGANIZATION}</TableHead>
              <TableHead>{SYSADMIN_PAYMENTS_TEXTS.COL_PLAN}</TableHead>
              <TableHead className="hidden md:table-cell">{SYSADMIN_PAYMENTS_TEXTS.COL_PLAN_TYPE}</TableHead>
              <TableHead>{SYSADMIN_PAYMENTS_TEXTS.COL_AMOUNT}</TableHead>
              <TableHead className="hidden sm:table-cell">{SYSADMIN_PAYMENTS_TEXTS.COL_METHOD}</TableHead>
              <TableHead>{SYSADMIN_PAYMENTS_TEXTS.COL_STATUS}</TableHead>
              <TableHead className="hidden lg:table-cell text-right">{SYSADMIN_PAYMENTS_TEXTS.COL_TRANSACTION_ID}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {tableLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell>
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="h-5 w-14 rounded-md bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-14 rounded bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="h-4 w-12 rounded bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell>
                    <div className="h-5 w-14 rounded-full bg-slate-200 dark:bg-slate-800" />
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-right">
                    <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-800 ml-auto" />
                  </TableCell>
                </TableRow>
              ))
            ) : payments.length === 0 ? (
              <TableEmpty colSpan={8} message={SYSADMIN_PAYMENTS_TEXTS.EMPTY_PAYMENTS} />
            ) : (
              paginatedPayments.map((p) => {
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
                  <TableRow key={p._id || txn}>
                    <TableCell>
                      <div className="font-bold text-gray-900 dark:text-white">
                        {p.invoiceNumber || `INV-${p._id?.slice(-6).toUpperCase()}`}
                      </div>
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3 text-gray-400 shrink-0" />
                        <span>{dateStr}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-5.5 h-5.5 rounded-md bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                          <Building className="w-3 h-3" />
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200 max-w-[140px] truncate">
                          {orgName}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800">
                        {p.planName}
                      </span>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize border border-gray-200/80 dark:border-gray-700">
                        {p.billingCycle || "Monthly"}
                      </span>
                    </TableCell>

                    <TableCell>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{(p.amount || 0).toLocaleString()}
                      </span>
                    </TableCell>

                    <TableCell className="hidden sm:table-cell text-gray-600 dark:text-gray-400 font-medium">
                      {p.paymentMethod || "Card"}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {p.status || "Paid"}
                      </span>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell text-right font-mono text-[10px] sm:text-[11px] text-gray-500">
                      <button
                        onClick={() => handleCopy(txn)}
                        className="inline-flex items-center gap-1 hover:text-sky-600 cursor-pointer ml-auto"
                        title={SYSADMIN_PAYMENTS_TEXTS.MSG_TXN_COPIED}
                      >
                        <span>{txn.length > 14 ? `${txn.substring(0, 14)}...` : txn}</span>
                        {copiedId === txn ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-400" />
                        )}
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={payments.length}
          pageSize={ITEMS_PER_PAGE}
          itemLabel="payments"
          onPageChange={setCurrentPage}
          disabled={tableLoading}
        />
      </TableCard>
    </div>
  );
};

export default SysAdminPaymentsView;
