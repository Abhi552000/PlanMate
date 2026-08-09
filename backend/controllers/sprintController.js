import Sprint from "../models/sprintModel.js";
import Task from "../models/taskModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

// GET ALL SPRINTS & BACKLOG TASKS
export const getSprints = async (req, res) => {
  try {
    const orgId = req.user.organization;
    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    // 1. Fetch Sprints
    const sprints = await Sprint.find({ organization: orgId }).sort({ createdAt: -1 }).lean();

    // 2. Fetch Tasks for each sprint
    const sprintsWithTasks = await Promise.all(sprints.map(async (sprint) => {
      const tasks = await Task.find({ sprint: sprint._id })
        .populate("assignee", "name email")
        .populate("epic")
        .sort({ createdAt: -1 })
        .lean();
      return {
        ...sprint,
        tasks,
      };
    }));

    // 3. Fetch Backlog Tasks (not assigned to any sprint)
    const backlogTasks = await Task.find({ organization: orgId, sprint: null })
      .populate("assignee", "name email")
      .populate("epic")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, sprints: sprintsWithTasks, backlogTasks });
  } catch (error) {
    console.error("Error in getSprints:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// CREATE A SPRINT
export const createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, goal } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }
    if (!name) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.SPRINT.NAME_REQUIRED });
    }

    const sprint = new Sprint({
      name,
      startDate,
      endDate,
      goal,
      organization: orgId,
    });

    await sprint.save();
    res.status(HttpStatus.CREATED).json({ success: true, message: MESSAGES.SPRINT.CREATED, sprint });
  } catch (error) {
    console.error("Error in createSprint:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// UPDATE SPRINT (Start/Close/Edit)
export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, goal, status } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const sprint = await Sprint.findOne({ _id: id, organization: orgId });
    if (!sprint) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.SPRINT.NOT_FOUND });
    }

    // Transitioning to active
    if (status === "active" && sprint.status !== "active") {
      const activeSprint = await Sprint.findOne({ organization: orgId, status: "active" });
      if (activeSprint) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.SPRINT.ACTIVE_EXISTS });
      }
    }

    // Transitioning to completed (Close Sprint)
    if (status === "completed" && sprint.status === "active") {
      // Reassign all incomplete tasks to backlog
      await Task.updateMany(
        { sprint: id, status: { $nin: ["Done", "Closed"] }, organization: orgId },
        { $set: { sprint: null } }
      );
    }

    // Transitioning to closed (soft delete/close)
    if (status === "closed") {
      // Reassign all incomplete tasks to backlog
      await Task.updateMany(
        { sprint: id, status: { $nin: ["Done", "Closed"] }, organization: orgId },
        { $set: { sprint: null } }
      );
    }

    if (name !== undefined) sprint.name = name;
    if (startDate !== undefined) sprint.startDate = startDate;
    if (endDate !== undefined) sprint.endDate = endDate;
    if (goal !== undefined) sprint.goal = goal;
    if (status !== undefined) sprint.status = status;

    await sprint.save();
    res.json({ success: true, message: MESSAGES.SPRINT.COMPLETED, sprint });
  } catch (error) {
    console.error("Error in updateSprint:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// DELETE SPRINT
export const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization;

    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const sprint = await Sprint.findOneAndDelete({ _id: id, organization: orgId });
    if (!sprint) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.SPRINT.NOT_FOUND });
    }

    // Put all tasks belonging to this sprint back to the backlog
    await Task.updateMany(
      { sprint: id, organization: orgId },
      { $set: { sprint: null } }
    );

    res.json({ success: true, message: MESSAGES.SPRINT.CLOSED });
  } catch (error) {
    console.error("Error in deleteSprint:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};
