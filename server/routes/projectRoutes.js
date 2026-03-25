import express from "express";
import { createProject, getProjects, getSingleProject } from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("client"), createProject);
router.get("/", getProjects);
router.get("/:id", getSingleProject);
export default router;