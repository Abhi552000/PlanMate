import React, { useState, useMemo } from "react";
import { useBoard } from "../../context/BoardContext";
import { CreateBoardModal } from "../../components/board/CreateBoardModal";
import { EditBoardModal } from "../../components/board/EditBoardModal";
import { IBoard, BoardManagementPanelProps } from "../../types";
import { toast } from "react-toastify";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { BoardCustomizationSettings } from "./BoardCustomizationSettings";
import { SearchInput } from "../../components/ui/SearchInput";
import { Button } from "../../components/ui/Button";
import { WORKSPACE_SETTINGS_TEXTS } from "../../constants/uiTexts";
import { TOAST_MESSAGES } from "../../constants/messages";

export const BoardManagementPanel: React.FC<BoardManagementPanelProps> = ({
  selectedBoard,
  onSelectBoard,
  dynamicDescription,
  statuses,
  newStatus,
  setNewStatus,
  addingStatus,
  handleAddStatus,
  handleOpenDeleteModal,
  boardFeatures,
  priorities,
  customFields,
  onFeaturesUpdated,
  onPrioritiesUpdated,
  onCustomFieldsUpdated,
  dynamicDescriptions,
}) => {
  const { boards, deleteBoard } = useBoard();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<IBoard | null>(null);
  // By default, all board selecting accordions are closed
  const [expandedBoardId, setExpandedBoardId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter boards by name, key, or environment
  const filteredBoards = useMemo(() => {
    if (!searchQuery.trim()) return boards;
    const q = searchQuery.toLowerCase().trim();
    return boards.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.key.toLowerCase().includes(q) ||
        b.environment.toLowerCase().includes(q)
    );
  }, [boards, searchQuery]);

  const handleToggleExpand = (board: IBoard) => {
    if (expandedBoardId === board._id) {
      // Toggle off if already expanded
      setExpandedBoardId(null);
    } else {
      setExpandedBoardId(board._id);
      onSelectBoard(board);
    }
  };

  const handleDelete = async (board: IBoard) => {
    if (board.isDefault) {
      toast.error(TOAST_MESSAGES.BOARD_DELETE_DEFAULT_ERROR);
      return;
    }
    const ticketCount = board.totalTasks ?? board.taskCounter ?? 0;
    if (ticketCount > 0) {
      toast.error(
        TOAST_MESSAGES.BOARD_DELETE_HAS_TASKS_ERROR(board.name, ticketCount)
      );
      return;
    }
    if (!window.confirm(TOAST_MESSAGES.BOARD_DELETE_CONFIRM(board.name))) {
      return;
    }

    try {
      setDeletingId(board._id);
      await deleteBoard(board._id);
      toast.success(TOAST_MESSAGES.BOARD_DELETE_SUCCESS(board.name));
      if (expandedBoardId === board._id) {
        const remaining = boards.filter((b) => b._id !== board._id);
        if (remaining.length > 0) {
          setExpandedBoardId(null);
          onSelectBoard(remaining[0]);
        } else {
          setExpandedBoardId(null);
        }
      }
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.BOARD_DELETE_ERROR);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden space-y-0">
      {/* Panel Header with Title, Search Input, and Add Board */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            {WORKSPACE_SETTINGS_TEXTS.BOARDS_PANEL_TITLE}
          </h2>
        </div>

        {/* Search Input & Add Board Button */}
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={WORKSPACE_SETTINGS_TEXTS.SEARCH_BOARDS_PLACEHOLDER}
            className="w-48 sm:w-60"
          />

          <Button
            type="button"
            size="md"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setCreateModalOpen(true)}
          >
            {WORKSPACE_SETTINGS_TEXTS.BTN_ADD_BOARD}
          </Button>
        </div>
      </div>

      {/* Accordion List of Boards */}
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {filteredBoards.map((b) => {
          const isExpanded = expandedBoardId === b._id;

          return (
            <div
              key={b._id}
              className={`transition-colors ${
                isExpanded
                  ? "bg-sky-50/20 dark:bg-sky-950/10"
                  : "hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
              }`}
            >
              {/* Accordion Row Header */}
              <div
                onClick={() => handleToggleExpand(b)}
                className="p-4 sm:px-5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                {/* Left: Expand Chevron, Key, Name */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </div>

                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                    {b.key}
                  </span>

                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                    {b.name}
                  </span>
                </div>

                {/* Right: Modify & Delete Icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBoard(b);
                    }}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title={WORKSPACE_SETTINGS_TEXTS.TOOLTIP_MODIFY_BOARD(b.name)}
                    aria-label={WORKSPACE_SETTINGS_TEXTS.ARIA_MODIFY_BOARD}
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  {!b.isDefault && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(b);
                      }}
                      disabled={deletingId === b._id}
                      className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                      title={WORKSPACE_SETTINGS_TEXTS.TOOLTIP_DELETE_BOARD(b.name)}
                      aria-label={WORKSPACE_SETTINGS_TEXTS.ARIA_DELETE_BOARD}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Accordion Expanded Content (Configuration for this Board) */}
              {isExpanded && (
                <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40 p-4 sm:p-6 space-y-6 animate-fade-in">
                  <BoardCustomizationSettings
                    statuses={statuses}
                    newStatus={newStatus}
                    setNewStatus={setNewStatus}
                    addingStatus={addingStatus}
                    handleAddStatus={handleAddStatus}
                    handleOpenDeleteStatusModal={handleOpenDeleteModal}
                    boardFeatures={boardFeatures}
                    priorities={priorities}
                    customFields={customFields}
                    onFeaturesUpdated={onFeaturesUpdated}
                    onPrioritiesUpdated={onPrioritiesUpdated}
                    onCustomFieldsUpdated={onCustomFieldsUpdated}
                    activeSection="all"
                    dynamicDescriptions={dynamicDescriptions}
                  />
                </div>
              )}
            </div>
          );
        })}

        {filteredBoards.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            {searchQuery
              ? `No boards matching "${searchQuery}" found.`
              : 'No environment boards found. Click "+ Add Board" to create one.'}
          </div>
        )}
      </div>

      {/* Modal to create a new board */}
      <CreateBoardModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(boardId) => {
          setExpandedBoardId(boardId);
          const found = boards.find((b) => b._id === boardId);
          if (found) onSelectBoard(found);
        }}
      />

      {/* Modal to modify board details (Edit icon) */}
      <EditBoardModal
        board={editingBoard}
        isOpen={Boolean(editingBoard)}
        onClose={() => setEditingBoard(null)}
        onUpdated={(updated) => {
          if (selectedBoard?._id === updated._id) {
            onSelectBoard(updated);
          }
        }}
      />
    </div>
  );
};
