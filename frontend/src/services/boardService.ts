import axiosInstance from "../config";
import { API_ROUTES } from "../constants/routes";
import { IBoard } from "../types";

export const boardService = {
  getBoards: async (): Promise<{ success: boolean; boards: IBoard[] }> => {
    const { data } = await axiosInstance.get(API_ROUTES.BOARDS.BASE);
    return data;
  },

  getBoardById: async (id: string): Promise<{ success: boolean; board: IBoard }> => {
    const { data } = await axiosInstance.get(API_ROUTES.BOARDS.BY_ID(id));
    return data;
  },

  createBoard: async (boardData: Partial<IBoard>): Promise<{ success: boolean; board: IBoard; message?: string }> => {
    const { data } = await axiosInstance.post(API_ROUTES.BOARDS.BASE, boardData);
    return data;
  },

  updateBoard: async (
    id: string,
    boardData: Partial<IBoard>
  ): Promise<{ success: boolean; board: IBoard; message?: string }> => {
    const { data } = await axiosInstance.put(API_ROUTES.BOARDS.BY_ID(id), boardData);
    return data;
  },

  deleteBoard: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const { data } = await axiosInstance.delete(API_ROUTES.BOARDS.BY_ID(id));
    return data;
  },
};
