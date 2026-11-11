import React from "react";
import { Building } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { WorkspaceBrandingFormExtendedProps } from "../../types";
import { WORKSPACE_SETTINGS_TEXTS } from "../../constants/uiTexts";

export const WorkspaceBrandingForm: React.FC<WorkspaceBrandingFormExtendedProps> = ({
  orgData,
  savingOrg,
  handleOrgChange,
  handleUpdateOrg,
  dynamicDescription,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-xl border border-sky-100/50 dark:border-slate-800 shadow-sm">
      <form onSubmit={handleUpdateOrg} className="space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100/60 dark:border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {WORKSPACE_SETTINGS_TEXTS.BRANDING_TITLE}
            </h3>
          </div>
          <Button
            type="submit"
            loading={savingOrg}
            icon={<Building className="w-4.5 h-4.5" />}
            size="md"
          >
            {WORKSPACE_SETTINGS_TEXTS.BTN_SAVE_CHANGES}
          </Button>
        </div>

        <Input
          label={WORKSPACE_SETTINGS_TEXTS.LABEL_WORKSPACE_NAME}
          type="text"
          name="name"
          value={orgData.name}
          onChange={handleOrgChange}
          placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_WORKSPACE_NAME}
          required
        />

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
            {WORKSPACE_SETTINGS_TEXTS.LABEL_DESCRIPTION}
          </label>
          <textarea
            name="description"
            value={orgData.description}
            onChange={handleOrgChange}
            rows={4}
            className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg text-sm bg-white dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all duration-200 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
            placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_DESCRIPTION}
          />
        </div>
      </form>
    </div>
  );
};
