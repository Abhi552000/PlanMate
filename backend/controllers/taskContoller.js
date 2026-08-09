import Task from "../models/taskModel.js";
import Organization from "../models/organizationModel.js";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

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
      links,
      originalEstimate,
    } = req.body;

    let finalCompleted = completed === "Yes" || completed === true;
    let finalStatus = status || "To Do";
    if (status) {
      finalCompleted = status.toLowerCase() === "done";
    } else if (completed !== undefined) {
      finalStatus = finalCompleted ? "Done" : "To Do";
    }

    let generatedKey = "";
    if (req.user.organization) {
      const org = await Organization.findByIdAndUpdate(
        req.user.organization,
        { $inc: { taskCounter: 1 } },
        { new: true }
      );
      if (org) {
        const words = org.name.split(/\s+/).filter(Boolean);
        let prefix = "";
        if (words.length >= 2) {
          prefix = words
            .map((w) => w[0])
            .join("")
            .toUpperCase();
        } else if (words.length === 1) {
          prefix = words[0].slice(0, 3).toUpperCase();
        } else {
          prefix = "TASK";
        }
        generatedKey = `${prefix}-${org.taskCounter}`;
      }
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
      assignee: assignee || null,
      key: generatedKey || undefined,
      organization: req.user.organization || null,
      links: links || [],
    });

    const saved = await task.save();

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
    } = req.query;

    let query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

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
      }
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
        .populate("assignee", "name email")
        .populate("links.targetTask", "title key status priority completed")
        .sort(sortQuery)
        .skip(skip)
        .limit(l)
        .lean();

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
      .populate("assignee", "name email")
      .populate("links.targetTask", "title key status priority completed")
      .sort(sortQuery)
      .lean();

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
    const task = await Task.findOne({ _id: req.params.id, ...query })
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed")
      .populate("workLogs.user", "name email")
      .lean();
    if (!task)
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: MESSAGES.TASK.NOT_FOUND,
      });
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

    const task = await Task.findOne({
      _id: req.params.id,
      ...query,
    });
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
      "storyPoints",
      "originalEstimate",
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
        // Format assignees for comparison
        if (field === "assignee") {
          oldVal = oldVal ? oldVal.toString() : "";
          newVal = newVal ? newVal.toString() : "";
        }

        if (String(oldVal) !== String(newVal)) {
          let displayOldVal = String(oldVal);
          let displayNewVal = String(newVal);

          if (field === "assignee") {
            const oldUser = oldVal
              ? await mongoose.model("user").findById(oldVal)
              : null;
            const newUser = newVal
              ? await mongoose.model("user").findById(newVal)
              : null;
            displayOldVal = oldUser ? oldUser.name : "Unassigned";
            displayNewVal = newUser ? newUser.name : "Unassigned";
          }

          historyEntries.push({
            field,
            oldValue: displayOldVal,
            newValue: displayNewVal,
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
              await Notification.create({
                user: task.assignee,
                title: "Task Updated",
                message: `${req.user.name} updated the ${field} of task "${task.title}" from "${displayOldVal}" to "${displayNewVal}"`,
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

    if (historyEntries.length > 0) {
      if (!task.history) task.history = [];
      task.history.push(...historyEntries);
    }

    await task.save();

    const updated = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed")
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

    const deleted = await Task.findOneAndDelete({
      _id: req.params.id,
      ...query,
    });
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

    const task = await Task.findOne({ _id: req.params.id, ...query });
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

    const populatedTask = await Task.findById(task._id)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .populate("history.updatedBy", "name email")
      .populate("comments.user", "name email avatar")
      .populate("links.targetTask", "title key status priority completed")
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

    const task = await Task.findOne({ _id: req.params.id, ...query });
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
      .populate("links.targetTask", "title key status priority completed")
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
    const { hoursSpent, description } = req.body;
    if (!hoursSpent || Number(hoursSpent) <= 0) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.TASK.WORKLOG_HOURS_INVALID });
    }

    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne({ _id: req.params.id, ...query });
    if (!task) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.TASK.NOT_FOUND });
    }

    // Add log entry
    task.workLogs.push({
      hoursSpent: Number(hoursSpent),
      description: description || "",
      user: req.user.id,
      createdAt: new Date(),
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
      .populate("links.targetTask", "title key status priority completed")
      .populate("workLogs.user", "name email")
      .lean();

    res.json({ success: true, task: updated });
  } catch (error) {
    res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: error.message });
  }
};
