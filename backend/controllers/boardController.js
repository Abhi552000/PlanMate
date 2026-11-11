import Board from "../models/boardModel.js";
import Task from "../models/taskModel.js";
import Sprint from "../models/sprintModel.js";
import Organization from "../models/organizationModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { generateCompanyKey, generateBoardKey } from "../utils/keyGenerator.js";

// Helper to seed a default board and migrate legacy unassigned tasks/sprints
export const seedDefaultBoardIfNeeded = async (organizationId) => {
  let boards = await Board.find({ organization: organizationId }).sort({ createdAt: 1 });
  const org = await Organization.findById(organizationId);
  const orgName = org?.name || "Workspace";
  const companyKey = generateCompanyKey(orgName);

  if (org && !org.key) {
    org.key = companyKey;
    await org.save();
  }

  if (boards.length === 0) {
    const defaultKey = generateBoardKey(orgName, `${orgName} SIT`, "sit");
    const defaultBoard = new Board({
      name: `${orgName} SIT`,
      key: defaultKey,
      environment: "sit",
      description: `Default System Integration Testing board for ${orgName}`,
      organization: organizationId,
      isDefault: true,
      taskCounter: 0,
      statuses: ["To Do", "In Progress", "In Review", "Done"],
      priorities: ["Low", "Medium", "High", "Critical"],
      boardFeatures: {
        storyPoints: true,
        timeTracking: true,
        dueDates: true,
        labels: true,
        subtasks: true,
        issueLinking: true,
      },
    });

    // Count existing tasks to set initial taskCounter
    const existingTaskCount = await Task.countDocuments({ organization: organizationId });
    defaultBoard.taskCounter = existingTaskCount;
    await defaultBoard.save();

    // Migrate any legacy unassigned tasks and sprints to this default board
    await Task.updateMany(
      { organization: organizationId, $or: [{ board: null }, { board: { $exists: false } }] },
      { $set: { board: defaultBoard._id } }
    );
    await Sprint.updateMany(
      { organization: organizationId, $or: [{ board: null }, { board: { $exists: false } }] },
      { $set: { board: defaultBoard._id } }
    );

    boards = [defaultBoard];
  } else {
    // If an existing default board still has generic "SIT" key and 0 tasks, upgrade it cleanly
    const genericSitBoard = boards.find((b) => b.isDefault && b.key === "SIT" && (b.taskCounter === 0 || !b.taskCounter));
    if (genericSitBoard && org) {
      const betterKey = generateBoardKey(orgName, `${orgName} SIT`, "sit");
      genericSitBoard.key = betterKey;
      genericSitBoard.name = `${orgName} SIT`;
      await genericSitBoard.save();
    }
  }
  return boards;
};

// GET /api/boards
export const getBoards = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    if (!organizationId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "User does not belong to an organization",
      });
    }

    const boards = await seedDefaultBoardIfNeeded(organizationId);

    // Get task counts for each board
    const boardsWithCounts = await Promise.all(
      boards.map(async (b) => {
        const taskCount = await Task.countDocuments({ board: b._id });
        const obj = b.toObject();
        obj.totalTasks = taskCount;
        return obj;
      })
    );

    res.json({ success: true, boards: boardsWithCounts });
  } catch (error) {
    console.error("Get boards error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve boards",
    });
  }
};

// GET /api/boards/:id
export const getBoardById = async (req, res) => {
  try {
    const { id } = req.params;
    const board = await Board.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!board) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Board not found",
      });
    }

    res.json({ success: true, board });
  } catch (error) {
    console.error("Get board by ID error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to retrieve board",
    });
  }
};

// POST /api/boards
export const createBoard = async (req, res) => {
  try {
    const {
      name,
      key,
      environment,
      description,
      statuses,
      priorities,
      boardFeatures,
      customFields,
    } = req.body;

    if (!name || !key) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Board name and key are required",
      });
    }

    const cleanKey = key.trim().toUpperCase();
    if (!/^[A-Z0-9]{2,10}$/.test(cleanKey)) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Board key must be 2-10 alphanumeric characters (e.g. SIT, UAT, DEV)",
      });
    }

    const existing = await Board.findOne({
      organization: req.user.organization,
      key: cleanKey,
    });
    if (existing) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `A board with key "${cleanKey}" already exists in your organization`,
      });
    }

    const newBoard = new Board({
      name: name.trim(),
      key: cleanKey,
      environment: environment || "sit",
      description: description?.trim() || "",
      organization: req.user.organization,
      taskCounter: 0,
      statuses: statuses && statuses.length > 0 ? statuses : ["To Do", "In Progress", "In Review", "Done"],
      priorities: priorities && priorities.length > 0 ? priorities : ["Low", "Medium", "High", "Critical"],
      boardFeatures: boardFeatures || {
        storyPoints: true,
        timeTracking: true,
        dueDates: true,
        labels: true,
        subtasks: true,
        issueLinking: true,
      },
      customFields: customFields || [],
      isDefault: false,
    });

    await newBoard.save();

    res.status(HttpStatus.CREATED).json({
      success: true,
      message: "Board created successfully",
      board: newBoard,
    });
  } catch (error) {
    console.error("Create board error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to create board",
    });
  }
};

// PUT /api/boards/:id
export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      environment,
      statuses,
      priorities,
      boardFeatures,
      customFields,
      isDefault,
    } = req.body;

    const board = await Board.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!board) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Board not found",
      });
    }

    if (name) board.name = name.trim();
    if (description !== undefined) board.description = description.trim();
    if (environment) board.environment = environment;
    if (Array.isArray(statuses) && statuses.length > 0) board.statuses = statuses;
    if (Array.isArray(priorities) && priorities.length > 0) board.priorities = priorities;
    if (boardFeatures) board.boardFeatures = { ...board.boardFeatures, ...boardFeatures };
    if (Array.isArray(customFields)) board.customFields = customFields;
    if (typeof isDefault === "boolean") {
      if (isDefault) {
        // Demote all other boards in org
        await Board.updateMany(
          { organization: req.user.organization, _id: { $ne: board._id } },
          { $set: { isDefault: false } }
        );
      }
      board.isDefault = isDefault;
    }

    await board.save();

    res.json({
      success: true,
      message: "Board updated successfully",
      board,
    });
  } catch (error) {
    console.error("Update board error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to update board",
    });
  }
};

// DELETE /api/boards/:id
export const deleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    const board = await Board.findOne({
      _id: id,
      organization: req.user.organization,
    });

    if (!board) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Board not found",
      });
    }

    if (board.isDefault) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Cannot delete the default board of your organization",
      });
    }

    // Check if there are active tasks on this board
    const taskCount = await Task.countDocuments({ board: board._id });
    if (taskCount > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: `Cannot delete board. It still contains ${taskCount} tickets. Please move or delete tickets first.`,
      });
    }

    // Also delete any sprints for this board
    await Sprint.deleteMany({ board: board._id });

    await Board.deleteOne({ _id: board._id });

    res.json({
      success: true,
      message: `Board "${board.name}" deleted successfully`,
    });
  } catch (error) {
    console.error("Delete board error:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: error.message || "Failed to delete board",
    });
  }
};
