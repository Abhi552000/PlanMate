import React, { useState } from "react";
import {
  X,
  CreditCard,
  CheckCircle2,
  Building,
  Check,
  Copy,
  Smartphone,
  Landmark,
} from "lucide-react";
import { IPlan } from "../../../types/organization";

interface DummyPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: IPlan | null;
  currentSubscription?: any;
  billingCycle?: "monthly" | "yearly";
  onSuccess: () => void;
  subscribeToPlan: (payload: {
    planId: string;
    billingCycle?: string;
    paymentDetails?: any;
  }) => Promise<any>;
}

export const DummyPaymentModal: React.FC<DummyPaymentModalProps> = ({
  isOpen,
  onClose,
  plan,
  currentSubscription,
  billingCycle = "monthly",
  onSuccess,
  subscribeToPlan,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReceipt, setPaymentReceipt] = useState<any | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi" | "netbanking">("card");

  if (!isOpen || !plan) return null;

  // Proration calculation for mid-cycle upgrade
  const basePrice =
    billingCycle === "yearly" && plan.price > 0 ? plan.price * 10 : plan.price;

  let unusedCredit = 0;
  let remainingDays = 0;
  if (
    currentSubscription &&
    currentSubscription.amountPaid > 0 &&
    currentSubscription.validUntil
  ) {
    const validUntilDate = new Date(currentSubscription.validUntil);
    const now = new Date();
    const remainingMs = validUntilDate.getTime() - now.getTime();
    if (remainingMs > 0) {
      remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
      const totalDays = currentSubscription.billingCycle === "yearly" ? 365 : 30;
      unusedCredit = Math.min(
        currentSubscription.amountPaid,
        Math.round((currentSubscription.amountPaid / totalDays) * remainingDays)
      );
    }
  }

  const finalPayable = Math.max(0, basePrice - unusedCredit);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await subscribeToPlan({
        planId: plan.planId,
        billingCycle,
        paymentDetails: {
          method: paymentMethod === "card" ? "Credit Card" : paymentMethod === "upi" ? "UPI" : "Net Banking",
        },
      });

      if (res?.success) {
        setPaymentReceipt(res.receipt);
        onSuccess();
      } else {
        setError(res?.message || "Failed to process payment");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to process payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyTxn = () => {
    if (paymentReceipt?.transactionId) {
      navigator.clipboard.writeText(paymentReceipt.transactionId);
      setCopiedTxn(true);
      setTimeout(() => setCopiedTxn(false), 2000);
    }
  };

  const handleClose = () => {
    setPaymentReceipt(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden text-gray-800 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {paymentReceipt ? "Payment Confirmed" : `Subscribe to ${plan.name}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {paymentReceipt ? "Your workspace tier is now active" : "Select a payment method to complete activation"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paymentReceipt ? (
          /* Receipt Screen */
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div className="text-xs">
                <p className="font-bold">{paymentReceipt.plan} Plan Activated</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Your workspace can now support up to {paymentReceipt.maxMembers} team members.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Invoice Number</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {paymentReceipt.invoiceNumber || "INV-2026"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{paymentReceipt.amount?.toLocaleString()} {paymentReceipt.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  Paid
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 dark:border-gray-800">
                <span className="text-gray-500">Transaction ID</span>
                <button
                  type="button"
                  onClick={handleCopyTxn}
                  className="font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300 hover:text-sky-600 flex items-center gap-1 cursor-pointer"
                  title="Copy Transaction ID"
                >
                  <span>{paymentReceipt.transactionId}</span>
                  {copiedTxn ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handlePay} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs">
                {error}
              </div>
            )}

            {/* Plan Summary with Proration */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase">Target Tier</p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Up to {plan.maxMembers} team members
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ₹{basePrice.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 capitalize">
                    / {billingCycle}
                  </p>
                </div>
              </div>

              {unusedCredit > 0 && (
                <div className="pt-2 border-t border-gray-200/60 dark:border-gray-800 space-y-1 text-xs">
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>
                      Upgrade Credit ({remainingDays} unused day{remainingDays > 1 ? "s" : ""})
                    </span>
                    <span>-₹{unusedCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <span>Net Payable Today</span>
                    <span>₹{finalPayable.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Payment Option
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "card"
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500"
                      : "border-slate-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "upi"
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500"
                      : "border-slate-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[11px] font-bold">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("netbanking")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "netbanking"
                      ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500"
                      : "border-slate-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <Landmark className="w-4 h-4" />
                  <span className="text-[11px] font-bold">Net Banking</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              This checkout simulates payment for your workspace and activates the plan immediately.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Processing..." : `Pay ₹${finalPayable.toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DummyPaymentModal;
