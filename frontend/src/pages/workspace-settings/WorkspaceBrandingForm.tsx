import React from "react";
import { Building } from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { WorkspaceBrandingFormProps } from "../../types";
import { WORKSPACE_SETTINGS_TEXTS } from "../../constants/uiTexts";

export const WorkspaceBrandingForm: React.FC<WorkspaceBrandingFormProps> = ({
  orgData,
  savingOrg,
  handleOrgChange,
  handleUpdateOrg,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm">
      <form onSubmit={handleUpdateOrg} className="space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {WORKSPACE_SETTINGS_TEXTS.BRANDING_TITLE}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {WORKSPACE_SETTINGS_TEXTS.BRANDING_DESC}
            </p>
          </div>
          <Button
            type="submit"
            loading={savingOrg}
            icon={<Building className="w-4.5 h-4.5" />}
            size="sm"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
            {WORKSPACE_SETTINGS_TEXTS.LABEL_DESCRIPTION}
          </label>
          <textarea
            name="description"
            value={orgData.description}
            onChange={handleOrgChange}
            rows={4}
            className="w-full px-3.5 py-2.5 border border-sky-100 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-sky-505 focus:border-sky-505 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
            placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_DESCRIPTION}
          />
        </div>
      </form>
    </div>
  );
};
