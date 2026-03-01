import express from "express";
const router = express.Router();

import { 
  getAgents,
  getDashboardStats 
} from "../controllers/adminController.js";

import {protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

// 🔹 Admin Dashboard API
router.get("/dashboard", protect, getDashboardStats);
router.get("/agents", protect, authorize("superadmin"), getAgents);

export default router;