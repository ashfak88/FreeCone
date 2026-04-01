import express from "express";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  deleteConversation,
  deleteAllConversations,
  toggleFavorite
} from "../controllers/messageController";
// I'll need to check the middleware for auth
import { protect } from "../middleware/auth";

const router = express.Router();

router.use(protect);

router.get("/conversations", getConversations);
router.delete("/all", deleteAllConversations);
router.delete("/:conversationId", deleteConversation);
router.put("/:conversationId/favorite", toggleFavorite);
router.get("/:conversationId", getMessages);
router.post("/", sendMessage);
router.put("/:conversationId/read", markAsRead);

export default router;
