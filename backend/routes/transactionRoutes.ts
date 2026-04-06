import express from "express";
import { getTransactions, getTransactionSummary } from "../controllers/transactionController";
import { protect } from "../middleware/auth";

const router = express.Router();

console.log(`   💸 TRANSACTION ROUTES LOADED AT: ${new Date().toLocaleTimeString()}`);

// @route   GET /api/transactions
router.get("/", protect, getTransactions);

// @route   GET /api/transactions/summary
router.get("/summary", protect, getTransactionSummary);

export default router;
