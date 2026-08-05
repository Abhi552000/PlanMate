import React from "react";
import { UserPlus, X, User, Mail, Lock, Plus } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";

interface OnboardMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  newMember: any;
  setNewMember: React.Dispatch<React.SetStateAction<any>>;
  addingMember: boolean;
  onAddMember: (e: React.FormEvent) => void;
}

export const OnboardMemberModal: React.FC<OnboardMemberModalProps> = ({
  isOpen,
  onClose,
  newMember,
  setNewMember,
  addingMember,
  onAddMember,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-gray-850 dark:text-gray-200 flex items-center gap-2">
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

          <div className="flex justify-end gap-3 pt-3 border-t border-sky-50 dark:border-gray-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
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
