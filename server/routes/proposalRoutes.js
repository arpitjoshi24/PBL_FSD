import express from "express";
import { 
  createProposal, 
  getProjectProposals, 
  acceptProposal,
  getMyProposals
} from "../controllers/proposalController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Base route: /api/proposals

// Freelancer: Submit a new bid
router.post("/", protect, createProposal);

// Client: View all bids for a specific project
router.get("/project/:projectId", protect, getProjectProposals);

// Client: Accept a specific freelancer's proposal
router.patch("/:id/accept", protect, acceptProposal);

// Add getMyProposals to your imports
router.get("/my-proposals", protect, getMyProposals);

export default router;