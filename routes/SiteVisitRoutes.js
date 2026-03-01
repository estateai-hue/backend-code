import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {createSiteVisit} from "../controllers/SiteVisitController.js";

const router = express.Router();

router.post("/", protect, createSiteVisit);

export default router;