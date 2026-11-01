import React from "react";
import { Building, X, User, Mail, Lock, Save } from "lucide-react";
import { EditOrgModalProps } from "../../../types";

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
        className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="font-bold text-gray-800 dark:text-gray-205 text-base flex items-center gap-1.5">
            <Building className="w-5 h-5 text-sky-500" /> Edit {editingOrg.name}
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 hover:bg-sky-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onUpdateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Organization Name
            </label>
            <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <Building className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
              <input
                type="text"
                value={editForm.orgName}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, orgName: e.target.value }))}
                className="w-full focus:outline-none text-sm text-gray-800 dark:text-gray-250 font-semibold bg-transparent"
                placeholder="Organization Name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Admin Name
            </label>
            <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <User className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
              <input
                type="text"
                value={editForm.adminName}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, adminName: e.target.value }))}
                className="w-full focus:outline-none text-sm text-gray-805 dark:text-gray-250 font-semibold bg-transparent"
                placeholder="Admin Name"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Admin Email
            </label>
            <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <Mail className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
              <input
                type="email"
                value={editForm.adminEmail}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, adminEmail: e.target.value }))}
                className="w-full focus:outline-none text-sm text-gray-808 dark:text-gray-250 font-semibold bg-transparent"
                placeholder="Admin Email"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              New Admin Password
            </label>
            <div className="flex items-center border border-sky-100 dark:border-gray-800 rounded-lg px-3 py-2 bg-white dark:bg-gray-950 focus-within:ring-2 focus-within:ring-sky-500 focus-within:border-sky-500 transition-all duration-200">
              <Lock className="w-4 h-4 text-sky-500 mr-2 shrink-0" />
              <input
                type="password"
                value={editForm.adminPassword}
                onChange={(e) => setEditForm((prev: any) => ({ ...prev, adminPassword: e.target.value }))}
                className="w-full focus:outline-none text-sm text-gray-808 dark:text-gray-250 font-semibold bg-transparent"
                placeholder="Leave blank to keep current"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 font-medium">Leave password empty unless updating it.</p>
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
              disabled={updating}
              className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 text-white font-bold py-2 px-5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <Save className="w-4 h-4" /> {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
