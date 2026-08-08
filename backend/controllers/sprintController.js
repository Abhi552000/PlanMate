import Sprint from "../models/sprintModel.js";
import Task from "../models/taskModel.js";
import Epic from "../models/epicModel.js";

const seedAgileData = async (orgId, userId) => {
  const sprintCount = await Sprint.countDocuments({ organization: orgId });
  if (sprintCount > 0) return; // Already has sprints

  // 1. Create Epics
  const epics = await Epic.create([
    { name: "Workload Activation", color: "sky", description: "Tasks related to workload activation dashboards", organization: orgId },
    { name: "Performance Metrics", color: "emerald", description: "Tasks related to query and render speeds", organization: orgId },
    { name: "QA Readiness", color: "violet", description: "Verification testing scripts and quality gates", organization: orgId }
  ]);

  const workloadEpicId = epics[0]._id;
  const performanceEpicId = epics[1]._id;
  const qaEpicId = epics[2]._id;

  // 2. Create Sprints
  const now = new Date();
  const sprint1 = await Sprint.create({
    name: "Sprint 1 - Delivery",
    startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    status: "active",
    goal: "Deploy core workload activation widgets",
    organization: orgId
  });

  const sprint2 = await Sprint.create({
    name: "Sprint 2 - Optimizations",
    startDate: new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000),
    endDate: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
    status: "planned",
    goal: "Optimize queries, API response payload, and cache",
    organization: orgId
  });

  // 3. Create Tasks
  await Task.create([
    // Sprint 1 (Active) Tasks
    {
      title: "Support Google Sheets as a data source",
      description: "Allow importing user workload matrices directly from Google spreadsheets.",
      priority: "High",
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: userId,
      organization: orgId,
      status: "To Do",
      issueType: "Story",
      storyPoints: 5,
      sprint: sprint1._id,
      epic: workloadEpicId
    },
    {
      title: "Find tasks when plan on timeline and workload [playstudios]",
      description: "Fix bug where timeline filter fails to load tasks with complex scopes.",
      priority: "Medium",
      dueDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: userId,
      organization: orgId,
      status: "In Progress",
      issueType: "Bug",
      storyPoints: 3,
      sprint: sprint1._id,
      epic: workloadEpicId
    },
    {
      title: "Reports performance metrics widgets",
      description: "Aggregated performance metrics count queries logic backend.",
      priority: "High",
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: null,
      organization: orgId,
      status: "To Do",
      issueType: "Story",
      storyPoints: 8,
      sprint: sprint1._id,
      epic: performanceEpicId
    },
    {
      title: "WN Epic milestones assignee list panel",
      description: "Display milestone assignee avatars inside Epics details drawer.",
      priority: "Low",
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: userId,
      organization: orgId,
      status: "Done",
      issueType: "Task",
      storyPoints: 2,
      sprint: sprint1._id,
      epic: workloadEpicId
    },

    // Sprint 2 (Planned) Tasks
    {
      title: "Jira onboarding email sequences",
      description: "Configure transactional email sequences triggers when new users signup.",
      priority: "Medium",
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: null,
      organization: orgId,
      status: "To Do",
      issueType: "Story",
      storyPoints: 3,
      sprint: sprint2._id,
      epic: qaEpicId
    },
    {
      title: "API response optimization",
      description: "Reduce payload size on tasks get requests.",
      priority: "Low",
      dueDate: new Date(now.getTime() + 12 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: userId,
      organization: orgId,
      status: "To Do",
      issueType: "Task",
      storyPoints: 1,
      sprint: sprint2._id,
      epic: performanceEpicId
    },

    // Backlog Tasks
    {
      title: "Trello trial to paid conversion and churn metrics",
      description: "Triage trial subscriptions conversion pipeline triggers.",
      priority: "High",
      dueDate: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: null,
      organization: orgId,
      status: "To Do",
      issueType: "Story",
      storyPoints: 8,
      sprint: null,
      epic: performanceEpicId
    },
    {
      title: "Book a demo button and Get Started guide button in sidebar",
      description: "Add demo call bookings button in workspace sidebar panel.",
      priority: "Low",
      dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
      owner: userId,
      assignee: userId,
      organization: orgId,
      status: "To Do",
      issueType: "Task",
      storyPoints: 2,
      sprint: null,
      epic: workloadEpicId
    }
  ]);
};

// GET ALL SPRINTS & BACKLOG TASKS
export const getSprints = async (req, res) => {
  try {
    const orgId = req.user.organization;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }

    // Seed data on demand if empty
    await seedAgileData(orgId, req.user._id || req.user.id);

    // 1. Fetch Sprints
    const sprints = await Sprint.find({ organization: orgId }).sort({ createdAt: -1 });

    // 2. Fetch Tasks for each sprint
    const sprintsWithTasks = await Promise.all(sprints.map(async (sprint) => {
      const tasks = await Task.find({ sprint: sprint._id })
        .populate("assignee", "name email")
        .populate("epic")
        .sort({ createdAt: -1 });
      return {
        ...sprint.toObject(),
        tasks,
      };
    }));

    // 3. Fetch Backlog Tasks (not assigned to any sprint)
    const backlogTasks = await Task.find({ organization: orgId, sprint: null })
      .populate("assignee", "name email")
      .populate("epic")
      .sort({ createdAt: -1 });

    res.json({ success: true, sprints: sprintsWithTasks, backlogTasks });
  } catch (error) {
    console.error("Error in getSprints:", error);
    res.status(500).json({ success: false, message: "Server error fetching sprints" });
  }
};

// CREATE A SPRINT
export const createSprint = async (req, res) => {
  try {
    const { name, startDate, endDate, goal } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Sprint name is required" });
    }

    const sprint = new Sprint({
      name,
      startDate,
      endDate,
      goal,
      organization: orgId,
    });

    await sprint.save();
    res.status(201).json({ success: true, message: "Sprint created successfully", sprint });
  } catch (error) {
    console.error("Error in createSprint:", error);
    res.status(500).json({ success: false, message: "Server error creating sprint" });
  }
};

// UPDATE SPRINT (Start/Close/Edit)
export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, goal, status } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }

    const sprint = await Sprint.findOne({ _id: id, organization: orgId });
    if (!sprint) {
      return res.status(404).json({ success: false, message: "Sprint not found" });
    }

    // Transitioning to active
    if (status === "active" && sprint.status !== "active") {
      const activeSprint = await Sprint.findOne({ organization: orgId, status: "active" });
      if (activeSprint) {
        return res.status(400).json({ success: false, message: "There is already an active sprint. Complete it first." });
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
    res.json({ success: true, message: "Sprint updated successfully", sprint });
  } catch (error) {
    console.error("Error in updateSprint:", error);
    res.status(500).json({ success: false, message: "Server error updating sprint" });
  }
};

// DELETE SPRINT
export const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }

    const sprint = await Sprint.findOneAndDelete({ _id: id, organization: orgId });
    if (!sprint) {
      return res.status(404).json({ success: false, message: "Sprint not found" });
    }

    // Put all tasks belonging to this sprint back to the backlog
    await Task.updateMany(
      { sprint: id, organization: orgId },
      { $set: { sprint: null } }
    );

    res.json({ success: true, message: "Sprint deleted successfully" });
  } catch (error) {
    console.error("Error in deleteSprint:", error);
    res.status(500).json({ success: false, message: "Server error deleting sprint" });
  }
};
