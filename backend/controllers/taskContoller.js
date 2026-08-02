import Task from "../models/taskModel.js";
import Organization from "../models/organizationModel.js";
import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

// CREATE A NEW TASK
export const createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, completed, status, issueType, storyPoints, subtasks, assignee } = req.body;
    
    let finalCompleted = completed === "Yes" || completed === true;
    let finalStatus = status || "To Do";
    if (status === "Done") {
      finalCompleted = true;
    } else if (status === "To Do" || status === "In Progress") {
      finalCompleted = false;
    } else if (finalCompleted) {
      finalStatus = "Done";
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
          prefix = words.map(w => w[0]).join("").toUpperCase();
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
      subtasks: subtasks || [],
      owner: req.user.id,
      assignee: assignee || null,
      key: generatedKey || undefined,
      organization: req.user.organization || null,
    });

    const saved = await task.save();

    // Create notification if assigned to someone else
    if (assignee && assignee.toString() !== req.user.id) {
      try {
        await Notification.create({
          user: assignee,
          title: "New Issue Assigned",
          message: `${req.user.name} created and assigned you the issue: "${title}" (${generatedKey || `PM-${saved._id.toString().slice(-4).toUpperCase()}`})`,
          link: `/task/${saved._id}`,
          read: false,
        });
      } catch (err) {
        console.error("Error creating task assignment notification:", err);
      }
    }

    const populated = await Task.findById(saved._id)
      .populate("owner", "name email")
      .populate("assignee", "name email");
    res.status(201).json({ success: true, task: populated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL TASK FOR LOGGED - IN USER'S ORGANIZATION
export const getTasks = async (req, res) => {
  try {
    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };
    const tasks = await Task.find(query)
      .populate("owner", "name email")
      .populate("assignee", "name email")
      .sort({
        createdAt: -1,
      });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
      .populate("history.updatedBy", "name email");
    if (!task)
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    res.json({ success: true, task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE A TASK
export const updateTask = async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (data.status !== undefined || data.completed !== undefined) {
      let isCompletedVal = data.completed;
      if (isCompletedVal !== undefined) {
        isCompletedVal = isCompletedVal === "Yes" || isCompletedVal === true;
      }

      if (data.status === "Done") {
        data.completed = true;
      } else if (data.status === "To Do" || data.status === "In Progress") {
        data.completed = false;
      } else if (isCompletedVal === true) {
        data.status = "Done";
        data.completed = true;
      } else if (isCompletedVal === false) {
        data.completed = false;
        data.status = "To Do";
      }
    }

    if (data.storyPoints !== undefined) {
      data.storyPoints = Number(data.storyPoints);
    }

    const query = req.user.organization
      ? { organization: req.user.organization }
      : { owner: req.user.id };

    const task = await Task.findOne({
      _id: req.params.id,
      ...query
    });
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found or not in your organization",
      });
    }

    // Compare fields to generate history/changelog
    const historyEntries = [];
    const fieldsToTrack = ["title", "description", "status", "priority", "assignee", "storyPoints", "dueDate"];
    
    for (const field of fieldsToTrack) {
      if (data[field] !== undefined) {
        let oldVal = task[field];
        let newVal = data[field];

        // Format dates for comparison
        if (field === "dueDate") {
          oldVal = oldVal ? new Date(oldVal).toISOString().split('T')[0] : "";
          newVal = newVal ? new Date(newVal).toISOString().split('T')[0] : "";
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
            const oldUser = oldVal ? await mongoose.model("user").findById(oldVal) : null;
            const newUser = newVal ? await mongoose.model("user").findById(newVal) : null;
            displayOldVal = oldUser ? oldUser.name : "Unassigned";
            displayNewVal = newUser ? newUser.name : "Unassigned";
          }

          historyEntries.push({
            field,
            oldValue: displayOldVal,
            newValue: displayNewVal,
            updatedBy: req.user.id,
            updatedAt: new Date()
          });

          // Send notification triggers
          if (field === "assignee" && newVal && newVal.toString() !== req.user.id) {
            try {
              await Notification.create({
                user: newVal,
                title: "New Issue Assigned",
                message: `${req.user.name} assigned you the issue: "${task.title}" (${task.key || `PM-${task._id.toString().slice(-4).toUpperCase()}`})`,
                link: `/task/${task._id}`,
                read: false,
              });
            } catch (err) {
              console.error("Error creating assignment notification:", err);
            }
          } else if (field !== "assignee" && task.assignee && task.assignee.toString() !== req.user.id) {
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
      .populate("history.updatedBy", "name email");

    res.json({ success: true, task: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
        .status(404)
        .json({ success: false, message: "Task not found or not in your organization" });
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
