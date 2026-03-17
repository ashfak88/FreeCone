import express from "express";
import { getFreelancers } from "../controllers/userController";

const router = express.Router();

// @route   GET /api/users/freelancers
router.get("/freelancers", getFreelancers);

export default router;
