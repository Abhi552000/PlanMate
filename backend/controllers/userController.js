import validator from "validator";
import User from "../models/userModel.js";
import Organization from "../models/organizationModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";
const TOKEN_EXPIRES = "24h";

const createToken = (userId) =>
  jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRES });

// REGISTER FUNCTION
export async function registerUser(req, res) {
  const { name, email, password, organization } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ success: false, message: "Invalid email" });
  }
  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      message: "Password must be atleast 8 characters",
    });
  }

  try {
    if (await User.findOne({ email })) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // If joining an existing organization via dropdown self-signup
    if (organization) {
      const orgExists = await Organization.findById(organization);
      if (!orgExists) {
        return res.status(400).json({ success: false, message: "Selected organization not found" });
      }

      await User.create({
        name,
        email,
        password: hashed,
        organization: orgExists._id,
        role: "member",
        status: "pending"
      });

      return res.status(201).json({
        success: true,
        message: "Registration successful! Your request is pending approval by your organization administrator."
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

    res.status(201).json({
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
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// LOGIN FUNCTION
export async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password required" });
  }

  try {
    const user = await User.findOne({ email }).populate("organization");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }
    if (user.organization && user.organization.isActive === false) {
      return res.status(403).json({
        success: false,
        message: `Your organization is inactive: ${user.organization.remark || "Deactivated by System Admin"}. Please contact your administrator.`
      });
    }
    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your registration request is pending approval by your organization administrator. Please contact your administrator for access."
      });
    }
    if (user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your access request has been rejected by your organization administrator."
      });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
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
    res.status(500).json({ success: false, message: "Server error" });
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
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    if (user.organization && user.organization.isActive === false) {
      return res.status(403).json({
        success: false,
        message: `Your organization is inactive: ${user.organization.remark || "Deactivated by System Admin"}. Please contact your administrator.`
      });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// UPDATE USER PROFILE
export async function updateProfile(req, res) {
  const { name } = req.body;
  if (!name) {
    return res
      .status(400)
      .json({ success: false, message: "valid name required" });
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
    res.status(500).json({ success: false, message: "Server error" });
  }
}

// CHANGE PASSWORD
export async function updatePassword(req, res) {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res
      .json(400)
      .json({ success: false, message: "Password invalid or too short" });
  }
  try {
    const user = await User.findById(req.user.id).select("password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Current password incorrect" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ success: true, message: "Password changed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
