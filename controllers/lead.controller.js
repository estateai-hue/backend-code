import Lead from "../models/Lead.js";
import {io} from "../server.js";
import { createLeadSchema } from "../validations/leadValidation.js";
import LeadHistory from "../models/LeadHistory.js";
import Company from "../models/Company.js";

export const createLead = async (req, res) => {
  try {
    const { error, value } = createLeadSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    let company;

    // 🔥 SUPERADMIN CASE
    if (req.user.role === "superadmin") {
      if (!value.companyId) {
        return res.status(400).json({
          message: "Company is required",
        });
      }

      company = await Company.findById(value.companyId);
    } 
    // 🔥 ADMIN / AGENT CASE
    else {
      company = await Company.findById(req.user.companyId);
    }

    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (
      company.planExpiryDate &&
      new Date(company.planExpiryDate) < new Date()
    ) {
      return res.status(403).json({
        message: "Your plan has expired. Please upgrade.",
      });
    }

    if (
      company.plan.leadsLimit !== -1 &&
      company.leadsUsed >= company.plan.leadsLimit
    ) {
      return res.status(403).json({
        message: "Lead limit reached. Please upgrade your plan.",
      });
    }

    let assignedAgent = value.assignedTo;
    if(req.user.role === "agent"){
      assignedAgent = req.user._id;
    }
    const lead = await Lead.create({
      ...value,
      companyId: company._id,
      assignedTo: assignedAgent,
      status: "new",
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    company.leadsUsed += 1;
    await company.save();

    await LeadHistory.create({
      leadId: lead._id,
      companyId: company._id,
      action: "lead_created",
      updatedBy: req.user._id,
    });

    res.status(201).json({
      message: "Lead created successfully",
      lead,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignLeadToAgent = async (req, res) => {
  try {
    const { leadId, agentId } = req.body;

    const lead = await Lead.findOneAndUpdate(
      {
        _id: leadId,
        companyId: req.user.companyId,
      },
      { assignedTo: agentId },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    await LeadHistory.create({
      leadId: lead._id,
      companyId: req.user.companyId,
      action: "lead_assigned",
      updatedBy: req.user.id,
      newValue: agentId,
    });

    res.json({
      message: "Lead assigned successfully",
      lead,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { leadId } = req.params;
    const { status, followUpDate } = req.body;

    const userId = req.user?._id;        // from auth middleware
    const companyId = req.user?.companyId;

    // Only allow valid statuses
    const allowedStatuses = ["new", "contacted", "closed", "overdue"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const lead = await Lead.findOne({
      _id: leadId,
      companyId,
      assignedTo: userId,   // 🔥 Agent can update ONLY their own leads
      isDeleted: false,
    });

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    if (status) lead.status = status;
    if (followUpDate) lead.followUpDate = followUpDate;

    if (status === "contacted") {
      lead.lastContactedAt = new Date();
      lead.followUpCount += 1;
    }

    await lead.save();

    res.json({ message: "Lead updated successfully", lead });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateLead = async (req, res) => {
  try {
    const updateData = req.body;

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      updateData,
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: req.user.companyId,
        isDeleted: false,
      },
      { isDeleted: true },
      { new: true }
    );

    if (!lead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    // Reduce leadsUsed
    const company = await Company.findById(req.user.companyId);
    if (company && company.leadsUsed > 0) {
      company.leadsUsed -= 1;
      await company.save();
    }

    res.json({ message: "Lead deleted", lead });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAgentLeads = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {
      assignedTo: req.user._id,   // ✅ FIXED
      companyId: req.user.companyId,
      isDeleted: false,
    };

    if (status && status !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { clientEmail: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      data: leads,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error("Leads Error:", error);
    res.status(500).json({ message: "Failed to fetch leads" });
  }
};

export const getAssignedLeads = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status } = req.query;

    const query = {
      assignedTo: req.user.id,
      companyId: req.user.companyId,
    };

    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { clientEmail: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const total = await Lead.countDocuments(query);

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      leads,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({
      _id: id,
      companyId: req.user.companyId
    })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    res.json(lead);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getAllLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      assignedTo,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const query = {
      isDeleted: false,
    };

    if(req.user.role !== "superadmin"){
      query.companyId = req.user.companyId;
    }
	
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { clientEmail: { $regex: search, $options: "i" } },
        { clientPhone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    await Lead.updateMany(
      {
        companyId: req.user.companyId,
        followUpDate: { $lt: new Date() },
        status: { $ne: "closed" },
        isDeleted: false,
      },
      { status: "overdue" }
    );

    const skip = (Number(page) - 1) * Number(limit);

    const leads = await Lead.find(query)
      .populate("assignedTo", "name email")
      .sort({ [sortBy]: order === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Lead.countDocuments(query);

    res.json({
      leads,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};