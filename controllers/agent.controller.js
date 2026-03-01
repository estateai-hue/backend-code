import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Company from "../models/Company.js";
import mongoose from "mongoose";

export const registerAgent = async (req, res) => {
  try {
    const { name, email, password, companyId } = req.body;

    // Basic validation
    if (!name || !email || !password || !companyId) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate companyId
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const company = await Company.findById(companyId);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    // Optional: Only superadmin or company owner can create agent
    if (
      req.user.role !== "superadmin" &&
      req.user._id.toString() !== company.owner.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create agent
    const agent = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "agent",
      companyId: company._id,
    });

    res.status(201).json({
      message: "Agent created successfully",
      agent: { ...agent._doc, password: undefined },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all agents (Superadmin Only)
 */
export const getAllAgents = async (req, res) => {
  try {
    // Only superadmin can view all agents
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const agents = await User.find({ role: "agent" })
      .select("-password")
      .populate("companyId", "name plan");

    res.json({ agents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get Agent by ID
 */
export const getAgentById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const agent = await User.findById(id)
      .select("-password")
      .populate("companyId", "name plan");

    if (!agent || agent.role !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Allow superadmin or agent themselves
    if (
      req.user.role !== "superadmin" &&
      req.user._id.toString() !== agent._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update Agent
 */
export const updateAgent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const agent = await User.findById(id);

    if (!agent || agent.role !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    // Only superadmin can update any agent
    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    agent.name = name || agent.name;
    agent.email = email || agent.email;

    if (password) {
      agent.password = await bcrypt.hash(password, 10);
    }

    await agent.save();

    res.json({ message: "Agent updated successfully", agent: { ...agent._doc, password: undefined } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete Agent
 */
export const deleteAgent = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid agent ID" });
    }

    const agent = await User.findById(id);

    if (!agent || agent.role !== "agent") {
      return res.status(404).json({ message: "Agent not found" });
    }

    if (req.user.role !== "superadmin") {
      return res.status(403).json({ message: "Access denied" });
    }

    await agent.deleteOne();

    res.json({ message: "Agent deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};