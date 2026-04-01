import express from "express";
import { getFreelancers, updateProfile, getProfile, getTestUsers } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

// @route   GET /api/users/freelancers
router.get("/freelancers", getFreelancers);

// @route   GET /api/users/profile
router.get("/profile", protect, getProfile);

// @route   PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// @route   GET /api/users/test-users
router.get("/test-users", getTestUsers);

export default router;
