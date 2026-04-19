import express from "express";
import { 
  getFreelancers, 
  getUserProfile 
} from "../controllers/userController.js";
import { 
    getClientStats,
    getFreelancerStats
 } from "../controllers/statsController.js"; // Import the new stats controller
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- DISCOVERY ROUTES ---
// Protected: Only logged-in users can browse freelancers
router.get("/freelancers", protect, getFreelancers);

// --- PROFILE ROUTES ---
// Fetch specific details for the FreelancerDetail page
router.get("/profile/:id", protect, getUserProfile);

// --- ANALYTICS ROUTES ---
// Fetch chart data for the Client Dashboard Cockpit
router.get("/stats/client", protect, getClientStats);
// Fetch chart data for the Freelancer Dashboard Cockpit
router.get("/stats/freelancer", protect, getFreelancerStats);
export default router;