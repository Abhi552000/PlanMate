import React from "react";
import { CheckCircle, Plus, X } from "lucide-react";
import { SubtaskListSectionProps } from "../../../types";

export const SubtaskListSection: React.FC<SubtaskListSectionProps> = ({
  subtasks,
  projectKey,
  newSubtaskTitle,
  setNewSubtaskTitle,
  editingSubtaskIdx,
  setEditingSubtaskIdx,
  editingSubtaskVal,
  setEditingSubtaskVal,
  statuses,
  setParentTaskData,
  onOpenSubtask,
  handleAddSubtask,
}) => {
  return (
    <div className="border-t border-sky-100/50 dark:border-gray-800 pt-5">
      <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
        <CheckCircle className="w-4 h-4 text-sky-500" /> Sub-tasks Checklist
      </label>

      {/* Scrollable Subtasks Table-like List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {subtasks.map((st: any, index: number) => {
          const currentStatus = st.status || (st.completed ? "Done" : "To Do");
          const subtaskKey = `${projectKey}-${index + 1}`;

          return (
            <div key={index} className="flex items-center justify-between gap-3 bg-sky-50/20 dark:bg-sky-950/10 hover:bg-sky-50/40 p-2.5 rounded-xl border border-sky-100/40 dark:border-gray-800 text-xs transition-colors">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[10px] font-bold text-gray-405 select-all shrink-0">
                  {subtaskKey}
                </span>
                
                {editingSubtaskIdx === index ? (
                  <input
                    type="text"
                    value={editingSubtaskVal}
                    onChange={(e) => setEditingSubtaskVal(e.target.value)}
                    onBlur={() => {
                      if (editingSubtaskVal.trim()) {
                        const updated = [...subtasks];
                        updated[index].title = editingSubtaskVal.trim();
                        setParentTaskData((prev: any) => prev ? { ...prev, subtasks: updated } : null);
                      }
                      setEditingSubtaskIdx(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (editingSubtaskVal.trim()) {
                          const updated = [...subtasks];
                          updated[index].title = editingSubtaskVal.trim();
                          setParentTaskData((prev: any) => prev ? { ...prev, subtasks: updated } : null);
                        }
                        setEditingSubtaskIdx(null);
                      }
                    }}
                    className="flex-1 px-2 py-0.5 border border-sky-100 rounded text-xs focus:ring-1 focus:ring-sky-500 focus:outline-none text-gray-850 bg-white font-medium"
                    autoFocus
                  />
                ) : (
                  <span 
                    onClick={() => {
                      setEditingSubtaskIdx(index);
                      setEditingSubtaskVal(st.title);
                    }}
                    className={`truncate text-gray-750 dark:text-gray-300 font-semibold cursor-pointer hover:bg-sky-50 dark:hover:bg-gray-800 px-1 rounded flex-1 ${currentStatus === "Done" ? 'line-through text-gray-405 font-medium' : ''}`}
                    title="Click to edit summary"
                  >
                    {st.title}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenSubtask(index)}
                  className="text-sky-600 hover:text-sky-850 p-1 hover:bg-sky-50 rounded transition-colors text-[10px] font-bold cursor-pointer"
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
                    setParentTaskData((prev: any) => prev ? { ...prev, subtasks: updated } : null);
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
                    const updated = subtasks.filter((_, i) => i !== index);
                    setParentTaskData((prev: any) => prev ? { ...prev, subtasks: updated } : null);
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

      {/* Add Subtask form */}
      <div className="flex gap-2 mt-3.5">
        <input
          id="new-subtask-input"
          type="text"
          placeholder="Create sub-task..."
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          className="flex-1 px-3 py-2 border border-sky-100 dark:border-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddSubtask();
            }
          }}
        />
        <button
          type="button"
          onClick={handleAddSubtask}
          className="px-4 py-2 bg-sky-100 hover:bg-sky-200 text-sky-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
};
