import express from "express";
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyPlanHistory,
  getMyCompany
} from "../controllers/companyController.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * 🟢 Superadmin + Agent can create
 */
router.post("/", protect, authorize("superadmin", "agent"), createCompany);

/**
 * 🟢 All logged users can view
 */
router.get("/", protect, getAllCompanies);

router.get("/me", protect, getMyCompany);

router.get("/:id", protect, getCompanyById);

router.get(
  "/:id/plan-history",
  protect,
  authorize("superadmin", "agent"),
  getCompanyPlanHistory
);
/**
 * 🔴 Only Superadmin can update & delete
 */
router.put("/:id", protect, authorize("superadmin", "agent"), updateCompany);
router.delete("/:id", protect, authorize("superadmin"), deleteCompany);


export default router;