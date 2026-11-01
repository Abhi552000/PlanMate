import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  X,
  CreditCard,
  CheckCircle2,
  Check,
  Copy,
  Smartphone,
  Landmark,
} from "lucide-react";
import { DummyPaymentModalProps, PaymentMethodOption, IPaymentReceipt } from "../../../types";
import { PAYMENT_MODAL_TEXTS } from "../../../constants/billingTexts";

const MS_PER_DAY = 86_400_000; // 1000 * 60 * 60 * 24

const PAYMENT_METHODS: Array<{
  id: PaymentMethodOption;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "card", label: PAYMENT_MODAL_TEXTS.METHOD_CARD, icon: CreditCard },
  { id: "upi", label: PAYMENT_MODAL_TEXTS.METHOD_UPI, icon: Smartphone },
  { id: "netbanking", label: PAYMENT_MODAL_TEXTS.METHOD_NETBANKING, icon: Landmark },
];

export const DummyPaymentModal: React.FC<DummyPaymentModalProps> = React.memo(({
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
  const [paymentReceipt, setPaymentReceipt] = useState<IPaymentReceipt | null>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodOption>("card");

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset internal states when modal closes or plan changes
  useEffect(() => {
    if (!isOpen) {
      setPaymentReceipt(null);
      setError(null);
      setCopiedTxn(false);
      setSubmitting(false);
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setPaymentReceipt(null);
    setError(null);
    onClose();
  }, [onClose]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, handleClose]);

  // Memoized proration calculation for mid-cycle upgrade
  const { basePrice, unusedCredit, remainingDays, finalPayable } = useMemo(() => {
    if (!plan) {
      return { basePrice: 0, unusedCredit: 0, remainingDays: 0, finalPayable: 0 };
    }

    const base = billingCycle === "yearly" && plan.price > 0 ? plan.price * 10 : plan.price;
    let credit = 0;
    let days = 0;

    if (
      currentSubscription &&
      currentSubscription.amountPaid > 0 &&
      currentSubscription.validUntil
    ) {
      const validUntilMs = new Date(currentSubscription.validUntil).getTime();
      const remainingMs = validUntilMs - Date.now();

      if (remainingMs > 0) {
        days = Math.ceil(remainingMs / MS_PER_DAY);
        const totalDays = currentSubscription.billingCycle === "yearly" ? 365 : 30;
        credit = Math.min(
          currentSubscription.amountPaid,
          Math.round((currentSubscription.amountPaid / totalDays) * days)
        );
      }
    }

    return {
      basePrice: base,
      unusedCredit: credit,
      remainingDays: days,
      finalPayable: Math.max(0, base - credit),
    };
  }, [plan, billingCycle, currentSubscription]);

  const handlePay = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !plan) return;

    setSubmitting(true);
    setError(null);

    const methodLabel =
      paymentMethod === "card"
        ? PAYMENT_MODAL_TEXTS.METHOD_CARD
        : paymentMethod === "upi"
        ? PAYMENT_MODAL_TEXTS.METHOD_UPI
        : PAYMENT_MODAL_TEXTS.METHOD_NETBANKING;

    try {
      const res = await subscribeToPlan({
        planId: plan.planId,
        billingCycle,
        paymentDetails: {
          method: methodLabel,
        },
      });

      if (res?.success) {
        setPaymentReceipt(res.receipt);
        onSuccess();
      } else {
        setError(res?.message || PAYMENT_MODAL_TEXTS.ERR_PAYMENT_PROCESS);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || PAYMENT_MODAL_TEXTS.ERR_PAYMENT_PROCESS);
    } finally {
      setSubmitting(false);
    }
  }, [submitting, plan, billingCycle, paymentMethod, subscribeToPlan, onSuccess]);

  const handleCopyTxn = useCallback(() => {
    if (paymentReceipt?.transactionId) {
      navigator.clipboard.writeText(paymentReceipt.transactionId);
      setCopiedTxn(true);
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => setCopiedTxn(false), 2000);
    }
  }, [paymentReceipt?.transactionId]);

  if (!isOpen || !plan) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) {
          handleClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden max-h-[90vh] overflow-y-auto text-gray-800 dark:text-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              {paymentReceipt
                ? PAYMENT_MODAL_TEXTS.TITLE_ACTIVE
                : currentSubscription?.planId?.toLowerCase() === plan?.planId?.toLowerCase()
                ? `Renew ${plan.name} Plan`
                : `${PAYMENT_MODAL_TEXTS.TITLE_SUBSCRIBE_PREFIX} ${plan.name}`}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {paymentReceipt
                ? PAYMENT_MODAL_TEXTS.SUBTITLE_ACTIVE
                : currentSubscription?.planId?.toLowerCase() === plan?.planId?.toLowerCase()
                ? "Complete payment to renew and reactivate your workspace"
                : PAYMENT_MODAL_TEXTS.SUBTITLE_SUBSCRIBE}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            aria-label="Close modal"
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
                <p className="font-bold">
                  {paymentReceipt.plan} {PAYMENT_MODAL_TEXTS.RECEIPT_ACTIVATED_SUFFIX}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  {PAYMENT_MODAL_TEXTS.RECEIPT_MAX_MEMBERS_TEXT(paymentReceipt.maxMembers)}
                </p>
              </div>
            </div>

            {paymentReceipt.explanation && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-100 dark:border-emerald-800/40">
                {paymentReceipt.explanation}
              </p>
            )}

            <div className="p-4 rounded-xl border border-slate-200 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-950/40 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">{PAYMENT_MODAL_TEXTS.LABEL_INVOICE_NUMBER}</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {paymentReceipt.invoiceNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{PAYMENT_MODAL_TEXTS.LABEL_AMOUNT}</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  ₹{paymentReceipt.amount?.toLocaleString()} {paymentReceipt.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{PAYMENT_MODAL_TEXTS.LABEL_STATUS}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {paymentReceipt.status || PAYMENT_MODAL_TEXTS.STATUS_PAID}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-gray-200/50 dark:border-gray-800">
                <span className="text-gray-500">{PAYMENT_MODAL_TEXTS.LABEL_TXN_ID}</span>
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
              type="button"
              onClick={handleClose}
              className="w-full h-10 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              {PAYMENT_MODAL_TEXTS.BTN_DONE}
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
                  <p className="text-xs text-gray-400 font-semibold uppercase">
                    {PAYMENT_MODAL_TEXTS.LABEL_TARGET_TIER}
                  </p>
                  <h4 className="font-bold text-gray-900 dark:text-white text-base">
                    {plan.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {PAYMENT_MODAL_TEXTS.RECEIPT_MAX_MEMBERS_TEXT(plan.maxMembers)}
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
                    <span>{PAYMENT_MODAL_TEXTS.UPGRADE_CREDIT_LABEL(remainingDays)}</span>
                    <span>-₹{unusedCredit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white pt-1 border-t border-dashed border-gray-200 dark:border-gray-800">
                    <span>{PAYMENT_MODAL_TEXTS.NET_PAYABLE_TODAY}</span>
                    <span>₹{finalPayable.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                {PAYMENT_MODAL_TEXTS.PAYMENT_OPTION_LABEL}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => {
                  const isSelected = paymentMethod === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPaymentMethod(id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 ring-1 ring-sky-500"
                          : "border-slate-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px] font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              {PAYMENT_MODAL_TEXTS.CHECKOUT_NOTE}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-slate-200 dark:border-gray-700 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                {PAYMENT_MODAL_TEXTS.BTN_CANCEL}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting
                  ? PAYMENT_MODAL_TEXTS.BTN_PROCESSING
                  : `${PAYMENT_MODAL_TEXTS.BTN_PAY_PREFIX} ₹${finalPayable.toLocaleString()}`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
});

DummyPaymentModal.displayName = "DummyPaymentModal";

export default DummyPaymentModal;
