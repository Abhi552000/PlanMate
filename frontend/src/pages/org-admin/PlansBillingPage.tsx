import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  Users,
  RotateCw,
  ArrowRight,
  Receipt,
  Check,
  Copy,
} from "lucide-react";
import { toast } from "react-toastify";
import { orgService } from "../../services/orgService";
import { planService } from "../../services/planService";
import { IPlan, IOrganizationSubscription, ISubscriptionMetrics, IPaymentRecord } from "../../types";
import { PLANS_BILLING_TEXTS } from "../../constants/billingTexts";
import { DummyPaymentModal } from "./components/DummyPaymentModal";

export const PlansBillingPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subscription, setSubscription] = useState<IOrganizationSubscription | null>(null);
  const [metrics, setMetrics] = useState<ISubscriptionMetrics | null>(null);
  const [plans, setPlans] = useState<IPlan[]>([]);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<IPlan | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [copiedTxn, setCopiedTxn] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<IPaymentRecord[]>([]);

  const usedSeats = metrics?.activeMembersCount ?? metrics?.activeMembers ?? 0;
  const maxSeats = subscription?.maxMembers ?? metrics?.maxMembers ?? 5;
  const remainingSeats =
    metrics?.remainingSeats !== undefined
      ? metrics.remainingSeats
      : Math.max(0, maxSeats - usedSeats);
  const usagePercent =
    metrics?.usagePercent !== undefined
      ? metrics.usagePercent
      : Math.min(100, Math.round((usedSeats / Math.max(1, maxSeats)) * 100));
  const currentPlanId = (subscription?.planId || "starter").toLowerCase();

  const handleOpenUpgrade = (plan: IPlan) => {
    setSelectedPlanForUpgrade(plan);
    setModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    loadData(true);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxn(text);
    toast.success(PLANS_BILLING_TEXTS.MSG_TXN_COPIED);
    setTimeout(() => setCopiedTxn(null), 2000);
  };

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [subRes, plansRes, historyRes] = await Promise.all([
        orgService.getSubscription(),
        planService.getActivePlans(),
        orgService.getBillingHistory(),
      ]);

      if (subRes?.success) {
        setSubscription(subRes.subscription);
        setMetrics(subRes.metrics);
        if (subRes.subscription?.billingCycle === "yearly") {
          setBillingCycle("yearly");
        }
      }

      if (plansRes?.success) {
        setPlans(plansRes.plans);
      }

      if (historyRes?.success) {
        setInvoices(historyRes.payments || []);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || PLANS_BILLING_TEXTS.ERR_LOAD_DATA);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="w-full space-y-6 font-sans animate-pulse select-none">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded-lg bg-slate-200 dark:bg-slate-800 shrink-0" />
              <div className="h-6 md:h-7 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-4 w-72 sm:w-96 ml-7 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="h-[38px] w-24 rounded-lg bg-slate-200 dark:bg-slate-800 self-start sm:self-auto" />
        </div>

        {/* Current Plan Card Skeleton */}
        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="space-y-2">
              <div className="h-3 w-20 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="flex items-center gap-2">
                <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="h-5 w-16 rounded-full bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
            <div className="space-y-1.5 sm:text-right">
              <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800 sm:ml-auto" />
              <div className="h-6 w-32 rounded-lg bg-slate-200 dark:bg-slate-800 sm:ml-auto" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-800" />
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-56 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
        </div>

        {/* Available Plans Skeleton */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1.5">
              <div className="h-5 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
              <div className="h-3.5 w-64 rounded bg-slate-100 dark:bg-slate-800/60" />
            </div>
            <div className="h-9 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 self-start sm:self-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-6 rounded-2xl border border-slate-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-5 w-24 rounded-lg bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-14 rounded-full bg-slate-100 dark:bg-slate-800" />
                  </div>
                  <div className="h-3.5 w-full rounded bg-slate-100 dark:bg-slate-800/60" />
                  <div className="py-3 border-y border-gray-100 dark:border-gray-800 space-y-1">
                    <div className="h-7 w-28 rounded-lg bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <div className="h-8 rounded-xl bg-slate-100 dark:bg-slate-800/60" />
                  <div className="space-y-2 pt-2">
                    {[1, 2, 3].map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
                        <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="h-10 w-full rounded-xl bg-slate-200 dark:bg-slate-800 mt-4" />
              </div>
            ))}
          </div>
        </div>

        {/* Billing History Skeleton */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs overflow-hidden p-5 space-y-4">
          <div className="space-y-1.5">
            <div className="h-4 w-32 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="h-3 w-52 rounded bg-slate-100 dark:bg-slate-800/60" />
          </div>
          <div className="space-y-3 pt-2">
            {[1, 2, 3].map((r) => (
              <div key={r} className="h-9 w-full rounded-lg bg-slate-100 dark:bg-slate-800/50" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 font-sans">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <CreditCard className="text-sky-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span>{PLANS_BILLING_TEXTS.PAGE_TITLE}</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7 truncate">
            {PLANS_BILLING_TEXTS.PAGE_SUBTITLE}
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="h-[38px] px-3.5 bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCw className={`w-3.5 h-3.5 text-sky-500 ${refreshing ? "animate-spin" : ""}`} />
          <span>{PLANS_BILLING_TEXTS.BTN_REFRESH}</span>
        </button>
      </div>

      {/* CURRENT ACTIVE PLAN SUMMARY */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              {PLANS_BILLING_TEXTS.LABEL_CURRENT_PLAN}
            </span>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {subscription?.planName || "Starter"}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {PLANS_BILLING_TEXTS.BADGE_ACTIVE}
              </span>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-gray-400 font-medium">
              {PLANS_BILLING_TEXTS.LABEL_BILLED} {subscription?.billingCycle || "Monthly"}
            </span>
            <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              ₹{(subscription?.amountPaid || 0).toLocaleString()}{" "}
              <span className="text-xs text-gray-400 font-normal">
                {PLANS_BILLING_TEXTS.PER_MONTH}
              </span>
            </p>
          </div>
        </div>

        {/* Member Seats Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-sky-500" />
              {PLANS_BILLING_TEXTS.LABEL_MEMBER_SEATS}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">
              {PLANS_BILLING_TEXTS.SEATS_USED_TEXT(usedSeats, maxSeats, usagePercent)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercent >= 100
                  ? "bg-rose-500"
                  : usagePercent >= 80
                  ? "bg-amber-500"
                  : "bg-sky-500"
              }`}
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {remainingSeats > 0
              ? PLANS_BILLING_TEXTS.SEATS_REMAINING_TEXT(remainingSeats)
              : PLANS_BILLING_TEXTS.SEATS_LIMIT_REACHED}
          </p>
        </div>
      </div>

      {/* AVAILABLE SUBSCRIPTION TIERS */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {PLANS_BILLING_TEXTS.AVAILABLE_PLANS_TITLE}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {PLANS_BILLING_TEXTS.AVAILABLE_PLANS_SUBTITLE}
            </p>
          </div>

          {/* Monthly / Yearly Switcher */}
          <div className="inline-flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                billingCycle === "monthly"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              {PLANS_BILLING_TEXTS.CYCLE_MONTHLY}
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                billingCycle === "yearly"
                  ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-2xs"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
              }`}
            >
              <span>{PLANS_BILLING_TEXTS.CYCLE_YEARLY}</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {PLANS_BILLING_TEXTS.SAVE_YEARLY_BADGE}
              </span>
            </button>
          </div>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const isCurrent = plan.planId.toLowerCase() === currentPlanId;
            const displayPrice =
              billingCycle === "yearly" && plan.price > 0
                ? Math.round((plan.price * 10) / 12)
                : plan.price;

            return (
              <div
                key={plan.planId}
                className={`p-6 rounded-2xl border transition-all flex flex-col justify-between bg-white dark:bg-gray-900 shadow-2xs ${
                  isCurrent
                    ? "border-sky-500 ring-2 ring-sky-500/20"
                    : plan.isPopular
                    ? "border-sky-300 dark:border-sky-800"
                    : "border-slate-200 dark:border-gray-800"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">
                      {plan.name}
                    </h3>
                    {isCurrent ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-white">
                        {PLANS_BILLING_TEXTS.BADGE_CURRENT}
                      </span>
                    ) : plan.isPopular ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        {PLANS_BILLING_TEXTS.BADGE_POPULAR}
                      </span>
                    ) : null}
                  </div>

                  {plan.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 min-h-[32px]">
                      {plan.description}
                    </p>
                  )}

                  <div className="my-4 py-3 border-y border-gray-100 dark:border-gray-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-gray-900 dark:text-white">
                        ₹{displayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {PLANS_BILLING_TEXTS.PER_MONTH}
                      </span>
                    </div>
                    {billingCycle === "yearly" && plan.price > 0 && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                        {PLANS_BILLING_TEXTS.BILLED_ANNUALLY_TEXT(plan.price * 10)}
                      </p>
                    )}
                  </div>

                  <div className="mb-4 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-950/50 border border-slate-200 dark:border-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-sky-500" />
                    <span>{PLANS_BILLING_TEXTS.UP_TO_MEMBERS(plan.maxMembers)}</span>
                  </div>

                  <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300 mb-6">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-tight">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full h-10 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      {PLANS_BILLING_TEXTS.BTN_CURRENT_PLAN}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenUpgrade(plan)}
                      className="w-full h-10 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>
                        {PLANS_BILLING_TEXTS.BTN_UPGRADE_PREFIX} {plan.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING HISTORY / INVOICES */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/30">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-sky-500" />
            {PLANS_BILLING_TEXTS.INVOICES_TITLE}
          </h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {PLANS_BILLING_TEXTS.INVOICES_SUBTITLE}
          </p>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider bg-gray-50/60 dark:bg-gray-950/40">
                <th className="px-5 py-3">{PLANS_BILLING_TEXTS.COL_INVOICE}</th>
                <th className="px-5 py-3">{PLANS_BILLING_TEXTS.COL_DATE}</th>
                <th className="px-5 py-3">{PLANS_BILLING_TEXTS.COL_PLAN}</th>
                <th className="px-5 py-3">{PLANS_BILLING_TEXTS.COL_PLAN_TYPE}</th>
                <th className="px-5 py-3">{PLANS_BILLING_TEXTS.COL_AMOUNT}</th>
                <th className="px-5 py-3">{PLANS_BILLING_TEXTS.COL_STATUS}</th>
                <th className="px-5 py-3 text-right">{PLANS_BILLING_TEXTS.COL_TRANSACTION}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-xs">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-gray-400">
                    {PLANS_BILLING_TEXTS.EMPTY_INVOICES}
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const invId =
                    inv.invoiceNumber ||
                    (inv._id ? `INV-${inv._id.toString().slice(-6).toUpperCase()}` : "INV-PLANMATE");
                  const invDate = inv.paidAt
                    ? new Date(inv.paidAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "-";
                  const txnId = inv.transactionId || "-";

                  return (
                    <tr
                      key={inv._id || txnId}
                      className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                        {invId}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">
                        {invDate}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-100 dark:border-sky-800">
                          {inv.planName}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize border border-gray-200/80 dark:border-gray-700">
                          {inv.billingCycle || "Monthly"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-900 dark:text-white">
                        ₹{(inv.amount || 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {inv.status || "Paid"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-gray-500">
                        <button
                          onClick={() => handleCopy(txnId)}
                          className="inline-flex items-center gap-1 hover:text-sky-600 cursor-pointer ml-auto"
                          title={PLANS_BILLING_TEXTS.TOOLTIP_COPY_TXN}
                        >
                          <span>{txnId.length > 18 ? `${txnId.substring(0, 18)}...` : txnId}</span>
                          {copiedTxn === txnId ? (
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

      {/* Payment Modal */}
      <DummyPaymentModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        plan={selectedPlanForUpgrade}
        currentSubscription={subscription}
        billingCycle={billingCycle}
        onSuccess={handlePaymentSuccess}
        subscribeToPlan={orgService.subscribeToPlan}
      />
    </div>
  );
};

export default PlansBillingPage;
