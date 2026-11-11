import Task from "../models/taskModel.js";
import Organization from "../models/organizationModel.js";
import Board from "../models/boardModel.js";
import { seedDefaultBoardIfNeeded } from "./boardController.js";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";
import { generateCompanyKey } from "../utils/keyGenerator.js";

// HELPER TO CONVERT STORED MENTIONS TO READABLE FORMAT
export const cleanMentions = (text) => {
  if (!text || typeof text !== "string") return text;
  return text.replace(/@\[([^\]]+)\]\(user:[^)]+\)/g, "@$1");
};

// HELPER TO FIND TASK BY OBJECTID OR TICKET KEY
export const buildTaskFilter = (identifier, baseQuery = {}) => {
  if (!identifier) return baseQuery;
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  if (isObjectId) {
    return { $or: [{ _id: identifier }, { key: identifier }], ...baseQuery };
  }
  return { key: identifier, ...baseQuery };
};

// HELPER TO CREATE NOTIFICATIONS FOR USER MENTIONS
export const handleMentions = async (text, task, sender, type = "comment") => {
  if (!text) return;
  
  // Pattern to match is @[Name](user:userId)
  const regex = /@\[[^\]]+\]\(user:([a-f\d]{24})\)/g;
  const userIds = new Set();
  let match;
  while ((match = regex.exec(text)) !== null) {
    const userId = match[1];
    // Don't notify the sender themselves
    if (userId !== sender._id.toString() && userId !== sender.id.toString()) {
      userIds.add(userId);
    }
  }

  if (userIds.size === 0) return;

  const title = type === "comment" ? "Mentioned in Comment" : "Mentioned in Description";
  const taskKey = task.key || `PM-${task._id.toString().slice(-4).toUpperCase()}`;
  const message = type === "comment"
    ? `${sender.name} mentioned you in a comment on: "${task.title}" (${taskKey})`
    : `${sender.name} mentioned you in the description of: "${task.title}" (${taskKey})`;

  const notifications = Array.from(userIds).map((userId) => ({
    user: userId,
    title,
    message,
    link: `/task/${task._id}`,
    read: false,
  }));

  try {
    await Notification.insertMany(notifications, { ordered: false });
  } catch (err) {
    console.error("Error creating mention notifications in batch:", err);
  }
};

