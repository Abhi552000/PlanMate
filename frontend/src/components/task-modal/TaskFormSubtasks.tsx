import React from "react";
import { CheckCircle, X } from "lucide-react";

interface TaskFormSubtasksProps {
  subtasks: any[];
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  newSubtaskTitle: string;
  setNewSubtaskTitle: (val: string) => void;
  editingSubtaskIdx: number | null;
  setEditingSubtaskIdx: (val: number | null) => void;
  editingSubtaskVal: string;
  setEditingSubtaskVal: (val: string) => void;
  statuses: string[];
  onOpenSubtaskDetail: (subtask: any, index: number) => void;
  onAddSubtask: () => void;
}

export const TaskFormSubtasks: React.FC<TaskFormSubtasksProps> = ({
  subtasks,
  setTaskData,
  newSubtaskTitle,
  setNewSubtaskTitle,
  editingSubtaskIdx,
  setEditingSubtaskIdx,
  editingSubtaskVal,
  setEditingSubtaskVal,
  statuses,
  onOpenSubtaskDetail,
  onAddSubtask,
}) => {
  return (
    <div>
      <label className=" flex items-center gap-1 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        <CheckCircle className=" w-4 h-4 text-sky-500" /> Subtasks Checklist
      </label>
      
      {/* Scrollable subtasks container */}
      <div className=" space-y-2 max-h-48 overflow-y-auto pr-1">
        {subtasks.map((st: any, index: number) => {
          const currentStatus = st.status || (st.completed ? "Done" : "To Do");
          
          return (
            <div key={index} className="flex items-center justify-between gap-3 bg-sky-50/30 p-2.5 rounded-lg border border-sky-100/50 text-xs">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {editingSubtaskIdx === index ? (
                  <input
                    type="text"
                    value={editingSubtaskVal}
                    onChange={(e) => setEditingSubtaskVal(e.target.value)}
                    onBlur={() => {
                      if (editingSubtaskVal.trim()) {
                        const updated = [...subtasks];
                        updated[index].title = editingSubtaskVal.trim();
                        setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                      }
                      setEditingSubtaskIdx(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingSubtaskVal.trim()) {
                          const updated = [...subtasks];
                          updated[index].title = editingSubtaskVal.trim();
                          setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                        }
                        setEditingSubtaskIdx(null);
                      }
                    }}
                    className="flex-1 px-2 py-0.5 border border-sky-100 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none text-gray-850 bg-white"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => {
                      setEditingSubtaskIdx(index);
                      setEditingSubtaskVal(st.title);
                    }}
                    className={`truncate text-gray-750 dark:text-gray-300 font-medium cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800 px-1 rounded flex-1 ${currentStatus === "Done" ? 'line-through text-gray-400' : ''}`}
                    title="Click to edit summary"
                  >
                    {st.title}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSubtaskDetail(st, index)}
                  className="text-sky-600 hover:text-sky-800 p-1 hover:bg-sky-50 rounded transition-colors text-[10px] font-bold shrink-0 cursor-pointer"
                  title="Open Sub-task Details"
                >
                  Open Details
                </button>

                <select
                  value={currentStatus}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    const updated = [...subtasks];
                    updated[index].status = newStatus;
                    updated[index].completed = newStatus.toLowerCase() === "done";
                    setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                  }}
                  className={`px-1.5 py-0.5 bg-white border border-sky-100 rounded text-[10px] font-bold cursor-pointer focus:outline-none ${
                    currentStatus === "Done" ? "text-green-700 bg-green-50" :
                    currentStatus === "In Progress" ? "text-amber-700 bg-amber-50" :
                    "text-sky-700 bg-sky-50"
                  }`}
                >
                  {statuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => {
                    const updated = subtasks.filter((_: any, i: number) => i !== index);
                    setTaskData((prev: any) => ({ ...prev, subtasks: updated }));
                  }}
                  className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subtask addition form row */}
      <div className="flex gap-2 mt-2">
        <input
          type="text"
          placeholder="Add a new checklist item..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          className="flex-1 px-3 py-2 border border-sky-100 dark:border-gray-700 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-gray-900"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddSubtask();
            }
          }}
        />
        <button
          type="button"
          onClick={onAddSubtask}
          className="w-full sm:w-auto px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
};
