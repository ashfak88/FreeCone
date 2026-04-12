import express from "express";
import { ping } from "../controllers/miscController";
import { submitComplaint } from "../controllers/complaintController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.get("/ping", ping);
router.post("/report", protect, submitComplaint);

export default router;
