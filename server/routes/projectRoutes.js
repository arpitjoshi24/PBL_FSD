import express from "express";
import { 
  createProject, 
  getProjects, 
  getSingleProject, 
  updateProjectStatus,
  getMyProjects 
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// --- 1. STATIC ROUTES FIRST ---
// This prevents "my-projects" from being treated as an ":id"
router.get("/my-projects", protect, getMyProjects);

// --- 2. GENERAL ROUTES ---
router.post("/", protect, createProject);
router.get("/", getProjects);

// --- 3. DYNAMIC ROUTES LAST ---
router.get("/:id", getSingleProject);
router.patch("/:id/status", protect, updateProjectStatus);

export default router;