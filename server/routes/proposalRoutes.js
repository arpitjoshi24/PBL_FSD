import express from "express";
import { 
  createProposal, 
  getProjectProposals, 
  acceptProposal,
  getMyProposals
} from "../controllers/proposalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- 1. STATIC/SPECIFIC ROUTES ---
router.get("/my-proposals", protect, getMyProposals);
router.get("/projects/:projectId", protect, getProjectProposals);

// --- 2. GENERAL ACTION ROUTES ---
router.post("/", protect, createProposal);

// --- 3. DYNAMIC ROUTES ---
router.patch("/:id/accept", protect, acceptProposal);

export default router;