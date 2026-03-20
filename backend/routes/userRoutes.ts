import express from "express";
import { getFreelancers, updateProfile, getProfile } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

// @route   GET /api/users/freelancers
router.get("/freelancers", getFreelancers);

// @route   GET /api/users/profile
router.get("/profile", protect, getProfile);

// @route   PUT /api/users/profile
router.put("/profile", protect, updateProfile);

export default router;
