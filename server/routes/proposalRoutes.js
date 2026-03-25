import express from "express";
import { createProposal } from "../controllers/proposalController.js";
import{ protect }from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createProposal);

export default router;