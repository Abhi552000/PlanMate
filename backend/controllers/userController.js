import validator from "validator";
import User from "../models/userModel.js";
import Organization from "../models/organizationModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpStatus } from "../constants/httpStatus.js";
import { MESSAGES } from "../constants/messages.js";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_EXPIRES = "24h";

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// REGISTER FUNCTION
export async function registerUser(req, res) {
  const { name, email, password, organization } = req.body;

  if (!name || !email || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.ALL_FIELDS_REQUIRED });
  }
  if (!validator.isEmail(email)) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.INVALID_EMAIL });
  }
  if (password.length < 8) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      message: MESSAGES.AUTH.PASSWORD_LENGTH,
    });
  }

  try {
    if (await User.findOne({ email })) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.USER_EXISTS });
    }

    const hashed = await bcrypt.hash(password, 10);

    // If joining an existing organization via dropdown self-signup
    if (organization) {
      const orgExists = await Organization.findById(organization);
      if (!orgExists) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: MESSAGES.AUTH.ORG_NOT_FOUND });
      }

      await User.create({
        name,
        email,
        password: hashed,
        organization: orgExists._id,
        role: "member",
        status: "pending"
      });

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: MESSAGES.AUTH.REGISTRATION_SUCCESS_PENDING
      });
    }

    // Default auto-create organization for org admin signup (fallback)
    const user = await User.create({ 
      name, 
      email, 
      password: hashed,
      role: "org_admin",
      status: "active"
    });
    
    const token = createToken(user._id);

    const org = await Organization.create({
      name: `${name}'s Organization`,
      admin: user._id
    });

    user.organization = org._id;
    await user.save();

    res.status(HttpStatus.CREATED).json({
      success: true,
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        organization: org 
      },
    });
  } catch (err) {
    console.log(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
}

// LOGIN FUNCTION
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.EMAIL_PASSWORD_REQUIRED });
  }

  try {
    const user = await User.findOne({ email }).populate("organization");
    if (!user) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: MESSAGES.AUTH.INVALID_CREDENTIALS });
    }
    if (user.organization && user.organization.isActive === false) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: MESSAGES.AUTH.ORG_INACTIVE(user.organization.remark)
      });
    }
    if (user.status === "pending") {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: MESSAGES.AUTH.REGISTRATION_PENDING
      });
    }
    if (user.status === "rejected") {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: MESSAGES.AUTH.REGISTRATION_REJECTED
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: MESSAGES.AUTH.INVALID_CREDENTIALS });
    }
    const token = createToken(user._id);
    res.json({
      success: true,
      message: true,
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role || "member",
        organization: user.organization || null
      },
    });
  } catch (err) {
    console.log(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
}

// GET CURRENT USER
export async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.user.id)
      .select("name email role organization")
      .populate("organization");
    if (!user) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: MESSAGES.AUTH.USER_NOT_FOUND });
    }
    if (user.organization && user.organization.isActive === false) {
      return res.status(HttpStatus.FORBIDDEN).json({
        success: false,
        message: MESSAGES.AUTH.ORG_INACTIVE(user.organization.remark)
      });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
}

// UPDATE USER PROFILE
export async function updateProfile(req, res) {
  const { name } = req.body;
  if (!name) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.VALID_NAME_REQUIRED });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name },
      { new: true, runValidators: true, select: "name email" }
    );
    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
}

// CHANGE PASSWORD
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res
      .status(HttpStatus.BAD_REQUEST)
      .json({ success: false, message: MESSAGES.AUTH.PASSWORD_INVALID });
  }
  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res
        .status(HttpStatus.NOT_FOUND)
        .json({ success: false, message: MESSAGES.AUTH.USER_NOT_FOUND });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json({ success: false, message: MESSAGES.AUTH.PASSWORD_INCORRECT });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: MESSAGES.AUTH.PASSWORD_CHANGED });
  } catch (err) {
    console.log(err);
    res
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: MESSAGES.COMMON.SERVER_ERROR });
  }
}
