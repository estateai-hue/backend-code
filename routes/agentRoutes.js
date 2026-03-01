import express from "express";
const router = express.Router();

import {protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { deleteAgent, getAgentById, getAllAgents, registerAgent, updateAgent } from "../controllers/agent.controller.js";

router.post("/create-agent", protect, authorize("superadmin"), registerAgent);
router.get("/", protect, authorize("superadmin"), getAllAgents);
router.get("/:id", protect, authorize("superadmin"), getAgentById);
router.put("/:id", protect, authorize("superadmin"), updateAgent);
router.delete("/:id", protect, authorize("superadmin"), deleteAgent);

export default router;