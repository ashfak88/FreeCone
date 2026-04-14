import express from "express";
import { getFreelancers, updateProfile, getProfile, getTestUsers, getUserById, submitReview, getUserReviews, changePassword } from "../controllers/userController";
import { protect } from "../middleware/auth";

const router = express.Router();

// @route   GET /api/users/freelancers
router.get("/freelancers", getFreelancers);

// @route   GET /api/users/profile
router.get("/profile", protect, getProfile);

// @route   PUT /api/users/profile
router.put("/profile", protect, updateProfile);

// @route   PUT /api/users/change-password
router.put("/change-password", protect, changePassword);

// @route   GET /api/users/test-users
router.get("/test-users", getTestUsers);

// @route   GET /api/users/:id
router.get("/:id", getUserById);
router.post("/review", protect, submitReview);

router.get("/:id/reviews", getUserReviews);
export default router;
