import express from "express";
import { createInquiry } from "../controllers/inquiryController.js";
import {protect} from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/", protect, createInquiry);

export default router;
