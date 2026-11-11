import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { IBoard } from "../types";
import { boardService } from "../services/boardService";
import { useAuth } from "./AuthContext";
import { toast } from "react-toastify";

interface BoardContextType {
  boards: IBoard[];
  currentBoard: IBoard | null;
  loadingBoards: boolean;
  setCurrentBoard: (board: IBoard) => void;
  selectBoardById: (boardId: string) => void;
  refreshBoards: () => Promise<IBoard[]>;
  createBoard: (boardData: Partial<IBoard>) => Promise<IBoard>;
  updateCurrentBoard: (boardData: Partial<IBoard>) => Promise<IBoard>;
  deleteBoard: (boardId: string) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "planmate_current_board_id";

export const BoardProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [boards, setBoards] = useState<IBoard[]>([]);
  const [currentBoard, setCurrentBoardState] = useState<IBoard | null>(null);
  const [loadingBoards, setLoadingBoards] = useState<boolean>(false);

  const setCurrentBoard = useCallback((board: IBoard) => {
    setCurrentBoardState(board);
    if (board?._id) {
      localStorage.setItem(LOCAL_STORAGE_KEY, board._id);
    }
  }, []);

  const selectBoardById = useCallback(
    (boardId: string) => {
      const found = boards.find((b) => b._id === boardId);
      if (found) {
        setCurrentBoard(found);
      }
    },
    [boards, setCurrentBoard]
  );

  const refreshBoards = useCallback(async (): Promise<IBoard[]> => {
    if (!currentUser?.organization) {
      setBoards([]);
      setCurrentBoardState(null);
      return [];
    }

    try {
      setLoadingBoards(true);
      const res = await boardService.getBoards();
      if (res.success && Array.isArray(res.boards)) {
        setBoards(res.boards);

        // Determine which board should be active
        const savedId = localStorage.getItem(LOCAL_STORAGE_KEY);
        let selected: IBoard | undefined = undefined;

        if (savedId) {
          selected = res.boards.find((b) => b._id === savedId);
        }

        if (!selected) {
          selected = res.boards.find((b) => b.isDefault) || res.boards[0];
        }

        if (selected) {
          setCurrentBoardState(selected);
          localStorage.setItem(LOCAL_STORAGE_KEY, selected._id);
        }
        return res.boards;
      }
    } catch (err: any) {
      console.error("Failed to load boards:", err);
    } finally {
      setLoadingBoards(false);
    }
    return [];
  }, [currentUser?.organization]);

  useEffect(() => {
    if (currentUser?.organization) {
      refreshBoards();
    } else {
      setBoards([]);
      setCurrentBoardState(null);
    }
  }, [currentUser?.organization, refreshBoards]);

  const createBoard = useCallback(
    async (boardData: Partial<IBoard>): Promise<IBoard> => {
      const res = await boardService.createBoard(boardData);
      if (res.success && res.board) {
        toast.success(`Board "${res.board.name}" created!`);
        await refreshBoards();
        setCurrentBoard(res.board);
        return res.board;
      }
      throw new Error(res.message || "Failed to create board");
    },
    [refreshBoards, setCurrentBoard]
  );

  const updateCurrentBoard = useCallback(
    async (boardData: Partial<IBoard>): Promise<IBoard> => {
      if (!currentBoard?._id) throw new Error("No active board to update");
      const res = await boardService.updateBoard(currentBoard._id, boardData);
      if (res.success && res.board) {
        toast.success(`Board "${res.board.name}" updated!`);
        setCurrentBoard(res.board);
        setBoards((prev) =>
          prev.map((b) => (b._id === res.board._id ? res.board : b))
        );
        return res.board;
      }
      throw new Error(res.message || "Failed to update board");
    },
    [currentBoard, setCurrentBoard]
  );

  const deleteBoard = useCallback(
    async (boardId: string): Promise<void> => {
      const res = await boardService.deleteBoard(boardId);
      if (res.success) {
        toast.success(res.message || "Board deleted successfully");
        const remaining = boards.filter((b) => b._id !== boardId);
        setBoards(remaining);
        if (currentBoard?._id === boardId) {
          const fallback = remaining.find((b) => b.isDefault) || remaining[0] || null;
          setCurrentBoardState(fallback);
          if (fallback) {
            localStorage.setItem(LOCAL_STORAGE_KEY, fallback._id);
          } else {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
          }
        }
      } else {
        throw new Error(res.message || "Failed to delete board");
      }
    },
    [boards, currentBoard]
  );

  const value = useMemo(
    () => ({
      boards,
      currentBoard,
      loadingBoards,
      setCurrentBoard,
      selectBoardById,
      refreshBoards,
      createBoard,
      updateCurrentBoard,
      deleteBoard,
    }),
    [
      boards,
      currentBoard,
      loadingBoards,
      setCurrentBoard,
      selectBoardById,
      refreshBoards,
      createBoard,
      updateCurrentBoard,
      deleteBoard,
    ]
  );

  return <BoardContext.Provider value={value}>{children}</BoardContext.Provider>;
};

export const useBoard = (): BoardContextType => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }
  return context;
};
