import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { 
  createPost, 
  getPosts, 
  deletePost, 
  toggleLike, 
  addComment, 
  getComments 
} from "../controllers/postController.js";

const router = express.Router();

// Base route: /api/posts

// Core Post Routes
router.get("/", getPosts);
router.post("/", protect, upload.array("media", 5), createPost);
router.delete("/:id", protect, deletePost);

// Social Interaction Routes
router.post("/:id/like", protect, toggleLike);          // Toggle a like
router.post("/:id/comments", protect, addComment);      // Add a comment
router.get("/:id/comments", getComments);               // Fetch comments (Public/Private)

export default router;