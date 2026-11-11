import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { boardService } from "../../services/boardService";
import { useBoard } from "../../context/BoardContext";
import { BoardEnvironment, EditBoardModalProps } from "../../types";
import { toast } from "react-toastify";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
  BOARD_ENVIRONMENTS,
  WORKSPACE_SETTINGS_TEXTS,
} from "../../constants/uiTexts";
import { TOAST_MESSAGES } from "../../constants/messages";

export const EditBoardModal: React.FC<EditBoardModalProps> = ({
  board,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const { refreshBoards } = useBoard();
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState<BoardEnvironment>("sit");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (board) {
      setName(board.name || "");
      setEnvironment(board.environment || "sit");
      setDescription(board.description || "");
    }
  }, [board, isOpen]);

  if (!isOpen || !board) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(TOAST_MESSAGES.BOARD_NAME_REQUIRED);
      return;
    }

    try {
      setSubmitting(true);
      const res = await boardService.updateBoard(board._id, {
        name: name.trim(),
        environment,
        description: description.trim(),
      });

      if (res.success && res.board) {
        toast.success(TOAST_MESSAGES.BOARD_UPDATE_SUCCESS(res.board.name));
        await refreshBoards();
        if (onUpdated) onUpdated(res.board);
        onClose();
      } else {
        toast.error(res.message || TOAST_MESSAGES.BOARD_UPDATE_ERROR);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          TOAST_MESSAGES.BOARD_UPDATE_ERROR
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {WORKSPACE_SETTINGS_TEXTS.MODAL_MODIFY_BOARD_TITLE}{" "}
            <span className="font-mono text-sm font-semibold text-slate-500">
              ({board.key})
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Input
            label={`${WORKSPACE_SETTINGS_TEXTS.LABEL_BOARD_NAME} *`}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_BOARD_NAME}
          />

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {WORKSPACE_SETTINGS_TEXTS.LABEL_ENVIRONMENT}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BOARD_ENVIRONMENTS.map((env) => (
                <button
                  type="button"
                  key={env.value}
                  onClick={() => setEnvironment(env.value as BoardEnvironment)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    environment === env.value
                      ? "border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="text-xs font-bold">{env.label}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                    {env.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              {WORKSPACE_SETTINGS_TEXTS.LABEL_DESCRIPTION}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_DESCRIPTION}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 shadow-2xs resize-none font-medium"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={submitting}
            >
              {WORKSPACE_SETTINGS_TEXTS.BTN_CANCEL}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
            >
              {WORKSPACE_SETTINGS_TEXTS.BTN_SAVE_BOARD_CHANGES}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
