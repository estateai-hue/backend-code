import express from "express";
import {
  createProperty,
  getAllProperties,
  getSingleProperty,
  updateProperty,
  deleteProperty,
  getProperties,
  getSimilarProperties,
  toggleLikeProperty,
} from "../controllers/property.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

/**
 * ----------------------------------------
 * PUBLIC ROUTES
 * ----------------------------------------
 */

// Similar properties (no auth needed)
router.get("/similar/:id", getSimilarProperties);

// Like property (must be logged in)
router.post("/:id/like", protect, toggleLikeProperty);

/**
 * ----------------------------------------
 * PROTECTED ROUTES
 * ----------------------------------------
 */

// Get all properties
router.get(
  "/",
  protect,
  authorize("superadmin", "agent", "client"),
  getAllProperties
);

// Filter / Search by location
router.get(
  "/get-filter",
  protect,
  authorize("superadmin", "agent", "client"),
  getProperties
);

// Get single property
router.get(
  "/:id",
  protect,
  authorize("superadmin", "agent", "client"),
  getSingleProperty
);

// Create property
router.post(
  "/",
  protect,
  authorize("superadmin", "agent"),
  upload.array("images", 10),
  createProperty
);

// Update property
router.patch(
  "/:id",
  protect,
  authorize("superadmin", "agent"),
  updateProperty
);

// Delete property
router.delete(
  "/:id",
  protect,
  authorize("superadmin", "agent"),
  deleteProperty
);

export default router;