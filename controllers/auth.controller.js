import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Generate JWT Token
 */
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      companyId: user.companyId 
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * REGISTER USER
 */
export const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone
    } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: "user" // force user
    });

    const token = generateToken(user);

    res.status(201).json({ token, user });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * LOGIN USER
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        email: user.email
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET PROFILE
 */
export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


