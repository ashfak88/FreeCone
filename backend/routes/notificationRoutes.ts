import express from "express";
import { getNotifications, markAsRead, markAllAsRead, markAllAsUnread } from "../controllers/notificationController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/mark-all-read", protect, markAllAsRead);
router.put("/mark-all-unread", protect, markAllAsUnread);

export default router;
