import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

export const errorHandler = (err, req, res, next) => {
  console.error("Express Error Handler Captured:", err);

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: Object.values(err.errors).map((e) => e.message).join(", "),
    });
  }

  // Handle JWT signature/expiry errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: "Session expired or token invalid",
    });
  }

  // Handle mongoose CastError (invalid ObjectId format)
  if (err.name === "CastError") {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: `Invalid identifier format: ${err.value}`,
    });
  }

  res.status(err.status || HttpStatus.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: err.message || MESSAGES.COMMON.SERVER_ERROR,
  });
};
