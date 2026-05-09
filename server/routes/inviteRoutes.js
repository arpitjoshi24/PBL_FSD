import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendInvite,
  getClientInvites,
  getFreelancerInvites,
  updateInviteStatus,
} from "../controllers/inviteController.js";

const router = express.Router();

router.post("/", protect, sendInvite);
router.get("/client", protect, getClientInvites);
router.get("/freelancer", protect, getFreelancerInvites);
router.patch("/:id/status", protect, updateInviteStatus);

export default router;