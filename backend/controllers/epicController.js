import Epic from "../models/epicModel.js";
import Task from "../models/taskModel.js";

// GET ALL EPICS
export const getEpics = async (req, res) => {
  try {
    const orgId = req.user.organization;
    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }

    const epics = await Epic.find({ organization: orgId }).sort({ createdAt: -1 });
    res.json({ success: true, epics });
  } catch (error) {
    console.error("Error in getEpics:", error);
    res.status(500).json({ success: false, message: "Server error fetching epics" });
  }
};

// CREATE AN EPIC
export const createEpic = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }
    if (!name) {
      return res.status(400).json({ success: false, message: "Epic name is required" });
    }

    const epic = new Epic({
      name,
      color: color || "sky",
      description,
      organization: orgId,
    });

    await epic.save();
    res.status(201).json({ success: true, message: "Epic created successfully", epic });
  } catch (error) {
    console.error("Error in createEpic:", error);
    res.status(500).json({ success: false, message: "Server error creating epic" });
  }
};

// UPDATE AN EPIC
export const updateEpic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }

    const epic = await Epic.findOne({ _id: id, organization: orgId });
    if (!epic) {
      return res.status(404).json({ success: false, message: "Epic not found" });
    }

    if (name !== undefined) epic.name = name;
    if (color !== undefined) epic.color = color;
    if (description !== undefined) epic.description = description;

    await epic.save();
    res.json({ success: true, message: "Epic updated successfully", epic });
  } catch (error) {
    console.error("Error in updateEpic:", error);
    res.status(500).json({ success: false, message: "Server error updating epic" });
  }
};

// DELETE AN EPIC
export const deleteEpic = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization;

    if (!orgId) {
      return res.status(400).json({ success: false, message: "User has no organization context" });
    }

    const epic = await Epic.findOneAndDelete({ _id: id, organization: orgId });
    if (!epic) {
      return res.status(404).json({ success: false, message: "Epic not found" });
    }

    // Reassign all tasks using this epic to null
    await Task.updateMany(
      { epic: id, organization: orgId },
      { $set: { epic: null } }
    );

    res.json({ success: true, message: "Epic deleted successfully" });
  } catch (error) {
    console.error("Error in deleteEpic:", error);
    res.status(500).json({ success: false, message: "Server error deleting epic" });
  }
};
