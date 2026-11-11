import React, { useState } from "react";
import { X } from "lucide-react";
import { useBoard } from "../../context/BoardContext";
import { toast } from "react-toastify";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { CreateBoardModalProps } from "../../types";
import { WORKSPACE_SETTINGS_TEXTS } from "../../constants/uiTexts";
import { TOAST_MESSAGES } from "../../constants/messages";

export const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { createBoard } = useBoard();
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const autoGenerateKey = (boardName: string) => {
    const words = boardName.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";
    if (words.length === 1) {
      return words[0].slice(0, 4).toUpperCase();
    }
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 4)
      .toUpperCase();
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!key || key.length <= 4) {
      setKey(autoGenerateKey(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(TOAST_MESSAGES.BOARD_NAME_REQUIRED);
      return;
    }
    const cleanKey = key.trim().toUpperCase();
    if (!cleanKey || !/^[A-Z0-9]{2,10}$/.test(cleanKey)) {
      toast.error(TOAST_MESSAGES.BOARD_KEY_INVALID);
      return;
    }

    try {
      setSubmitting(true);
      const created = await createBoard({
        name: name.trim(),
        key: cleanKey,
        environment: "sit",
        description: description.trim(),
        statuses: ["To Do", "In Progress", "In Review", "Done"],
        priorities: ["Low", "Medium", "High", "Critical"],
      });
      setName("");
      setKey("");
      setDescription("");
      onClose();
      if (onCreated) onCreated(created._id);
    } catch (err: any) {
      toast.error(err.message || TOAST_MESSAGES.BOARD_CREATE_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Simple & Sober Header without icon */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {WORKSPACE_SETTINGS_TEXTS.MODAL_CREATE_BOARD_TITLE}
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
            onChange={handleNameChange}
            placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_BOARD_NAME}
          />

          <Input
            label={`${WORKSPACE_SETTINGS_TEXTS.LABEL_BOARD_KEY} *`}
            type="text"
            required
            maxLength={8}
            value={key}
            onChange={(e) => setKey(e.target.value.toUpperCase())}
            placeholder={WORKSPACE_SETTINGS_TEXTS.PLACEHOLDER_BOARD_KEY}
          />

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

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
              {WORKSPACE_SETTINGS_TEXTS.BTN_CREATE_BOARD}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
