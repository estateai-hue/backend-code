import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

/**
 * ===============================
 * PUBLIC ROUTES
 * ===============================
 */

/**
 * REGISTER
 * Roles allowed: admin (create agent), client (self-register)
 */
router.post("/register", registerUser); 

/**
 * LOGIN
 */
router.post("/login", loginUser);


/**
 * ===============================
 * PROTECTED ROUTES
 * ===============================
 */

/**
 * GET MY PROFILE
 */
router.get("/me", protect, getProfile);

/**
 * UPDATE PROFILE
 */
router.patch("/me", protect, updateProfile);

/**
 * CHANGE PASSWORD
 */
router.patch("/change-password", protect, changePassword);


/**
 * ===============================
 * ADMIN ROUTES
 * ===============================
 */

/**
 * GET ALL USERS
 * Admin only
 */
router.get(
  "/users",
  protect,
  authorize("superadmin"),
  getAllUsers
);


/**
 * DELETE USER
 * Admin only
 */
router.delete(
  "/users/:id",
  protect,
  authorize("superadmin"),
  deleteUser
);

export default router;
