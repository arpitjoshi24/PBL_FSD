import express from "express";
import { createProject, getProjects } from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("client"), createProject);
router.get("/", getProjects);

export default router;