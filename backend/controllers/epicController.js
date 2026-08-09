import Epic from "../models/epicModel.js";
import Task from "../models/taskModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

// GET ALL EPICS
export const getEpics = async (req, res) => {
  try {
    const orgId = req.user.organization;
    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const epics = await Epic.find({ organization: orgId }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, epics });
  } catch (error) {
    console.error("Error in getEpics:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// CREATE AN EPIC
export const createEpic = async (req, res) => {
  try {
    const { name, color, description } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }
    if (!name) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.EPIC.NAME_REQUIRED });
    }

    const epic = new Epic({
      name,
      color: color || "sky",
      description,
      organization: orgId,
    });

    await epic.save();
    res.status(HttpStatus.CREATED).json({ success: true, message: MESSAGES.EPIC.CREATED, epic });
  } catch (error) {
    console.error("Error in createEpic:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// UPDATE AN EPIC
export const updateEpic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;
    const orgId = req.user.organization;

    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const epic = await Epic.findOne({ _id: id, organization: orgId });
    if (!epic) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.EPIC.NOT_FOUND });
    }

    if (name !== undefined) epic.name = name;
    if (color !== undefined) epic.color = color;
    if (description !== undefined) epic.description = description;

    await epic.save();
    res.json({ success: true, message: MESSAGES.ORG.UPDATED, epic });
  } catch (error) {
    console.error("Error in updateEpic:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};

// DELETE AN EPIC
export const deleteEpic = async (req, res) => {
  try {
    const { id } = req.params;
    const orgId = req.user.organization;

    if (!orgId) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.ORG.NOT_FOUND });
    }

    const epic = await Epic.findOneAndDelete({ _id: id, organization: orgId });
    if (!epic) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.EPIC.NOT_FOUND });
    }

    // Reassign all tasks using this epic to null
    await Task.updateMany(
      { epic: id, organization: orgId },
      { $set: { epic: null } }
    );

    res.json({ success: true, message: MESSAGES.ORG.STATUS_DELETED });
  } catch (error) {
    console.error("Error in deleteEpic:", error);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
};
