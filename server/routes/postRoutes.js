import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createPost, getPosts } from "../controllers/postController.js";

const router = express.Router();

// Base route: /api/posts

// Public/Private: Get the social feed
router.get("/", getPosts);

// Private: Create a new social update
router.post("/", protect, createPost);

export default router;