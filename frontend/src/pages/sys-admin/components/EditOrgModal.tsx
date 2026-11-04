import React from "react";
import { X } from "lucide-react";
import { EditOrgModalProps } from "../../../types";
import { Input, Select } from "../../../components/ui";
import { ORG_MODALS_TEXTS } from "../../../constants/billingTexts";

const COMPANY_SIZE_OPTIONS = [
  { value: "", label: "Select company size" },
  { value: "1-10", label: "1-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "201-500", label: "201-500 employees" },
  { value: "500+", label: "500+ employees" },
];

export const EditOrgModal: React.FC<EditOrgModalProps> = ({
  editingOrg,
  onClose,
  editForm,
  setEditForm,
  updating,
  onUpdateSubmit,
}) => {
  if (!editingOrg) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-7 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3.5">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">
            {ORG_MODALS_TEXTS.EDIT_TITLE(editingOrg.name)}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
            aria-label={ORG_MODALS_TEXTS.ARIA_CLOSE}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onUpdateSubmit} className="space-y-3.5 text-xs">
          {/* Organization Name */}
          <Input
            label={ORG_MODALS_TEXTS.LABEL_ORG_NAME}
            type="text"
            value={editForm.orgName}
            onChange={(e) =>
              setEditForm((prev: any) => ({
                ...prev,
                orgName: e.target.value,
              }))
            }
            placeholder={ORG_MODALS_TEXTS.PLACEHOLDER_ORG_NAME}
            required
          />

          {/* Admin Full Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={ORG_MODALS_TEXTS.LABEL_ADMIN_NAME}
              type="text"
              value={editForm.adminName}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  adminName: e.target.value,
                }))
              }
              placeholder={ORG_MODALS_TEXTS.PLACEHOLDER_ADMIN_NAME}
              required
            />

            <Input
              label={ORG_MODALS_TEXTS.LABEL_ADMIN_EMAIL}
              type="email"
              value={editForm.adminEmail}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  adminEmail: e.target.value,
                }))
              }
              placeholder={ORG_MODALS_TEXTS.PLACEHOLDER_ADMIN_EMAIL}
              required
            />
          </div>

          {/* Industry & Company Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={ORG_MODALS_TEXTS.LABEL_INDUSTRY}
              type="text"
              value={editForm.industry || ""}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  industry: e.target.value,
                }))
              }
              placeholder="Enter industry or sector"
            />

            <Select
              label={ORG_MODALS_TEXTS.LABEL_COMPANY_SIZE}
              options={COMPANY_SIZE_OPTIONS}
              value={editForm.companySize || ""}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  companySize: e.target.value,
                }))
              }
            />
          </div>

          {/* Website URL & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Website URL"
              type="text"
              value={editForm.website || ""}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  website: e.target.value,
                }))
              }
              placeholder="Enter website URL"
            />

            <Input
              label="Location / Country"
              type="text"
              value={editForm.location || ""}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  location: e.target.value,
                }))
              }
              placeholder="Enter location or country"
            />
          </div>

          {/* Admin Phone & New Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Admin Contact Phone"
              type="tel"
              value={editForm.phone || ""}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  phone: e.target.value,
                }))
              }
              placeholder="Enter contact phone number"
            />

            <Input
              label="New Admin Password"
              type="password"
              value={editForm.adminPassword}
              onChange={(e) =>
                setEditForm((prev: any) => ({
                  ...prev,
                  adminPassword: e.target.value,
                }))
              }
              placeholder="Enter password (leave blank to keep current)"
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
                value={editForm.description || ""}
                onChange={(e) =>
                  setEditForm((prev: any) => ({
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
              disabled={updating}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-xl transition-colors cursor-pointer text-xs shadow-xs"
            >
              {updating ? ORG_MODALS_TEXTS.BTN_SAVING : ORG_MODALS_TEXTS.BTN_SAVE_CHANGES}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrgModal;
