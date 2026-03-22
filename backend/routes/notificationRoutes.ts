import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);

export default router;
