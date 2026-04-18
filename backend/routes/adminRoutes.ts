import express from "express";
import { protect, isAdmin } from "../middleware/auth";
import { 
  getDashboardStats, 
  getUsers, 
  getUserDetail,
  updateUserStatus, 
  updateUserRole,
  getTransactions, 
  getAdminProjects,
  getAdminComplaints,
  updateComplaintStatus,
  getSettings,
  updateSettings,
  broadcastMessage,
  notifyUser
} from "../controllers/adminController";

const router = express.Router();
console.log("   [ROUTER] Admin Routes Loaded");

router.get("/stats", protect, isAdmin, getDashboardStats);
router.post("/send-notification", protect, isAdmin, notifyUser);
router.get("/users", protect, isAdmin, getUsers);
router.get("/users/:id", protect, isAdmin, getUserDetail);
router.put("/users/:id/status", protect, isAdmin, updateUserStatus);
router.put("/users/:id/role", protect, isAdmin, updateUserRole);
router.get("/transactions", protect, isAdmin, getTransactions);
router.get("/projects", protect, isAdmin, getAdminProjects);
router.get("/complaints", protect, isAdmin, getAdminComplaints);
router.patch("/complaints/:id/status", protect, isAdmin, updateComplaintStatus);
router.get("/system-settings", protect, isAdmin, getSettings);
router.put("/system-settings", protect, isAdmin, updateSettings);
router.post("/broadcast", protect, isAdmin, broadcastMessage);

export default router;
