import React, { useState } from "react";
import {
  Plus,
  X,
  Clock,
  Layers,
  Calendar,
  Tag,
  GitBranch,
  Link2,
} from "lucide-react";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { IBoardFeatures, ICustomField } from "../../types/organization";
import { orgService } from "../../services/orgService";
import { taskService } from "../../services/taskService";
import { toast } from "react-toastify";
import { getPriorityStyle } from "../../utils";
import { WORKSPACE_SETTINGS_TEXTS } from "../../constants/uiTexts";
import { TOAST_MESSAGES } from "../../constants/messages";

interface BoardCustomizationSettingsProps {
  statuses: string[];
  newStatus: string;
  setNewStatus: (value: string) => void;
  addingStatus: boolean;
  handleAddStatus: (e: React.FormEvent) => void;
  handleOpenDeleteStatusModal: (status: string) => void;
  boardFeatures: IBoardFeatures;
  priorities: string[];
  customFields: ICustomField[];
  onFeaturesUpdated: (features: IBoardFeatures) => void;
  onPrioritiesUpdated: (priorities: string[]) => void;
  onCustomFieldsUpdated: (fields: ICustomField[]) => void;
}

export const BoardCustomizationSettings: React.FC<BoardCustomizationSettingsProps> = ({
  statuses,
  newStatus,
  setNewStatus,
  addingStatus,
  handleAddStatus,
  handleOpenDeleteStatusModal,
  boardFeatures,
  priorities,
  customFields,
  onFeaturesUpdated,
  onPrioritiesUpdated,
  onCustomFieldsUpdated,
}) => {
  // Feature toggle state
  const [savingFeature, setSavingFeature] = useState<string | null>(null);

  // Custom priority states
  const [newPriority, setNewPriority] = useState("");
  const [addingPriority, setAddingPriority] = useState(false);
  const [priorityToDelete, setPriorityToDelete] = useState<string | null>(null);
  const [isCheckingTasks, setIsCheckingTasks] = useState(false);
  const [tasksCountForPriority, setTasksCountForPriority] = useState<number | null>(null);
  const [deletingPriority, setDeletingPriority] = useState<string | null>(null);

  // Custom field states
  const [showAddFieldModal, setShowAddFieldModal] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState<"text" | "number" | "dropdown" | "date">("text");
  const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
  const [optionInput, setOptionInput] = useState("");
  const [isFieldRequired, setIsFieldRequired] = useState(false);
  const [addingField, setAddingField] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<ICustomField | null>(null);
  const [deletingField, setDeletingField] = useState(false);

  // Handle Feature Toggle
  const handleToggleFeature = async (featureKey: keyof IBoardFeatures) => {
    const currentVal = boardFeatures[featureKey] !== false; // defaults to true
    const updatedFeatures: IBoardFeatures = {
      ...boardFeatures,
      [featureKey]: !currentVal,
    };

    setSavingFeature(featureKey);
    onFeaturesUpdated(updatedFeatures);

    try {
      const data = await orgService.updateBoardFeatures(updatedFeatures);
      if (data?.success) {
        toast.success(TOAST_MESSAGES.WORKSPACE_FEATURE_UPDATE_SUCCESS);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_FEATURE_UPDATE_ERROR);
      // Revert on error
      onFeaturesUpdated(boardFeatures);
    } finally {
      setSavingFeature(null);
    }
  };

  // Handle Add Priority
  const handleAddPriority = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newPriority.trim();
    if (!trimmed) {
      toast.error(TOAST_MESSAGES.WORKSPACE_PRIORITY_EMPTY_ERROR);
      return;
    }
    if (priorities.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(TOAST_MESSAGES.WORKSPACE_PRIORITY_EXISTS_ERROR);
      return;
    }

    setAddingPriority(true);
    try {
      const data = await orgService.addCustomPriority(trimmed);
      if (data?.success) {
        onPrioritiesUpdated(data.priorities);
        setNewPriority("");
        toast.success(TOAST_MESSAGES.WORKSPACE_PRIORITY_ADD_SUCCESS);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_PRIORITY_ADD_ERROR);
    } finally {
      setAddingPriority(false);
    }
  };

  // Check tasks and open priority delete confirmation
  const handleOpenDeletePriorityModal = async (priority: string) => {
    setPriorityToDelete(priority);
    setIsCheckingTasks(true);
    setTasksCountForPriority(null);
    try {
      const data = await taskService.getTasks();
      if (data?.success && data?.tasks) {
        const count = data.tasks.filter((t: any) => t.priority?.toLowerCase() === priority.toLowerCase()).length;
        setTasksCountForPriority(count);
      } else {
        setTasksCountForPriority(0);
      }
    } catch (err) {
      console.error(err);
      setTasksCountForPriority(0);
    } finally {
      setIsCheckingTasks(false);
    }
  };

  // Execute priority deletion
  const handleDeletePriority = async (priority: string) => {
    setDeletingPriority(priority);
    try {
      const data = await orgService.deleteCustomPriority(priority);
      if (data?.success) {
        onPrioritiesUpdated(data.priorities);
        toast.success(TOAST_MESSAGES.WORKSPACE_PRIORITY_DEL_SUCCESS);
        setPriorityToDelete(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_PRIORITY_DEL_ERROR);
    } finally {
      setDeletingPriority(null);
    }
  };

  // Handle Add Custom Field
  const handleAddCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newFieldName.trim();
    if (!trimmedName) {
      toast.error(TOAST_MESSAGES.WORKSPACE_FIELD_NAME_REQUIRED);
      return;
    }
    if (customFields.some((f) => f.name.toLowerCase() === trimmedName.toLowerCase())) {
      toast.error(TOAST_MESSAGES.WORKSPACE_FIELD_OPTION_EXISTS);
      return;
    }
    if (newFieldType === "dropdown" && dropdownOptions.length === 0) {
      toast.error(TOAST_MESSAGES.WORKSPACE_FIELD_DROPDOWN_OPTION_REQUIRED);
      return;
    }

    setAddingField(true);
    try {
      const data = await orgService.addCustomField({
        name: trimmedName,
        type: newFieldType,
        options: newFieldType === "dropdown" ? dropdownOptions : [],
        required: isFieldRequired,
      });

      if (data?.success) {
        onCustomFieldsUpdated(data.customFields);
        setShowAddFieldModal(false);
        setNewFieldName("");
        setNewFieldType("text");
        setDropdownOptions([]);
        setOptionInput("");
        setIsFieldRequired(false);
        toast.success(TOAST_MESSAGES.WORKSPACE_FIELD_ADD_SUCCESS);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_FIELD_ADD_ERROR);
    } finally {
      setAddingField(false);
    }
  };

  // Handle Delete Custom Field
  const handleDeleteCustomField = async () => {
    if (!fieldToDelete) return;
    setDeletingField(true);
    try {
      const data = await orgService.deleteCustomField(fieldToDelete.id);
      if (data?.success) {
        onCustomFieldsUpdated(data.customFields);
        toast.success(TOAST_MESSAGES.WORKSPACE_FIELD_DEL_SUCCESS);
        setFieldToDelete(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || TOAST_MESSAGES.WORKSPACE_FIELD_DEL_ERROR);
    } finally {
      setDeletingField(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 2. Required Fields */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-4">
        <div className="border-b border-sky-100 dark:border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {WORKSPACE_SETTINGS_TEXTS.REQUIRED_FIELDS_TITLE}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {WORKSPACE_SETTINGS_TEXTS.REQUIRED_FIELDS_DESC}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { name: WORKSPACE_SETTINGS_TEXTS.FIELD_TITLE_NAME, desc: WORKSPACE_SETTINGS_TEXTS.FIELD_TITLE_DESC },
            { name: WORKSPACE_SETTINGS_TEXTS.FIELD_STATUS_NAME, desc: WORKSPACE_SETTINGS_TEXTS.FIELD_STATUS_DESC },
            { name: WORKSPACE_SETTINGS_TEXTS.FIELD_PRIORITY_NAME, desc: WORKSPACE_SETTINGS_TEXTS.FIELD_PRIORITY_DESC },
            { name: WORKSPACE_SETTINGS_TEXTS.FIELD_ASSIGNEE_NAME, desc: WORKSPACE_SETTINGS_TEXTS.FIELD_ASSIGNEE_DESC },
          ].map((field) => (
            <div
              key={field.name}
              className="p-3 rounded-xl bg-sky-50/50 dark:bg-gray-850 border border-sky-100/60 dark:border-gray-800 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                  {field.name}
                </span>
                <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-100/70 dark:bg-sky-950/60 px-1.5 py-0.5 rounded">
                  {WORKSPACE_SETTINGS_TEXTS.BADGE_REQUIRED}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 leading-snug">
                {field.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Statuses & Priorities */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-6">
        <div className="border-b border-sky-100 dark:border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {WORKSPACE_SETTINGS_TEXTS.STATUSES_PRIORITIES_TITLE}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {WORKSPACE_SETTINGS_TEXTS.STATUSES_PRIORITIES_DESC}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Statuses Column */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {WORKSPACE_SETTINGS_TEXTS.STATUSES_SECTION_TITLE}
            </h4>
            <form onSubmit={handleAddStatus} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Input
                type="text"
                placeholder={WORKSPACE_SETTINGS_TEXTS.STATUS_INPUT_PLACEHOLDER}
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                required
                wrapperClassName="flex-1"
              />
              <Button
                type="submit"
                disabled={!newStatus.trim()}
                loading={addingStatus}
                variant="secondary"
                className="h-[46px] sm:h-[44px] justify-center px-4"
              >
                {WORKSPACE_SETTINGS_TEXTS.BTN_ADD_STATUS}
              </Button>
            </form>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {WORKSPACE_SETTINGS_TEXTS.LABEL_ACTIVE_STATUSES}
              </label>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 px-3 py-1.5 bg-sky-50/50 dark:bg-gray-850 rounded-xl border border-sky-100/55 dark:border-gray-800 text-xs font-bold text-gray-700 dark:text-gray-300 shadow-xs"
                  >
                    <span>{status}</span>
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteStatusModal(status)}
                      className="opacity-70 hover:opacity-100 hover:text-slate-800 dark:hover:text-white transition-opacity p-0.5 rounded cursor-pointer"
                      title={`Delete status "${status}"`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Priorities Column */}
          <div className="space-y-4 lg:border-l lg:border-sky-100/60 dark:lg:border-gray-800 lg:pl-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {WORKSPACE_SETTINGS_TEXTS.PRIORITIES_SECTION_TITLE}
            </h4>
            <form onSubmit={handleAddPriority} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <Input
                type="text"
                placeholder={WORKSPACE_SETTINGS_TEXTS.PRIORITY_INPUT_PLACEHOLDER}
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                wrapperClassName="flex-1"
              />
              <Button
                type="submit"
                disabled={!newPriority.trim()}
                loading={addingPriority}
                variant="secondary"
                className="h-[46px] sm:h-[44px] justify-center px-4"
              >
                {WORKSPACE_SETTINGS_TEXTS.BTN_ADD_PRIORITY}
              </Button>
            </form>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                {WORKSPACE_SETTINGS_TEXTS.LABEL_ACTIVE_PRIORITIES}
              </label>
              <div className="flex flex-wrap gap-2">
                {priorities.map((p) => (
                  <div
                    key={p}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-xs ${getPriorityStyle(
                      p
                    )}`}
                  >
                    <span>{p}</span>
                    {priorities.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleOpenDeletePriorityModal(p)}
                        className="opacity-70 hover:opacity-100 hover:text-slate-800 dark:hover:text-white transition-opacity p-0.5 rounded cursor-pointer"
                        title={`Delete priority "${p}"`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Board Features */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-4">
        <div className="border-b border-sky-100 dark:border-gray-800 pb-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
            {WORKSPACE_SETTINGS_TEXTS.BOARD_FEATURES_TITLE}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {WORKSPACE_SETTINGS_TEXTS.BOARD_FEATURES_DESC}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {[
            {
              key: "storyPoints" as keyof IBoardFeatures,
              label: WORKSPACE_SETTINGS_TEXTS.FEATURE_STORY_POINTS_LABEL,
              icon: Layers,
              desc: WORKSPACE_SETTINGS_TEXTS.FEATURE_STORY_POINTS_DESC,
            },
            {
              key: "timeTracking" as keyof IBoardFeatures,
              label: WORKSPACE_SETTINGS_TEXTS.FEATURE_TIME_TRACKING_LABEL,
              icon: Clock,
              desc: WORKSPACE_SETTINGS_TEXTS.FEATURE_TIME_TRACKING_DESC,
            },
            {
              key: "dueDates" as keyof IBoardFeatures,
              label: WORKSPACE_SETTINGS_TEXTS.FEATURE_DUE_DATES_LABEL,
              icon: Calendar,
              desc: WORKSPACE_SETTINGS_TEXTS.FEATURE_DUE_DATES_DESC,
            },
            {
              key: "labels" as keyof IBoardFeatures,
              label: WORKSPACE_SETTINGS_TEXTS.FEATURE_LABELS_LABEL,
              icon: Tag,
              desc: WORKSPACE_SETTINGS_TEXTS.FEATURE_LABELS_DESC,
            },
            {
              key: "subtasks" as keyof IBoardFeatures,
              label: WORKSPACE_SETTINGS_TEXTS.FEATURE_SUBTASKS_LABEL,
              icon: GitBranch,
              desc: WORKSPACE_SETTINGS_TEXTS.FEATURE_SUBTASKS_DESC,
            },
            {
              key: "issueLinking" as keyof IBoardFeatures,
              label: WORKSPACE_SETTINGS_TEXTS.FEATURE_TASK_LINKING_LABEL,
              icon: Link2,
              desc: WORKSPACE_SETTINGS_TEXTS.FEATURE_TASK_LINKING_DESC,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isEnabled = boardFeatures[item.key] !== false;
            const isSaving = savingFeature === item.key;

            return (
              <div
                key={item.key}
                className="flex items-start justify-between p-3.5 rounded-xl border border-sky-100/60 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-850/50 hover:bg-slate-50 dark:hover:bg-gray-850 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-sky-50 dark:bg-gray-800 text-sky-600 dark:text-sky-400 mt-0.5 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleToggleFeature(item.key)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isEnabled ? "bg-sky-500" : "bg-gray-200 dark:bg-gray-700"
                  } ${isSaving ? "opacity-50" : ""}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      isEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Custom Fields */}
      <div className="bg-white dark:bg-gray-900 p-5 sm:p-6 rounded-2xl border border-sky-100/50 dark:border-gray-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              {WORKSPACE_SETTINGS_TEXTS.CUSTOM_FIELDS_TITLE}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {WORKSPACE_SETTINGS_TEXTS.CUSTOM_FIELDS_DESC}
            </p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setShowAddFieldModal(true)}
            className="text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> {WORKSPACE_SETTINGS_TEXTS.BTN_ADD_FIELD}
          </Button>
        </div>

        {customFields.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            {WORKSPACE_SETTINGS_TEXTS.EMPTY_CUSTOM_FIELDS}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {customFields.map((field) => (
              <div
                key={field.id}
                className="p-3.5 rounded-xl border border-sky-100/60 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-850/50 flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {field.name}
                    </h4>
                    <span className="inline-block mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400 bg-sky-100/60 dark:bg-sky-950/50 px-1.5 py-0.5 rounded">
                      {field.type}
                    </span>
                    {field.required && (
                      <span className="inline-block ml-1.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/50 px-1.5 py-0.5 rounded">
                        {WORKSPACE_SETTINGS_TEXTS.BADGE_REQUIRED}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setFieldToDelete(field)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded cursor-pointer"
                    title={`Delete custom field "${field.name}"`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {field.type === "dropdown" && field.options && field.options.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {field.options.map((opt) => (
                      <span
                        key={opt}
                        className="text-[10px] bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300"
                      >
                        {opt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Priority Confirmation Modal */}
      {priorityToDelete && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setPriorityToDelete(null);
            setTasksCountForPriority(null);
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 max-w-sm w-full p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
              {WORKSPACE_SETTINGS_TEXTS.MODAL_DELETE_PRIORITY_TITLE}
            </h3>

            {isCheckingTasks ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className="w-6 h-6 border-2 border-sky-200 border-t-sky-600 rounded-full animate-spin"></div>
                <p className="text-xs text-gray-400 font-semibold">{WORKSPACE_SETTINGS_TEXTS.CHECKING_TASKS}</p>
              </div>
            ) : tasksCountForPriority !== null && tasksCountForPriority > 0 ? (
              <div className="space-y-3">
                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/60 p-3 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                  Cannot delete priority <span className="font-bold text-sky-600 dark:text-sky-400">"{priorityToDelete}"</span> because it is currently assigned to <strong>{tasksCountForPriority} task(s)</strong> in this workspace. Please reassign these tasks first.
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
                Are you sure you want to delete priority <span className="font-bold text-sky-600 dark:text-sky-400">"{priorityToDelete}"</span>? This priority will no longer be selectable.
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => {
                  setPriorityToDelete(null);
                  setTasksCountForPriority(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
              >
                {tasksCountForPriority !== null && tasksCountForPriority > 0 ? WORKSPACE_SETTINGS_TEXTS.BTN_CLOSE : WORKSPACE_SETTINGS_TEXTS.BTN_CANCEL}
              </button>
              {!(tasksCountForPriority !== null && tasksCountForPriority > 0) && (
                <button
                  type="button"
                  disabled={deletingPriority !== null || isCheckingTasks}
                  onClick={() => handleDeletePriority(priorityToDelete)}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {deletingPriority ? WORKSPACE_SETTINGS_TEXTS.BTN_DELETING_PRIORITY : WORKSPACE_SETTINGS_TEXTS.BTN_DELETE_PRIORITY}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Custom Field Confirmation Modal */}
      {fieldToDelete && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setFieldToDelete(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 max-w-sm w-full p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
              {WORKSPACE_SETTINGS_TEXTS.MODAL_DELETE_FIELD_TITLE}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-normal">
              Are you sure you want to remove <span className="font-bold text-sky-600 dark:text-sky-400">"{fieldToDelete.name}"</span>? It will no longer appear on new or existing tasks.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setFieldToDelete(null)}
                className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
              >
                {WORKSPACE_SETTINGS_TEXTS.BTN_CANCEL}
              </button>
              <button
                type="button"
                disabled={deletingField}
                onClick={handleDeleteCustomField}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {deletingField ? WORKSPACE_SETTINGS_TEXTS.BTN_REMOVING_FIELD : WORKSPACE_SETTINGS_TEXTS.BTN_REMOVE_FIELD}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Field Modal */}
      {showAddFieldModal && (
        <div
          className="fixed inset-0 bg-black/45 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setShowAddFieldModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-slate-200 dark:border-gray-800 max-w-md w-full p-6 space-y-4 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-sky-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-base">
                {WORKSPACE_SETTINGS_TEXTS.MODAL_ADD_FIELD_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFieldModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomField} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {WORKSPACE_SETTINGS_TEXTS.LABEL_FIELD_NAME}
                </label>
                <Input
                  type="text"
                  placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_FIELD_NAME}
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {WORKSPACE_SETTINGS_TEXTS.LABEL_FIELD_TYPE}
                </label>
                <select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value as any)}
                  className="w-full h-[40px] px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none cursor-pointer"
                >
                  <option value="text">{WORKSPACE_SETTINGS_TEXTS.TYPE_TEXT}</option>
                  <option value="number">{WORKSPACE_SETTINGS_TEXTS.TYPE_NUMBER}</option>
                  <option value="dropdown">{WORKSPACE_SETTINGS_TEXTS.TYPE_DROPDOWN}</option>
                  <option value="date">{WORKSPACE_SETTINGS_TEXTS.TYPE_DATE}</option>
                </select>
              </div>

              {newFieldType === "dropdown" && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">
                    {WORKSPACE_SETTINGS_TEXTS.LABEL_DROPDOWN_OPTIONS}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_DROPDOWN_OPTION}
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const val = optionInput.trim();
                          if (val && !dropdownOptions.includes(val)) {
                            setDropdownOptions([...dropdownOptions, val]);
                            setOptionInput("");
                          }
                        }
                      }}
                      className="flex-1 h-[36px] px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-xs bg-white dark:bg-gray-800 text-slate-800 dark:text-slate-100 focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const val = optionInput.trim();
                        if (val && !dropdownOptions.includes(val)) {
                          setDropdownOptions([...dropdownOptions, val]);
                          setOptionInput("");
                        }
                      }}
                      className="px-3 h-[36px] bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-850 rounded-lg text-xs font-semibold hover:bg-sky-100 cursor-pointer"
                    >
                      {WORKSPACE_SETTINGS_TEXTS.BTN_ADD_OPTION}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 min-h-[30px]">
                    {dropdownOptions.map((opt, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 text-xs bg-sky-50 dark:bg-gray-850 border border-sky-100 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-md"
                      >
                        {opt}
                        <button
                          type="button"
                          onClick={() => setDropdownOptions(dropdownOptions.filter((_, idx) => idx !== i))}
                          className="hover:text-slate-900 dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {dropdownOptions.length === 0 && (
                      <span className="text-[11px] text-gray-400 italic">{WORKSPACE_SETTINGS_TEXTS.NO_OPTIONS_YET}</span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="field-required"
                  checked={isFieldRequired}
                  onChange={(e) => setIsFieldRequired(e.target.checked)}
                  className="rounded border-gray-300 text-sky-500 focus:ring-sky-500 h-4 w-4 cursor-pointer"
                />
                <label htmlFor="field-required" className="text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                  {WORKSPACE_SETTINGS_TEXTS.LABEL_REQUIRE_FIELD}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowAddFieldModal(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-semibold rounded-lg text-xs transition-colors cursor-pointer bg-white dark:bg-gray-900"
                >
                  {WORKSPACE_SETTINGS_TEXTS.BTN_CANCEL}
                </button>
                <button
                  type="submit"
                  disabled={addingField || !newFieldName.trim()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-lg text-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {addingField ? WORKSPACE_SETTINGS_TEXTS.BTN_SAVING_FIELD : WORKSPACE_SETTINGS_TEXTS.BTN_CREATE_FIELD}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
