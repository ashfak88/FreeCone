import express from "express";
import { protect, isAdmin } from "../middleware/auth";
import { getDashboardStats, getUsers, updateUserStatus, getTransactions, getAdminProjects } from "../controllers/adminController";

const router = express.Router();

router.get("/stats", protect, isAdmin, getDashboardStats);
router.get("/users", protect, isAdmin, getUsers);
router.put("/users/:id/status", protect, isAdmin, updateUserStatus);
router.get("/transactions", protect, isAdmin, getTransactions);
router.get("/projects", protect, isAdmin, getAdminProjects);

export default router;
