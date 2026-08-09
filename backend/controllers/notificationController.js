import Notification from "../models/notificationModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

// GET ALL NOTIFICATIONS FOR USER
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// MARK SPECIFIC NOTIFICATION AS READ
export const markAsRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!updated) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.NOTIFICATION.NOT_FOUND });
    }
    res.json({ success: true, notification: updated });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};

// MARK ALL NOTIFICATIONS FOR USER AS READ
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: error.message });
  }
};
