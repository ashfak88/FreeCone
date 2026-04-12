import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);

export default router;
