import React from "react";
import { X } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { BACKLOG_TEXTS, ACTIVE_SPRINT_TEXTS } from "../../../../constants/uiTexts";
import { BacklogModalsProps } from "../../../../types";

export const BacklogModals: React.FC<BacklogModalsProps> = ({
  showCreateSprint,
  setShowCreateSprint,
  newSprintName,
  setNewSprintName,
  creatingSprint,
  handleCreateSprint,
  showStartSprint,
  setShowStartSprint,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  startGoal,
  setStartGoal,
  startingSprint,
  handleStartSprint,
  showCreateEpic,
  setShowCreateEpic,
  newEpicName,
  setNewEpicName,
  newEpicColor,
  setNewEpicColor,
  newEpicDesc,
  setNewEpicDesc,
  creatingEpic,
  handleCreateEpic,
  confirmCompleteSprintId,
  setConfirmCompleteSprintId,
  completingSprint,
  handleConfirmCompleteSprint,
  confirmDeleteSprintId,
  setConfirmDeleteSprintId,
  deletingSprint,
  handleConfirmDeleteSprint,
}) => {
  return (
    <>
      {/* Create Sprint Modal */}
      {showCreateSprint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSprint}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
          >
            <div className="flex justify-between items-center border-b border-sky-50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
                {BACKLOG_TEXTS.MODAL_NEW_SPRINT_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateSprint(false)}
                className="text-gray-400 hover:text-sky-655 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                {BACKLOG_TEXTS.LABEL_SPRINT_NAME}
              </label>
              <input
                type="text"
                placeholder={BACKLOG_TEXTS.PLACEHOLDER_SPRINT_NAME}
                value={newSprintName}
                onChange={(e) => setNewSprintName(e.target.value)}
                className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowCreateSprint(false)}
              >
                {BACKLOG_TEXTS.BTN_CANCEL}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={creatingSprint}
              >
                {BACKLOG_TEXTS.BTN_CREATE_SPRINT}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Start Sprint Modal */}
      {showStartSprint && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form
            onSubmit={handleStartSprint}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
          >
            <div className="flex justify-between items-center border-b border-sky-50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
                {BACKLOG_TEXTS.MODAL_START_SPRINT_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setShowStartSprint(null)}
                className="text-gray-400 hover:text-sky-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {BACKLOG_TEXTS.LABEL_START_DATE}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-505"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {BACKLOG_TEXTS.LABEL_END_DATE}
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-505"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {BACKLOG_TEXTS.LABEL_SPRINT_GOAL}
                </label>
                <textarea
                  placeholder={BACKLOG_TEXTS.PLACEHOLDER_SPRINT_GOAL}
                  value={startGoal}
                  onChange={(e) => setStartGoal(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-505"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowStartSprint(null)}
              >
                {BACKLOG_TEXTS.BTN_CANCEL}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={startingSprint}
              >
                {BACKLOG_TEXTS.BTN_START}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Create Epic Modal */}
      {showCreateEpic && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateEpic}
            className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4"
          >
            <div className="flex justify-between items-center border-b border-sky-50 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-lg">
                {BACKLOG_TEXTS.MODAL_CREATE_EPIC_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateEpic(false)}
                className="text-gray-400 hover:text-sky-600 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {BACKLOG_TEXTS.LABEL_EPIC_NAME}
                </label>
                <input
                  type="text"
                  placeholder={BACKLOG_TEXTS.PLACEHOLDER_EPIC_NAME}
                  value={newEpicName}
                  onChange={(e) => setNewEpicName(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-505"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {BACKLOG_TEXTS.LABEL_THEME_COLOR}
                </label>
                <select
                  value={newEpicColor}
                  onChange={(e) => setNewEpicColor(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-505"
                >
                  <option value="sky">{BACKLOG_TEXTS.COLOR_SKY}</option>
                  <option value="emerald">{BACKLOG_TEXTS.COLOR_EMERALD}</option>
                  <option value="violet">{BACKLOG_TEXTS.COLOR_VIOLET}</option>
                  <option value="amber">{BACKLOG_TEXTS.COLOR_AMBER}</option>
                  <option value="rose">{BACKLOG_TEXTS.COLOR_ROSE}</option>
                  <option value="indigo">{BACKLOG_TEXTS.COLOR_INDIGO}</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                  {BACKLOG_TEXTS.LABEL_DESCRIPTION}
                </label>
                <textarea
                  placeholder={BACKLOG_TEXTS.PLACEHOLDER_EPIC_DESC}
                  value={newEpicDesc}
                  onChange={(e) => setNewEpicDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-sky-100 dark:border-gray-750 bg-white dark:bg-gray-800 rounded-lg text-sm focus:ring-2 focus:ring-sky-505"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setShowCreateEpic(false)}
              >
                {BACKLOG_TEXTS.BTN_CANCEL}
              </Button>
              <Button
                variant="primary"
                size="sm"
                type="submit"
                loading={creatingEpic}
              >
                {BACKLOG_TEXTS.MODAL_CREATE_EPIC_TITLE}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Confirm Complete Modal */}
      {confirmCompleteSprintId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-850 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                {ACTIVE_SPRINT_TEXTS.MODAL_COMPLETE_SPRINT_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setConfirmCompleteSprintId(null)}
                className="text-gray-400 hover:text-sky-655 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-550 dark:text-gray-400">
              {ACTIVE_SPRINT_TEXTS.MODAL_COMPLETE_SPRINT_DESC}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setConfirmCompleteSprintId(null)}
              >
                {BACKLOG_TEXTS.BTN_CANCEL}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleConfirmCompleteSprint}
                loading={completingSprint}
              >
                {ACTIVE_SPRINT_TEXTS.BTN_CONFIRM}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete/Close Modal */}
      {confirmDeleteSprintId && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/35 z-55 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 border border-sky-100 dark:border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-fadeIn space-y-4">
            <div className="flex justify-between items-center border-b border-sky-50 dark:border-gray-850 pb-2">
              <h3 className="font-extrabold text-gray-900 dark:text-white text-base">
                {BACKLOG_TEXTS.MODAL_CLOSE_SPRINT_TITLE}
              </h3>
              <button
                type="button"
                onClick={() => setConfirmDeleteSprintId(null)}
                className="text-gray-400 hover:text-sky-655 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-555 dark:text-gray-400">
              {BACKLOG_TEXTS.MODAL_CLOSE_SPRINT_DESC}
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={() => setConfirmDeleteSprintId(null)}
              >
                {BACKLOG_TEXTS.BTN_CANCEL}
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleConfirmDeleteSprint}
                loading={deletingSprint}
              >
                {BACKLOG_TEXTS.MODAL_CLOSE_SPRINT_TITLE}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
