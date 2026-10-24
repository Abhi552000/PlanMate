import React from "react";
import { Building, X, Check, Copy, User, Mail, Lock } from "lucide-react";
import { OnboardOrgModalProps } from "../../../types";

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
        className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base flex items-center gap-1.5">
            <Building className="w-5 h-5 text-sky-500" /> Onboard Organization
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {onboardedResult ? (
          <div className="space-y-4 py-2 text-center">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-gray-800 dark:text-gray-250 text-sm">Onboarding Complete!</h4>
              <p className="text-xs text-gray-405 font-medium">Successfully created tenant site for {onboardedResult.orgName}</p>
            </div>

            <div className="bg-sky-50/40 dark:bg-sky-950/20 p-4 rounded-xl border border-sky-100/50 dark:border-gray-800 text-left text-xs space-y-2.5">
              <div>
                <span className="block font-bold text-gray-405 uppercase tracking-wider text-[9px]">Admin Email</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">{onboardedResult.email}</span>
              </div>
              <div>
                <span className="block font-bold text-gray-405 uppercase tracking-wider text-[9px]">Generated Temporary Password</span>
                <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-2 rounded border border-sky-100 dark:border-gray-800 mt-1 select-all font-mono font-bold text-gray-800 dark:text-gray-200">
                  <span>{onboardedResult.password}</span>
                  <button
                    onClick={onCopyPassword}
                    className="text-sky-600 hover:text-sky-700 p-1 hover:bg-sky-50 rounded transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {copied ? <span className="text-[10px] text-green-600 font-bold">Copied!</span> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-red-500 font-semibold italic">Copy these credentials now. The temporary password will not be shown again.</p>

            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r cursor-pointer from-cyan-500 to-sky-600 text-white font-bold py-2 rounded-lg text-xs hover:shadow-md transition-all duration-200"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onboardSubmit} className="space-y-4">
            <div>
              <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Organization Name</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                <Building className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={newOrg.orgName}
                  onChange={(e) => setNewOrg((prev: any) => ({ ...prev, orgName: e.target.value }))}
                  className="w-full focus:outline-none text-sm text-gray-800 dark:text-gray-250 font-semibold bg-transparent"
                  placeholder="e.g. Pepsi, TCS, Apple"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Admin Full Name</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                <User className="w-4.5 h-4.5 text-sky-500 mr-2 shrink-0" />
                <input
                  type="text"
                  value={newOrg.adminName}
                  onChange={(e) => setNewOrg((prev: any) => ({ ...prev, adminName: e.target.value }))}
                  className="w-full focus:outline-none text-sm text-gray-800 dark:text-gray-250 font-semibold bg-transparent"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                <span>Admin Email Address</span>
                <span className="text-red-500 font-bold">*</span>
              </label>
              <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                <Mail className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                <input
                  type="email"
                  value={newOrg.adminEmail}
                  onChange={(e) => setNewOrg((prev: any) => ({ ...prev, adminEmail: e.target.value }))}
                  className="w-full focus:outline-none text-sm text-gray-800 dark:text-gray-250 font-semibold bg-transparent"
                  placeholder="e.g. admin@tcs.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Custom Password (Optional)
              </label>
              <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
                <Lock className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
                <input
                  type="password"
                  value={newOrg.adminPassword}
                  onChange={(e) => setNewOrg((prev: any) => ({ ...prev, adminPassword: e.target.value }))}
                  className="w-full focus:outline-none text-sm text-gray-800 dark:text-gray-250 font-semibold bg-transparent"
                  placeholder="Leave blank to generate randomly"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold">If left empty, a secure password will be generated automatically.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-sky-50 dark:border-gray-800 mt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-sky-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:bg-sky-50 dark:hover:bg-gray-800 font-bold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={onboarding}
                className="bg-gradient-to-r from-cyan-500 to-sky-600 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 hover:shadow-md transition-all duration-200 cursor-pointer text-xs"
              >
                {onboarding ? "Onboarding..." : "Onboard Organization"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
