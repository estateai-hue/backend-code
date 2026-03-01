import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  checkWhishList,
  countWishlist
} from "../controllers/wishlistController.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ STATIC routes first
router.get("/count", protect, countWishlist);
router.get("/check/:propertyId", protect, checkWhishList);

// ✅ Then general routes
router.get("/", protect, getWishlist);
router.post("/", protect, addToWishlist);
router.delete("/:propertyId", protect, removeFromWishlist);

export default router;
