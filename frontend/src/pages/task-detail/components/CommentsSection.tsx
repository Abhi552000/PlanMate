import React from "react";
import { MessageSquare, Trash } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { CommentsSectionProps } from "../../../types";
import { MentionInput } from "../../../components/MentionInput";
import { MentionText } from "../../../components/MentionText";

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  commentText,
  setCommentText,
  addingComment,
  deletingCommentId,
  currentUser,
  onAddComment,
  onDeleteComment,
  members,
}) => {
  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <form onSubmit={onAddComment} className="flex gap-2 mb-4 w-full">
        <MentionInput
          name="commentText"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Write a comment..."
          required
          members={members}
          className="flex-1 px-3 py-2 border border-sky-100 dark:border-gray-800 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-medium"
          type="text"
        />
        <Button type="submit" size="sm" loading={addingComment}>
          Post
        </Button>
      </form>

      {/* Comments list */}
      <div className="space-y-3.5">
        {comments.map((comment) => (
          <div key={comment._id} className="flex items-start gap-2.5 bg-gray-50/50 dark:bg-gray-950/20 p-3 rounded-xl border border-sky-100/30 dark:border-gray-800">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {comment.user?.name ? comment.user.name[0].toUpperCase() : "U"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-255">
                  {comment.user?.name || "Unknown User"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-405">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {(comment.user?._id === currentUser?._id || comment.user === currentUser?._id || currentUser?.role === "org_admin") && (
                    <button
                      type="button"
                      onClick={() => onDeleteComment(comment._id)}
                      disabled={deletingCommentId === comment._id}
                      className="text-red-500 hover:text-red-755 transition-colors p-0.5 rounded cursor-pointer disabled:opacity-50"
                      title="Delete comment"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-medium leading-relaxed whitespace-pre-wrap">
                <MentionText text={comment.text} />
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-xs text-gray-455 italic">No comments yet. Start the conversation!</p>
        )}
      </div>
    </div>
  );
};
