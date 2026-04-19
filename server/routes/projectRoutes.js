import express from "express";
import { 
  createProject, 
  getProjects, 
  getSingleProject, 
  updateProjectStatus,
  getMyProjects,
  getTrendingProjects
} from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Static routes (Specific)
router.get("/my-projects", protect, getMyProjects);

// General routes
router.post("/", protect, createProject);
router.get("/", getProjects);

// Dynamic routes (Parametric)
router.get("/:id", getSingleProject);
router.patch("/:id/status", protect, updateProjectStatus);

router.get("/trending", getTrendingProjects);
export default router;