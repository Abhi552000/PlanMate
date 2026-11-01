import React from "react";
import { CreditCard, AlertCircle, ArrowRight, User } from "lucide-react";
import { SUBSCRIPTION_EXPIRED_TEXTS } from "../../constants/uiTexts";
import { Button } from "../ui/Button";

interface SubscriptionExpiredModalProps {
  planName?: string;
  onRenew: () => void;
  onManageAccount: () => void;
}

export const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({
  planName = "Starter",
  onRenew,
  onManageAccount,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-expired-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 text-center">
        {/* Subtle Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center mb-4">
          <CreditCard className="w-6 h-6" />
        </div>

        {/* Status Pill */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 mb-3">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{SUBSCRIPTION_EXPIRED_TEXTS.MODAL_BADGE}</span>
        </div>

        {/* Title */}
        <h2
          id="subscription-expired-title"
          className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight"
        >
          {SUBSCRIPTION_EXPIRED_TEXTS.MODAL_TITLE}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {SUBSCRIPTION_EXPIRED_TEXTS.MODAL_DESCRIPTION}
        </p>

        {/* Plan Info Card */}
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 mb-6 flex items-center justify-between text-xs">
          <div className="text-left">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">
              {SUBSCRIPTION_EXPIRED_TEXTS.PLAN_LABEL}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
              {planName}
            </span>
          </div>
          <div className="text-right">
            <span className="text-slate-500 dark:text-slate-400 block font-medium">
              {SUBSCRIPTION_EXPIRED_TEXTS.STATUS_LABEL}
            </span>
            <span className="inline-block px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-400 font-semibold uppercase text-[10px] tracking-wider">
              {SUBSCRIPTION_EXPIRED_TEXTS.STATUS_EXPIRED}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <Button
            type="button"
            variant="primary"
            onClick={onRenew}
            className="w-full justify-center py-2.5 shadow-md shadow-sky-500/10"
          >
            <span>{SUBSCRIPTION_EXPIRED_TEXTS.BTN_RENEW_PLAN}</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={onManageAccount}
            className="w-full justify-center py-2 text-slate-700 dark:text-slate-300"
          >
            <User className="w-4 h-4 mr-1.5 text-slate-500" />
            <span>{SUBSCRIPTION_EXPIRED_TEXTS.BTN_GO_PROFILE}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionExpiredModal;
