import { Request, Response } from "express";
import Transaction from "../models/Transaction";
import mongoose from "mongoose";

// @desc    Get all transactions for the logged-in user
// @route   GET /api/transactions
// @access  Private
export const getTransactions = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const transactions = await Transaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate("sender", "name email imageUrl")
      .populate("receiver", "name email imageUrl")
      .populate("job", "title")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error: any) {
    console.error("   [ERROR] GET TRANSACTIONS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get escrow summary for the logged-in user
// @route   GET /api/transactions/summary
// @access  Private
export const getTransactionSummary = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    // Total escrow held AS SENDER (Client paid, money in escrow)
    const senderEscrow = await Transaction.aggregate([
      { $match: { sender: userObjectId, status: "Escrow" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    // Total escrow held AS RECEIVER (Freelancer to receive, money in escrow)
    const receiverEscrow = await Transaction.aggregate([
      { $match: { receiver: userObjectId, status: "Escrow" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    // Total spent (Success status as sender)
    const totalSpent = await Transaction.aggregate([
      { $match: { sender: userObjectId, status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Total earned (Success status as receiver)
    const totalEarned = await Transaction.aggregate([
      { $match: { receiver: userObjectId, status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      escrowAsSender: {
        total: senderEscrow[0]?.total || 0,
        count: senderEscrow[0]?.count || 0,
      },
      escrowAsReceiver: {
        total: receiverEscrow[0]?.total || 0,
        count: receiverEscrow[0]?.count || 0,
      },
      totalSpent: totalSpent[0]?.total || 0,
      totalEarned: totalEarned[0]?.total || 0,
    });
  } catch (error: any) {
    console.error("   [ERROR] GET TRANSACTION SUMMARY:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
