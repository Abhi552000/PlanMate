import React from "react";
import { Flame, Clock, CheckCircle } from "lucide-react";
import { Button } from "../../../../components/ui/Button";
import { ACTIVE_SPRINT_TEXTS } from "../../../../constants/uiTexts";
import { ActiveSprintHeaderProps } from "../../../../types";

export const ActiveSprintHeader: React.FC<ActiveSprintHeaderProps> = ({
  activeSprint,
  remainingDays,
  handleCompleteSprint,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-lg md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
            {activeSprint.name}
          </h1>
          <span className="text-[9px] font-black uppercase tracking-wider bg-sky-500 text-white px-2 py-0.5 rounded shadow-2xs flex items-center gap-1 shrink-0">
            <Flame className="w-3 h-3" /> {ACTIVE_SPRINT_TEXTS.LABEL_ACTIVE}
          </span>
        </div>
        {activeSprint.goal && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">
            {ACTIVE_SPRINT_TEXTS.LABEL_GOAL}: {activeSprint.goal}
          </p>
        )}
        {remainingDays && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-500" /> {remainingDays}
          </p>
        )}
      </div>
      <Button
        variant="primary"
        size="md"
        onClick={handleCompleteSprint}
        icon={<CheckCircle className="w-4 h-4" />}
      >
        {ACTIVE_SPRINT_TEXTS.BTN_COMPLETE_SPRINT}
      </Button>
    </div>
  );
};
