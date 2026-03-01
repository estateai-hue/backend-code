import Lead from "../models/Lead.js";
import Property from "../models/Property.js";
import User from "../models/User.js";
import { io } from "../server.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalAgents = await User.countDocuments({ role: "agent" });
    const activePortfolio = await Property.countDocuments({ status: "active" });
    const newInquiries = await Lead.countDocuments({ status: "new" });

    res.status(200).json({
      totalLeads,
      totalAgents,
      activePortfolio,
      newInquiries,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const emitDashboardStats = async (user) => {
  try {
    const { role, id } = user;

    let totalLeads = 0;
    let totalAgents = 0;
    let activePortfolio = 0;
    let newInquiries = 0;

    if (role === "admin") {
      totalLeads = await Lead.countDocuments();
      totalAgents = await User.countDocuments({ role: "agent" });
      activePortfolio = await Property.countDocuments({ status: "active" });
      newInquiries = await Lead.countDocuments({ status: "new" });

      io.to("adminRoom").emit("dashboardUpdated", {
        totalLeads,
        totalAgents,
        activePortfolio,
        newInquiries,
      });

    } else if (role === "agent") {
      totalLeads = await Lead.countDocuments({ assignedTo: id });

      newInquiries = await Lead.countDocuments({
        assignedTo: id,
        status: "new",
      });

      activePortfolio = await Property.countDocuments({
        agent: id,
        status: "active",
      });

      io.to(id).emit("dashboardUpdated", {
        totalLeads,
        totalAgents: 0,
        activePortfolio,
        newInquiries,
      });
    }

  } catch (error) {
    console.error("Socket dashboard emit error:", error.message);
  }
};


// 🔥 Get All Agents (Admin Only)
export const getAgents = async (req, res) => {
  try {
    const agents = await User.find({
      role: "agent",      // remove if you don't use this field
    })
      .select("-password")   // exclude password
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: agents.length,
      agents,
    });

  } catch (error) {
    console.error("Get Agents Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch agents",
    });
  }
};