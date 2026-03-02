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
import { addLeadNote, getLeadNotes } from "../controllers/LeadNoteController.js";

const router = express.Router();

// ✅ Specific routes FIRST

// Get Assigned Leads (Agent)
router.get("/assigned", protect, authorize("agent"), getAssignedLeads);

// Assign Lead
router.post("/assign", protect, authorize("superadmin"), assignLeadToAgent);

// Update Status
router.patch("/:leadId/status", protect, authorize("agent"), updateLeadStatus);

// Notes routes (MUST be before /:id)
router.post("/:leadId/notes", protect, authorize("agent"), addLeadNote);
router.get("/:leadId/notes", protect, authorize("agent"), getLeadNotes);

// ----------------------
// Generic CRUD routes LAST
// ----------------------

// Create Lead
router.post("/", protect, authorize("superadmin"), createLead);

// Get All Leads (Admin)
router.get("/", protect, authorize("superadmin"), getAllLeads);

// Get Single Lead
router.get("/:id", protect, getLead);

// Update Lead
router.put("/:id", protect, updateLead);

// Delete Lead
router.delete("/:leadId", protect, deleteLead);

export default router;