// CREATE A NEW TASK
export const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      completed,
      status,
      issueType,
      storyPoints,
      subtasks,
      assignee,
      reporter,
      labels,
      links,
      originalEstimate,
      sprint,
      epic,
      customFieldValues,
      boardId,
      board,
    } = req.body;

    let finalCompleted = completed === "Yes" || completed === true;
    let finalStatus = status || "To Do";
    if (status) {
      finalCompleted = status.toLowerCase() === "done";
    } else if (completed !== undefined) {
      finalStatus = finalCompleted ? "Done" : "To Do";
    }

    let generatedKey = "";
    let assignedBoardId = null;

    if (req.user.organization) {
      const targetBoardReqId = boardId || board || req.headers["x-board-id"];
      let activeBoard = null;

      if (targetBoardReqId && mongoose.Types.ObjectId.isValid(targetBoardReqId)) {
        activeBoard = await Board.findOne({
          _id: targetBoardReqId,
          organization: req.user.organization,
        });
      }

      if (!activeBoard) {
        // Fallback to default board or auto-seed
        const boards = await seedDefaultBoardIfNeeded(req.user.organization);
        activeBoard = boards.find((b) => b.isDefault) || boards[0];
      }

      if (activeBoard) {
        assignedBoardId = activeBoard._id;
        activeBoard.taskCounter = (activeBoard.taskCounter || 0) + 1;
        await activeBoard.save();
        generatedKey = `${activeBoard.key}-${activeBoard.taskCounter}`;
      } else {
        const org = await Organization.findByIdAndUpdate(
          req.user.organization,
          { $inc: { taskCounter: 1 } },
          { new: true }
        );
        if (org) {
          const prefix = org.key || generateCompanyKey(org.name);
          generatedKey = `${prefix}-${org.taskCounter}`;
        }
      }
    }

    if (!generatedKey) {
      generatedKey = `PM-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const task = new Task({
      title,
      description,
      priority,
      dueDate,
      completed: finalCompleted,
      status: finalStatus,
      issueType: issueType || "Task",
      storyPoints: storyPoints !== undefined ? Number(storyPoints) : 1,
      originalEstimate:
        originalEstimate !== undefined ? Number(originalEstimate) : 0,
      subtasks: subtasks || [],
      owner: req.user.id,
      reporter: reporter || req.user.id,
      labels: Array.isArray(labels) ? labels : [],
      assignee: assignee || null,
      key: generatedKey || undefined,
      organization: req.user.organization || null,
      board: assignedBoardId,
      links: links || [],
      sprint: sprint || null,
      epic: epic || null,
      customFieldValues: customFieldValues || {},
    });

    const saved = await task.save();

    // Trigger mention notifications for description
    if (description) {
      await handleMentions(description, saved, req.user, "description");
    }

    // Create notification if assigned to someone else
    if (assignee && assignee.toString() !== req.user.id) {
      try {
        await Notification.create({
          user: assignee,
          title: "New Issue Assigned",
          message: `${
            req.user.name
          } created and assigned you the issue: "${title}" (${
            generatedKey || `PM-${saved._id.toString().slice(-4).toUpperCase()}`
          })`,
          link: `/task/${saved._id}`,
          read: false,
        });
      } catch (err) {
        console.error("Error creating task assignment notification:", err);
      }
    }

    const populated = await Task.findById(saved._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .lean();
    res.status(HttpStatus.CREATED).json({ success: true, task: populated });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// GET ALL TASK FOR LOGGED - IN USER'S ORGANIZATION
export const getTasks = async (req, res) => {
  try {
    const {
      page,
      limit,
      status,
      priority,
      assignee,
      search,
      timeframe,
      completed,
      sortBy,
      startDate,
      endDate,
      createdAfter,
      createdBefore,
      epic,
      sprint,
      issueType,
      boardId,
      board,
    } = req.query;

    let query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const targetBoardId = boardId || board || req.headers["x-board-id"];
    if (targetBoardId && targetBoardId !== "all") {
      query.board = targetBoardId;
    }

    // Apply status filter
    if (status && status !== "all") {
      if (status === "pending") {
        query.status = { $ne: "Done" };
      } else {
        query.status = status;
      }
    }

    // Apply priority filter
    if (priority && priority !== "all") {
      query.priority = priority.charAt(0).toUpperCase() + priority.slice(1);
    }

    // Apply assignee filter
    if (assignee && assignee !== "all") {
      if (assignee === "unassigned") {
        query.assignee = null;
      } else {
        query.assignee = assignee;
      }
    }

    // Apply completed filter
    if (completed !== undefined) {
      query.completed = completed === "true";
    }

    // Apply issueType filter
    if (issueType && issueType !== "all") {
      query.issueType = issueType;
    }

    // Apply epic filter
    if (epic && epic !== "all") {
      query.epic = epic === "none" ? null : epic;
    }

    // Apply sprint filter
    if (sprint && sprint !== "all") {
      query.sprint = sprint === "backlog" || sprint === "null" ? null : sprint;
    }

    // Apply global text search
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { key: { $regex: search, $options: "i" } },
      ];
    }

    // Apply timeframe filter
    if (timeframe && timeframe !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      if (timeframe === "today") {
        query.dueDate = { $gte: today, $lt: tomorrow };
      } else if (timeframe === "week") {
        query.dueDate = { $gte: today, $lte: nextWeek };
      } else if (timeframe === "overdue") {
        query.dueDate = { $lt: today };
        query.status = { $ne: "Done" };
      } else if (timeframe === "7d") {
        const past7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: past7Days };
      } else if (timeframe === "30d") {
        const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: past30Days };
      } else if (timeframe === "90d") {
        const past90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: past90Days };
      }
    }

    // Apply custom due date range
    if (startDate || endDate) {
      query.dueDate = query.dueDate || {};
      if (startDate) query.dueDate.$gte = new Date(startDate);
      if (endDate) query.dueDate.$lte = new Date(endDate);
    }

    // Apply custom created date range
    if (createdAfter || createdBefore) {
      query.createdAt = query.createdAt || {};
      if (createdAfter) query.createdAt.$gte = new Date(createdAfter);
      if (createdBefore) query.createdAt.$lte = new Date(createdBefore);
    }

    // Apply sorting
    let sortQuery = { createdAt: -1 };
    if (sortBy === "oldest") {
      sortQuery = { createdAt: 1 };
    } else if (sortBy === "priority") {
      sortQuery = { priority: 1, createdAt: -1 };
    }

    // Paginated tasks query
    if (page && limit) {
      const p = parseInt(page) || 1;
      const l = parseInt(limit) || 10;
      const skip = (p - 1) * l;

      const totalCount = await Task.countDocuments(query);
      const tasks = await Task.find(query)
        .populate("owner", "name email")
        .populate("reporter", "name email")
        .populate("assignee", "name email")
        .populate("links.targetTask", "title key status priority completed issueType")
        .populate("workLogs.user", "name email")
        .sort(sortQuery)
        .skip(skip)
        .limit(l)
        .lean();

      tasks.forEach((t) => {
        if (!t.key) {
          t.key = `PM-${t._id.toString().slice(-4).toUpperCase()}`;
        }
      });

      return res.json({
        success: true,
        tasks,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / l),
          currentPage: p,
          limit: l,
        },
      });
    }

    // Default: fetch all tasks
    const tasks = await Task.find(query)
      .populate("owner", "name email")
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .sort(sortQuery)
      .lean();

    tasks.forEach((t) => {
      if (!t.key) {
        t.key = `PM-${t._id.toString().slice(-4).toUpperCase()}`;
      }
    });

    res.json({ success: true, tasks });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// GET SINGLE TASK BY ID
export const getTaskById = async (req, res) => {
  try {
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };
    const task = await Task.findOne(buildTaskFilter(req.params.id, query))
      .populate("owner", "name email")
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();
    if (!task)
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK.NOT_FOUND,
      });

    if (!task.key) {
      const fallbackKey = `PM-${task._id.toString().slice(-4).toUpperCase()}`;
      task.key = fallbackKey;
      Task.updateOne({ _id: task._id }, { $set: { key: fallbackKey } }).exec();
    }

    res.json({ success: true, task });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// UPDATE A TASK
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };

    if (data.status !== undefined || data.completed !== undefined) {
      if (data.status !== undefined) {
        data.completed = data.status.toLowerCase() === "done";
      } else if (data.completed !== undefined) {
        const isCompletedVal =
          data.completed === "Yes" || data.completed === true;
        data.completed = isCompletedVal;
        data.status = isCompletedVal ? "Done" : "To Do";
      }
    }

    if (data.storyPoints !== undefined) {
      data.storyPoints = Number(data.storyPoints);
    }
    if (data.originalEstimate !== undefined) {
      data.originalEstimate = Number(data.originalEstimate);
    }

    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne(buildTaskFilter(req.params.id, query));
    if (!task) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK.NOT_FOUND,
      });
    }

    // Compare fields to generate history/changelog
    const historyEntries = [];
    const fieldsToTrack = [
      "title",
      "description",
      "status",
      "priority",
      "assignee",
      "reporter",
      "storyPoints",
      "originalEstimate",
      "labels",
      "dueDate",
    ];

    for (const field of fieldsToTrack) {
      if (data[field] !== undefined) {
        let oldVal = task[field];
        let newVal = data[field];

        // Format dates for comparison
        if (field === "dueDate") {
          oldVal = oldVal ? new Date(oldVal).toISOString().split("T")[0] : "";
          newVal = newVal ? new Date(newVal).toISOString().split("T")[0] : "";
        }
        // Format assignees and reporters for comparison
        if (field === "assignee" || field === "reporter") {
          oldVal = oldVal ? oldVal.toString() : "";
          newVal = newVal ? newVal.toString() : "";
        }
        if (field === "labels") {
          oldVal = Array.isArray(oldVal) ? oldVal.slice().sort().join(", ") : "";
          newVal = Array.isArray(newVal) ? newVal.slice().sort().join(", ") : "";
        }

        if (String(oldVal) !== String(newVal)) {
          let displayOldVal = String(oldVal);
          let displayNewVal = String(newVal);

          if (field === "assignee" || field === "reporter") {
            const oldUser = oldVal
              ? await mongoose.model("user").findById(oldVal)
              : null;
            const newUser = newVal
              ? await mongoose.model("user").findById(newVal)
              : null;
            displayOldVal = oldUser ? oldUser.name : "Unassigned";
            displayNewVal = newUser ? newUser.name : "Unassigned";
          }
          if (field === "labels") {
            displayOldVal = oldVal || "None";
            displayNewVal = newVal || "None";
          }

          historyEntries.push({
            field,
            oldValue: cleanMentions(displayOldVal),
            newValue: cleanMentions(displayNewVal),
            updatedBy: req.user.id,
            updatedAt: new Date(),
          });

          // Send notification triggers
          if (
            field === "assignee" &&
            newVal &&
            newVal.toString() !== req.user.id
          ) {
            try {
              await Notification.create({
                user: newVal,
                title: "New Issue Assigned",
                message: `${req.user.name} assigned you the issue: "${
                  task.title
                }" (${
                  task.key ||
                  `PM-${task._id.toString().slice(-4).toUpperCase()}`
                })`,
                link: `/task/${task._id}`,
                read: false,
              });
            } catch (err) {
              console.error("Error creating assignment notification:", err);
            }
          } else if (
            field !== "assignee" &&
            task.assignee &&
            task.assignee.toString() !== req.user.id
          ) {
            try {
              const cleanOld = cleanMentions(displayOldVal);
              const cleanNew = cleanMentions(displayNewVal);
              await Notification.create({
                user: task.assignee,
                title: "Task Updated",
                message: `${req.user.name} updated the ${field} of task "${task.title}" from "${cleanOld}" to "${cleanNew}"`,
                link: `/task/${task._id}`,
                read: false,
              });
            } catch (err) {
              console.error("Error creating task update notification:", err);
            }
          }
        }
      }
    }

    // Apply updates
    Object.assign(task, data);
    if (data.customFieldValues !== undefined) {
      task.set("customFieldValues", data.customFieldValues);
      task.markModified("customFieldValues");
    }

    if (historyEntries.length > 0) {
      if (!task.history) task.history = [];
      task.history.push(...historyEntries);
    }

    await task.save();

    // Trigger mention notifications for description if updated
    if (data.description !== undefined) {
      await handleMentions(data.description, task, req.user, "description");
    }

    const updated = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("reporter", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: updated });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// DELETE A TASK
export const deleteTask = async (req, res) => {
  try {
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const deleted = await Task.findOneAndDelete(buildTaskFilter(req.params.id, query));
    if (!deleted)
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.NOT_FOUND });
    res.json({ success: true, message: MESSAGES.TASK.DELETED });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// ADD TASK COMMENT
export const addTaskComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.TASK.COMMENT_REQUIRED });
    }
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne(buildTaskFilter(req.params.id, query));
    if (!task) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.NOT_FOUND });
    }

    task.comments.push({
      text: text.trim(),
      user: req.user.id,
      createdAt: new Date(),
    });

    await task.save();

    // Trigger mention notifications for comment
    await handleMentions(text, task, req.user, "comment");

    const populatedTask = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// DELETE TASK COMMENT
export const deleteTaskComment = async (req, res) => {
  try {
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne(buildTaskFilter(req.params.id, query));
    if (!task) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.NOT_FOUND });
    }

    const comment = task.comments.id(req.params.commentId);
    if (!comment) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.COMMENT_NOT_FOUND });
    }

    // Check permissions: author, org admin, or system admin
    if (
      comment.user.toString() !== req.user.id &&
      req.user.role !== "org_admin" &&
      req.user.role !== "system_admin"
    ) {
      return res
        .status(HttpStatus.FORBIDDEN)
        .json({ success: false, message: MESSAGES.COMMON.UNAUTHORIZED });
    }

    comment.deleteOne();
    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: populatedTask });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// GET TASK ANALYTICS
export const getTaskAnalytics = async (req, res) => {
  try {
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const tasks = await Task.find(query).lean();

    // 1. Weekly Velocity Calculation (Last 4 Weeks)
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const end = new Date();
      end.setDate(end.getDate() - i * 7);
      const start = new Date();
      start.setDate(start.getDate() - (i + 1) * 7);

      let weekPoints = 0;
      let weekCount = 0;

      tasks.forEach((t) => {
        if (t.completed) {
          let completionDate = t.updatedAt || t.createdAt;
          const statusHistory = t.history.filter(
            (h) => h.field === "status" && h.newValue === "Done"
          );
          if (statusHistory.length > 0) {
            completionDate = statusHistory[statusHistory.length - 1].updatedAt;
          }
          const cTime = new Date(completionDate).getTime();
          if (cTime >= start.getTime() && cTime <= end.getTime()) {
            weekPoints += t.storyPoints || 0;
            weekCount += 1;
          }
        }
      });

      weeks.push({
        label: `Week -${i}`,
        points: weekPoints,
        count: weekCount,
      });
    }

    // 2. Burndown Curve (Last 15 Days)
    const burndown = [];
    const totalStoryPoints = tasks.reduce(
      (sum, t) => sum + (t.storyPoints || 0),
      0
    );

    for (let i = 14; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      let resolvedBeforeDay = 0;
      tasks.forEach((t) => {
        if (t.completed) {
          let completionDate = t.updatedAt || t.createdAt;
          const statusHistory = t.history.filter(
            (h) => h.field === "status" && h.newValue === "Done"
          );
          if (statusHistory.length > 0) {
            completionDate = statusHistory[statusHistory.length - 1].updatedAt;
          }
          if (new Date(completionDate) <= dayEnd) {
            resolvedBeforeDay += t.storyPoints || 0;
          }
        }
      });

      burndown.push({
        day: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        ideal: Math.max(
          0,
          Math.round(totalStoryPoints - (totalStoryPoints / 14) * (14 - i))
        ),
        remaining: Math.max(0, totalStoryPoints - resolvedBeforeDay),
      });
    }

    // 3. Priority breakdown
    const priorityBreakdown = { High: 0, Medium: 0, Low: 0 };
    tasks.forEach((t) => {
      if (t.priority && priorityBreakdown[t.priority] !== undefined) {
        priorityBreakdown[t.priority] += 1;
      }
    });

    res.json({
      success: true,
      analytics: {
        weeks,
        burndown,
        priorityBreakdown,
      },
    });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// LOG WORK ON A TASK
export const logWork = async (req, res) => {
  try {
    const { hoursSpent, description, date } = req.body;
    if (!hoursSpent || Number(hoursSpent) <= 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.TASK.WORKLOG_HOURS_INVALID });
    }

    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne(buildTaskFilter(req.params.id, query));
    if (!task) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.NOT_FOUND });
    }

    // Add log entry with optional custom date
    const logDate = date ? new Date(date) : new Date();
    task.workLogs.push({
      hoursSpent: Number(hoursSpent),
      description: description || "",
      user: req.user.id,
      createdAt: isNaN(logDate.getTime()) ? new Date() : logDate,
    });

    // Update total logged hours
    task.timeLogged = task.workLogs.reduce(
      (sum, log) => sum + (log.hoursSpent || 0),
      0
    );

    // Record history entry
    if (!task.history) task.history = [];
    task.history.push({
      field: "workLog",
      oldValue: "",
      newValue: `Logged ${hoursSpent}h of work: ${
        description || "No description"
      }`,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    });

    await task.save();

    const updated = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: updated });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// DELETE A WORK LOG ENTRY
export const deleteWorkLog = async (req, res) => {
  try {
    const { id, workLogId } = req.params;
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne(buildTaskFilter(id, query));
    if (!task) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.NOT_FOUND });
    }

    const logIndex = (task.workLogs || []).findIndex(
      (w) => w._id.toString() === workLogId
    );
    if (logIndex === -1) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: "Work log entry not found." });
    }

    const logEntry = task.workLogs[logIndex];
    const isOrgAdmin = req.user.role === "org_admin" || req.user.role === "sys_admin";
    const isOwner =
      logEntry.user &&
      (logEntry.user._id || logEntry.user).toString() === req.user.id.toString();

    if (!isOrgAdmin && !isOwner) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: "You are not authorized to delete this work log entry.",
      });
    }

    const removedHours = logEntry.hoursSpent || 0;
    task.workLogs.splice(logIndex, 1);

    task.timeLogged = task.workLogs.reduce(
      (sum, log) => sum + (log.hoursSpent || 0),
      0
    );

    if (!task.history) task.history = [];
    task.history.push({
      field: "workLog",
      oldValue: `${removedHours}h`,
      newValue: `Removed work log entry of ${removedHours}h`,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    });

    await task.save();

    const updated = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: updated });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};

// LINK AN ISSUE
export const linkTask = async (req, res) => {
  try {
    const { linkType, targetTaskId } = req.body;
    const taskId = req.params.id;

    if (!linkType || !targetTaskId) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "Link type and target task ID are required.",
      });
    }

    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const sourceTask = await Task.findOne(buildTaskFilter(taskId, query));
    const targetTask = await Task.findOne(buildTaskFilter(targetTaskId, query));

    if (!sourceTask || !targetTask) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "One or both tasks not found.",
      });
    }

    // Check if link already exists
    const linkExists = sourceTask.links.some(
      (l) => l.targetTask.toString() === targetTaskId && l.linkType === linkType
    );
    if (linkExists) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: "This issue link already exists.",
      });
    }

    // Determine opposite link type
    let oppositeType = "relates to";
    if (linkType === "blocks") oppositeType = "is blocked by";
    else if (linkType === "blocked by" || linkType === "is blocked by") oppositeType = "blocks";
    else if (linkType === "duplicates") oppositeType = "is duplicated by";
    else if (linkType === "is duplicated by") oppositeType = "duplicates";
    else if (linkType === "clones") oppositeType = "is cloned by";
    else if (linkType === "is cloned by") oppositeType = "clones";
    else oppositeType = "relates to";

    // Add source-to-target link
    sourceTask.links.push({ linkType, targetTask: targetTaskId });
    // Add target-to-source link
    targetTask.links.push({ linkType: oppositeType, targetTask: taskId });

    // Track changelog history for both tasks
    sourceTask.history.push({
      field: "links",
      oldValue: "",
      newValue: `Linked as ${linkType} to ${targetTask.key || targetTask.title}`,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    });
    targetTask.history.push({
      field: "links",
      oldValue: "",
      newValue: `Linked as ${oppositeType} to ${sourceTask.key || sourceTask.title}`,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    });

    await sourceTask.save();
    await targetTask.save();

    const updatedTask = await Task.findById(taskId)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// UNLINK AN ISSUE
export const unlinkTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const linkId = req.params.linkId;

    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const sourceTask = await Task.findOne(buildTaskFilter(taskId, query));
    if (!sourceTask) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK.NOT_FOUND,
      });
    }

    const linkIndex = sourceTask.links.findIndex((l) => l._id.toString() === linkId);
    if (linkIndex === -1) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: "Link not found on this task.",
      });
    }

    const link = sourceTask.links[linkIndex];
    const targetTaskId = link.targetTask;

    // Remove source-to-target link
    sourceTask.links.splice(linkIndex, 1);

    // Find target task and remove the corresponding backlink
    const targetTask = await Task.findOne({ _id: targetTaskId, ...query });
    if (targetTask) {
      targetTask.links = targetTask.links.filter(
        (l) => l.targetTask.toString() !== taskId
      );
      targetTask.history.push({
        field: "links",
        oldValue: "",
        newValue: `Removed link to ${sourceTask.key || sourceTask.title}`,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      });
      await targetTask.save();
    }

    sourceTask.history.push({
      field: "links",
      oldValue: "",
      newValue: `Removed link to ${targetTask ? (targetTask.key || targetTask.title) : "deleted task"}`,
      updatedBy: req.user.id,
      updatedAt: new Date(),
    });

    await sourceTask.save();

    const updatedTask = await Task.findById(taskId)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed issueType")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: updatedTask });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// GET PAGINATED USER WORKLOG SUMMARIES FOR ORG
export const getUserWorklogSummaries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      timeframe = "all",
      startDate,
      endDate,
    } = req.query;

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 10);
    const skip = (p - 1) * l;

    const orgMatch = req.user.organization
      ? { organization: new mongoose.Types.ObjectId(req.user.organization) }
      : { owner: new mongoose.Types.ObjectId(req.user.id) };

    const dateFilter = {};
    if (timeframe === "7d") {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "30d") {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      dateFilter.$gte = todayStart;
    } else if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    const matchStage = { ...orgMatch, "workLogs.0": { $exists: true } };

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$workLogs" },
    ];

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "workLogs.createdAt": dateFilter },
      });
    }

    pipeline.push(
      {
        $group: {
          _id: "$workLogs.user",
          totalHours: { $sum: "$workLogs.hoursSpent" },
          taskIds: { $addToSet: "$_id" },
          logCount: { $sum: 1 },
          lastLoggedAt: { $max: "$workLogs.createdAt" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } }
    );

    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { "userInfo.name": { $regex: search.trim(), $options: "i" } },
            { "userInfo.email": { $regex: search.trim(), $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        totalStats: [
          {
            $group: {
              _id: null,
              overallHours: { $sum: "$totalHours" },
              userCount: { $sum: 1 },
              allTasks: { $push: "$taskIds" },
            },
          },
        ],
        paginatedData: [
          { $sort: { totalHours: -1 } },
          { $skip: skip },
          { $limit: l },
          {
            $project: {
              userId: "$_id",
              name: { $ifNull: ["$userInfo.name", "Unknown Member"] },
              email: { $ifNull: ["$userInfo.email", ""] },
              avatar: "$userInfo.avatar",
              role: "$userInfo.role",
              totalHours: { $round: ["$totalHours", 1] },
              taskCount: { $size: "$taskIds" },
              logCount: "$logCount",
              lastLoggedAt: "$lastLoggedAt",
            },
          },
        ],
      },
    });

    const result = await Task.aggregate(pipeline);
    const facetData = result[0] || {};
    const totalStats = facetData.totalStats?.[0] || {};
    const users = facetData.paginatedData || [];
    const totalCount = totalStats.userCount || 0;

    const allTaskIds = new Set();
    (totalStats.allTasks || []).forEach((arr) => {
      arr.forEach((id) => allTaskIds.add(id.toString()));
    });

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: p,
        totalPages: Math.ceil(totalCount / l) || 1,
        totalCount,
        pageSize: l,
      },
      summary: {
        totalHours: Math.round((totalStats.overallHours || 0) * 10) / 10,
        activeContributors: totalCount,
        trackedTasksCount: allTaskIds.size,
      },
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// GET DETAILED WORKLOG ENTRIES FOR A SINGLE USER (LAZY-LOADED ON ACCORDION EXPAND)
export const getUserDetailedWorklogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      page = 1,
      limit = 5,
      timeframe = "all",
      startDate,
      endDate,
      search = "",
    } = req.query;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid user ID" });
    }

    const p = Math.max(1, parseInt(page) || 1);
    const l = Math.max(1, parseInt(limit) || 5);
    const skip = (p - 1) * l;

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const orgMatch = req.user.organization
      ? { organization: new mongoose.Types.ObjectId(req.user.organization) }
      : { owner: new mongoose.Types.ObjectId(req.user.id) };

    const dateFilter = {};
    if (timeframe === "7d") {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "30d") {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      dateFilter.$gte = todayStart;
    } else if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    const pipeline = [
      { $match: { ...orgMatch, "workLogs.user": userObjectId } },
      { $unwind: "$workLogs" },
      { $match: { "workLogs.user": userObjectId } },
    ];

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "workLogs.createdAt": dateFilter },
      });
    }

    pipeline.push({
      $project: {
        taskId: "$_id",
        taskKey: {
          $ifNull: [
            "$key",
            { $concat: ["PM-", { $substrCP: [{ $toString: "$_id" }, 20, 4] }] },
          ],
        },
        taskTitle: "$title",
        issueType: { $ifNull: ["$issueType", "Task"] },
        status: { $ifNull: ["$status", "To Do"] },
        priority: { $ifNull: ["$priority", "Low"] },
        originalEstimate: { $ifNull: ["$originalEstimate", 0] },
        timeLogged: { $ifNull: ["$timeLogged", 0] },
        workLogId: "$workLogs._id",
        hoursSpent: "$workLogs.hoursSpent",
        description: { $ifNull: ["$workLogs.description", ""] },
        createdAt: "$workLogs.createdAt",
      },
    });

    if (search && search.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { taskKey: { $regex: search.trim(), $options: "i" } },
            { taskTitle: { $regex: search.trim(), $options: "i" } },
            { description: { $regex: search.trim(), $options: "i" } },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        meta: [{ $count: "total" }],
        items: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: l },
        ],
      },
    });

    const result = await Task.aggregate(pipeline);
    const totalCount = result[0]?.meta?.[0]?.total || 0;
    const logs = result[0]?.items || [];

    res.json({
      success: true,
      logs,
      pagination: {
        currentPage: p,
        totalPages: Math.ceil(totalCount / l) || 1,
        totalCount,
        pageSize: l,
      },
    });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// EXPORT WORKLOGS (CSV DATA) FOR A SPECIFIC USER OR ALL EMPLOYEES
export const exportWorklogs = async (req, res) => {
  try {
    const { userId, timeframe = "all", startDate, endDate } = req.query;

    const orgMatch = req.user.organization
      ? { organization: new mongoose.Types.ObjectId(req.user.organization) }
      : { owner: new mongoose.Types.ObjectId(req.user.id) };

    const dateFilter = {};
    if (timeframe === "7d") {
      dateFilter.$gte = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "30d") {
      dateFilter.$gte = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === "today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      dateFilter.$gte = todayStart;
    } else if (startDate || endDate) {
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.$lte = end;
      }
    }

    const matchStage = { ...orgMatch, "workLogs.0": { $exists: true } };
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      matchStage["workLogs.user"] = new mongoose.Types.ObjectId(userId);
    }

    const pipeline = [
      { $match: matchStage },
      { $unwind: "$workLogs" },
    ];

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      pipeline.push({
        $match: { "workLogs.user": new mongoose.Types.ObjectId(userId) },
      });
    }

    if (Object.keys(dateFilter).length > 0) {
      pipeline.push({
        $match: { "workLogs.createdAt": dateFilter },
      });
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "workLogs.user",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: { path: "$userInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          taskId: "$_id",
          taskKey: {
            $ifNull: [
              "$key",
              { $concat: ["PM-", { $substrCP: [{ $toString: "$_id" }, 20, 4] }] },
            ],
          },
          taskTitle: "$title",
          issueType: { $ifNull: ["$issueType", "Task"] },
          status: { $ifNull: ["$status", "To Do"] },
          userName: { $ifNull: ["$userInfo.name", "Unknown Member"] },
          userEmail: { $ifNull: ["$userInfo.email", ""] },
          hoursSpent: "$workLogs.hoursSpent",
          description: { $ifNull: ["$workLogs.description", ""] },
          createdAt: "$workLogs.createdAt",
        },
      },
      { $sort: { createdAt: -1 } }
    );

    const logs = await Task.aggregate(pipeline);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};
