import express from "express";
import { createReview, getFreelancerReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/freelancer/:id", getFreelancerReviews);

export default router;