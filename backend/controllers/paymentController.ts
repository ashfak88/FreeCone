import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Offer from "../models/Offer";
import Transaction from "../models/Transaction";
import Notification from "../models/Notification";
import { emitToUser } from "../config/socket";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private
export const createOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { offerId, amount, type } = req.body; // amount is in USD
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!offerId || !amount) {
      return res.status(400).json({ message: "Offer ID and amount are required" });
    }

    // Convert USD to INR Paise (approx conversion for testing)
    // 1 USD = 83 INR = 8300 Paise
    const amountInPaise = Math.round(amount * 83 * 100);

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${offerId.substring(0, 10)}`,
      notes: {
        offerId,
        userId,
        type: type || "advance_payment",
      },
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("   [ERROR] CREATE RAZORPAY ORDER:", error.message);
    res.status(500).json({ message: "Failed to create payment order" });
  }
};

// @desc    Verify Razorpay Payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      offerId,
    } = req.body;

    const userId = (req as any).user?.id || (req as any).user?._id;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Payment verified! Now update the Offer and create Transactions
    const offer = await Offer.findById(offerId).populate("freelancer", "name") as any;
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    if (offer.isPaid) {
      return res.status(200).json({ success: true, message: "Already paid" });
    }

    // Business Logic - same as payOffer in offerController
    offer.isPaid = true;
    offer.projectStatus = "active";
    offer.updates.push({
      text: "Project started! Payment verified and funds held in escrow.",
      type: "status_change",
    });
    await offer.save();

    // Increment stats
    const User = (await import("../models/User")).default;
    await User.findByIdAndUpdate(userId, { $inc: { totalProjectsStarted: 1 } });
    await User.findByIdAndUpdate(offer.freelancer._id || offer.freelancer, { $inc: { totalProjectsStarted: 1 } });

    // Handle Job creation/update
    const Job = (await import("../models/Job")).default;
    if (offer.job) {
      await Job.findByIdAndUpdate(offer.job, {
        freelancer: offer.freelancer._id || offer.freelancer,
        status: "active"
      });
    } else {
      const newJob = new Job({
        user: userId,
        freelancer: offer.freelancer._id || offer.freelancer,
        title: offer.jobTitle,
        description: offer.description,
        budget: offer.budget,
        status: "active"
      });
      await newJob.save();
      offer.job = newJob._id;
      await offer.save();
    }

    // Create Transaction Record
    const transaction = new Transaction({
      txnId: razorpay_payment_id,
      amount: offer.budget,
      currency: "USD", // We track internally in USD
      sender: userId,
      receiver: offer.freelancer._id,
      status: "Escrow",
      type: "Deposit",
      description: `Razorpay Payment (${razorpay_payment_id}) for '${offer.jobTitle}'`,
      job: offer.job
    });
    await transaction.save();

    // Notifications
    const paymentConfirmNotif = new Notification({
      recipient: offer.freelancer._id,
      sender: userId,
      type: "payment",
      relatedId: offer._id,
      title: "Payment Received",
      message: `Payment of $${offer.budget} received for '${offer.jobTitle}'. Project is now active!`,
    });
    await paymentConfirmNotif.save();
    emitToUser(offer.freelancer._id, "newNotification", paymentConfirmNotif);

    // Emit updates
    emitToUser(userId, "escrowUpdate", { offerId: offer._id, amount: offer.budget });
    emitToUser(offer.freelancer._id, "escrowUpdate", { offerId: offer._id, amount: offer.budget });

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      transactionId: transaction._id
    });

  } catch (error: any) {
    console.error("   [ERROR] VERIFY RAZORPAY PAYMENT:", error.message);
    res.status(500).json({ message: "Verification failed" });
  }
};
