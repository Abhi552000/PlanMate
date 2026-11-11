import React from "react";
import { UserPlus, X, User, Mail, Lock, Plus, ShieldCheck } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
import { OnboardMemberModalProps } from "../../../types";

export const OnboardMemberModal: React.FC<OnboardMemberModalProps> = ({
  isOpen,
  onClose,
  newMember,
  setNewMember,
  addingMember,
  onAddMember,
  availableRoles = [],
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 w-full max-w-lg rounded-xl shadow-2xl overflow-hidden p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UserPlus className="w-4.5 h-4.5 text-sky-500" /> Onboard Team Member
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-sky-600 transition-colors p-1 rounded-full cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onAddMember} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={newMember.name}
            onChange={(e) =>
              setNewMember((prev: any) => ({
                ...prev,
                name: e.target.value,
              }))
            }
            icon={<User className="w-4 h-4 text-sky-500" />}
            placeholder="John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            value={newMember.email}
            onChange={(e) =>
              setNewMember((prev: any) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            icon={<Mail className="w-4 h-4 text-sky-500" />}
            placeholder="john@tcs.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={newMember.password}
            onChange={(e) =>
              setNewMember((prev: any) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            icon={<Lock className="w-4 h-4 text-sky-500" />}
            placeholder="At least 8 characters"
            required
          />

          {availableRoles.length > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-500" />
                <span>Assign Workspace Role</span>
              </label>
              <select
                value={newMember.roleId || ""}
                onChange={(e) =>
                  setNewMember((prev: any) => ({
                    ...prev,
                    roleId: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-xs border border-sky-100 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 dark:text-gray-200 font-medium"
              >
                <option value="">Standard Member (Default)</option>
                {availableRoles.map((r: any) => (
                  <option key={r._id} value={r._id}>
                    {r.name} {r.isSystemDefault ? "(Default)" : "(Custom)"}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-3 border-t border-sky-50 dark:border-gray-800">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={addingMember}
              icon={<Plus className="w-4.5 h-4.5" />}
            >
              Onboard Member
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
