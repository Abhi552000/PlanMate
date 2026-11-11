import React from "react";
import { X, Check, Copy } from "lucide-react";
import { OnboardOrgModalProps } from "../../../types";
import { Input, Select } from "../../../components/ui";
import { ORG_MODALS_TEXTS, TENANT_MODAL_TEXTS } from "../../../constants/billingTexts";

const COMPANY_SIZE_OPTIONS = [
  { value: "", label: "Select company size" },
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

export const OnboardOrgModal: React.FC<OnboardOrgModalProps> = ({
  isOpen,
  onClose,
  newOrg,
  setNewOrg,
  onboardedResult,
  onboardSubmit,
  onboarding,
  copied,
  onCopyPassword,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-xl shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3.5">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
            {ORG_MODALS_TEXTS.ONBOARD_TITLE}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            aria-label={ORG_MODALS_TEXTS.ARIA_CLOSE}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {onboardedResult ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <Check className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                {ORG_MODALS_TEXTS.ONBOARD_COMPLETE_TITLE}
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                {ORG_MODALS_TEXTS.ONBOARD_COMPLETE_SUBTITLE(onboardedResult.orgName)}
              </p>
            </div>

            <div className="bg-sky-50/40 dark:bg-sky-950/20 p-4 rounded-xl border border-sky-100/50 dark:border-gray-800 text-left text-xs space-y-2.5">
              <div>
                <span className="block font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  {TENANT_MODAL_TEXTS.LABEL_ADMIN_EMAIL}
                </span>
                <span className="font-bold text-gray-700 dark:text-gray-300">
                  {onboardedResult.email}
                </span>
              </div>
              <div>
                <span className="block font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                  {ORG_MODALS_TEXTS.LABEL_GENERATED_PASSWORD}
                </span>
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded-lg border border-slate-200 dark:border-gray-800 mt-1 select-all font-mono font-bold text-gray-800 dark:text-gray-200">
                  <span>{onboardedResult.password}</span>
                  <button
                    type="button"
                    onClick={onCopyPassword}
                    className="text-sky-600 hover:text-sky-700 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                    title={ORG_MODALS_TEXTS.TOOLTIP_COPY_PASSWORD}
                  >
                    {copied ? (
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {ORG_MODALS_TEXTS.TOOLTIP_PASSWORD_COPIED}
                      </span>
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-rose-500 font-semibold italic">
              Copy these credentials now. The temporary password will not be shown again.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer"
            >
              {TENANT_MODAL_TEXTS.BTN_DONE}
            </button>
          </div>
        ) : (
          <form onSubmit={onboardSubmit} className="space-y-3.5 text-xs">
            {/* Organization Name */}
            <Input
              label="Organization Name *"
              type="text"
              value={newOrg.orgName}
              onChange={(e) =>
                setNewOrg((prev: any) => ({
                  ...prev,
                  orgName: e.target.value,
                }))
              }
              placeholder="Enter organization name"
              required
            />

            {/* Admin Name & Admin Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin Full Name *"
                type="text"
                value={newOrg.adminName}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    adminName: e.target.value,
                  }))
                }
                placeholder="Enter administrator name"
                required
              />

              <Input
                label="Admin Email Address *"
                type="email"
                value={newOrg.adminEmail}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    adminEmail: e.target.value,
                  }))
                }
                placeholder="Enter administrator email"
                required
              />
            </div>

            {/* Industry & Company Size */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Industry / Sector"
                type="text"
                value={newOrg.industry || ""}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    industry: e.target.value,
                  }))
                }
                placeholder="Enter industry or sector"
              />

              <Select
                label="Company Size"
                options={COMPANY_SIZE_OPTIONS}
                value={newOrg.companySize || ""}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    companySize: e.target.value,
                  }))
                }
              />
            </div>

            {/* Website & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Website URL"
                type="text"
                value={newOrg.website || ""}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    website: e.target.value,
                  }))
                }
                placeholder="Enter website URL"
              />

              <Input
                label="Location / Country"
                type="text"
                value={newOrg.location || ""}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Enter location or country"
              />
            </div>

            {/* Admin Phone & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Admin Contact Phone"
                type="tel"
                value={newOrg.phone || ""}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Enter contact phone number"
              />

              <Input
                label="Custom Password"
                type="password"
                value={newOrg.adminPassword}
                onChange={(e) =>
                  setNewOrg((prev: any) => ({
                    ...prev,
                    adminPassword: e.target.value,
                  }))
                }
                placeholder="Enter password (leave blank to auto-generate)"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5 w-full">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                Organization Description
              </label>
              <div className="border border-slate-200/90 dark:border-slate-800 rounded-xl px-3 py-2.5 bg-white dark:bg-slate-900 transition-all duration-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-500">
                <textarea
                  rows={2}
                  value={newOrg.description || ""}
                  onChange={(e) =>
                    setNewOrg((prev: any) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full focus:outline-none text-sm text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 dark:placeholder-slate-500 font-medium resize-none"
                  placeholder="Enter organization description"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-bold rounded-xl text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
              >
                {ORG_MODALS_TEXTS.BTN_CANCEL}
              </button>
              <button
                type="submit"
                disabled={onboarding}
                className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl transition-colors cursor-pointer text-xs shadow-xs"
              >
                {onboarding ? ORG_MODALS_TEXTS.BTN_ONBOARDING : ORG_MODALS_TEXTS.BTN_ONBOARD_SUBMIT}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default OnboardOrgModal;
