import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export default async function authMiddleware(req, res, next) {
  // Grab the Bearer token from Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ success: false, message: "Not Authorized, token missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: MESSAGES.AUTH.USER_NOT_FOUND });
    }

    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error("JWT verification failed", err);
    return res
      .status(HttpStatus.UNAUTHORIZED)
      .json({ success: false, message: "Token invalid or expired" });
  }
}
