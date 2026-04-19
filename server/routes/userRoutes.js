import express from "express";
import { getFreelancers, getUserProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Both routes are protected because only logged-in users should browse the community
router.get("/freelancers", protect, getFreelancers);
router.get("/profile/:id", protect, getUserProfile);

export default router;