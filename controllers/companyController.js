import mongoose from "mongoose";
import Company from "../models/Company.js";
import PlanHistory from "../models/PlanHistory.js";
import bcrypt from "bcryptjs";

/**
 * Helper function to calculate expiry date
 */
const calculateExpiryDate = (duration) => {
  const now = new Date();

  if (duration === "weekly") now.setDate(now.getDate() + 7);
  if (duration === "monthly") now.setMonth(now.getMonth() + 1);
  if (duration === "yearly") now.setFullYear(now.getFullYear() + 1);

  return now;
};

/**
 * ✅ Create Company
 */
export const createCompany = async (req, res) => {
  try {
    const { name, address, gstNumber, plan, password } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Company name is required",
      });
    }

    let expiryDate = null;

    if (plan?.duration) {
      expiryDate = calculateExpiryDate(plan.duration);
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const company = await Company.create({
      name,
      address,
      gstNumber,
      password: hashedPassword,
      plan,
      owner: req.user._id, // ✅ get from token
      planExpiryDate: expiryDate,
    });

    res.status(201).json({
      message: "Company created successfully",
      company,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * ✅ Get All Companies
 */
export const getAllCompanies = async (req, res) => {
  try {
    let companies;

    if (req.user.role === "superadmin") {
      // Superadmin sees all companies
      companies = await Company.find().populate("owner", "name email role");
    } else {
      // Agent/User sees only their own company
      if (!req.user.companyId) {
        return res.status(404).json({ message: "Company not found for this user" });
      }
      companies = await Company.find({ _id: req.user.companyId }).populate(
        "owner",
        "name email role"
      );
    }

    res.json(companies); // return as array directly, easier for frontend
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
/**
 * ✅ Get Single Company
 */

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid company ID" });
    }

    const company = await Company.findById(id).populate("owner", "name email role");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (
      req.user.role !== "superadmin" &&
      company.owner._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(company);

  } catch (error) {
    console.error("getCompanyById error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.user.companyId)
      .select("name");

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json(company);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
/**
 * ✅ Update Company (Superadmin Only)
 */

export const updateCompany = async (req, res) => {
  try {
    const { plan } = req.body;

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const oldPlanName = company.plan?.name;

    if (plan && plan !== oldPlanName) {

      const plansConfig = {
        free: { name: "free", price: 0 },
        basic: { name: "basic", price: 999 },
        standard: { name: "standard", price: 1999 },
        business: { name: "business", price: 4999 },
      };

      const selectedPlan = plansConfig[plan];

      if (!selectedPlan) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      company.plan = {
        ...company.plan,
        ...selectedPlan,
      };

      await PlanHistory.create({
        company: company._id,
        oldPlan: oldPlanName,
        newPlan: plan,
        amount: selectedPlan.price,
        paymentId: "MANUAL_UPDATE"
      });
    }

    await company.save();

    res.json({
      message: "Company updated successfully",
      company,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


/**
 * ✅ Delete Company (Superadmin Only)
 */
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    res.json({ message: "Company deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCompanyPlanHistory = async (req, res) => {
  try {
    const history = await PlanHistory.find({
      company: req.params.id,
    }).sort({ date: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};