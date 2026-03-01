import express from "express";
import {
  getPropertyReviews,
  addReview,
} from "../controllers/reviewController.js";

const router = express.Router();

router.get("/:propertyId", getPropertyReviews);
router.post("/:propertyId", addReview);

export default router;