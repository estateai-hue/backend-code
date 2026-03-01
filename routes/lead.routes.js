import express from "express";
import {
  createLead,
  getAllLeads,
  getLead,
  updateLead,
  deleteLead,
  assignLeadToAgent,
  updateLeadStatus,
  getAssignedLeads,
} from "../controllers/lead.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// Create Lead
router.post("/", protect, authorize("superadmin", "agent"), createLead);

// Get All Leads (Admin)
router.get("/", protect, authorize("superadmin"), getAllLeads);

// Get Assigned Leads (Agent)
router.get("/assigned", protect, authorize("agent"), getAssignedLeads);

// Get Single Lead
router.get("/:id", protect, getLead);

// Update Lead
router.put("/:id", protect, updateLead);

// Delete Lead
router.delete("/:id", protect, deleteLead);

// Assign Lead
router.post("/assign", protect, authorize("superadmin"), assignLeadToAgent);

// Update Status
router.patch("/:id/status", protect, updateLeadStatus);

export default router;