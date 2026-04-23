import { Request, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import Offer from "../models/Offer";
import Transaction from "../models/Transaction";
import SystemConfig from "../models/Config";
import Notification from "../models/Notification";
import { emitToUser } from "../config/socket";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

const EXCHANGE_RATE = 83.5;

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

    // 0. Fetch Dynamic Platform Commission
    const config = await SystemConfig.findOne({ key: "platformCommission" });
    const platformFeePercent = config ? config.value / 100 : 0.05;

    // 1. Calculate Platform Commission
    const platformFeeUSD = Math.round(amount * platformFeePercent * 100) / 100;
    const totalUSD = amount + platformFeeUSD;

    // 2. Convert Total USD to INR Paise
    // 1 USD = 83.5 INR = 8350 Paise
    const amountInPaise = Math.round(totalUSD * EXCHANGE_RATE * 100);

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
      platformFeeUSD,
      platformFeePercent: platformFeePercent * 100
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
      type: paymentType // "proposal" or "offer"/"advance_payment"
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

    // 1. Find the relevant document (Offer or Proposal)
    let paymentDoc: any = null;
    let freelancerId: any = null;
    let jobTitle: string = "";
    let amount: number = 0;
    let jobId: any = null;

    if (paymentType === "proposal") {
      const Proposal = (await import("../models/Proposal")).default;
      paymentDoc = await Proposal.findById(offerId).populate("talent", "name");
      if (!paymentDoc) return res.status(404).json({ message: "Proposal not found" });

      freelancerId = paymentDoc.talent._id || paymentDoc.talent;
      amount = paymentDoc.proposedRate;
      jobId = paymentDoc.job;

      const Job = (await import("../models/Job")).default;
      const job = await Job.findById(jobId);
      jobTitle = job?.title || "Project Payment";
    } else {
      paymentDoc = await Offer.findById(offerId).populate("freelancer", "name");
      if (!paymentDoc) return res.status(404).json({ message: "Offer not found" });

      freelancerId = paymentDoc.freelancer._id || paymentDoc.freelancer;
      amount = paymentDoc.budget;
      jobTitle = paymentDoc.jobTitle || "Project Payment";
      jobId = paymentDoc.job;
    }

    if (paymentDoc.isPaid) {
      return res.status(200).json({ success: true, message: "Already paid" });
    }

    // 2. Mark as Paid and Activate Project
    paymentDoc.isPaid = true;
    if (paymentType !== "proposal") {
      paymentDoc.projectStatus = "active";
      paymentDoc.updates.push({
        text: "Project started! Payment verified and funds held in escrow.",
        type: "status_change",
      });
    }
    await paymentDoc.save();

    // 3. Activate associated Job and increment user stats
    const User = (await import("../models/User")).default;
    const Job = (await import("../models/Job")).default;

    await User.findByIdAndUpdate(userId, { $inc: { totalProjectsStarted: 1 } });
    await User.findByIdAndUpdate(freelancerId, { $inc: { totalProjectsStarted: 1 } });

    if (jobId) {
      await Job.findByIdAndUpdate(jobId, {
        freelancer: freelancerId,
        status: "active"
      });
    }

    // 4. Activate associated Offer if this was a Proposal payment
    if (paymentType === "proposal") {
      const associatedOffer = await Offer.findOne({ job: jobId, freelancer: freelancerId });
      if (associatedOffer) {
        associatedOffer.isPaid = true;
        associatedOffer.projectStatus = "active";
        associatedOffer.updates.push({
          text: "Project started! Funds are now in escrow.",
          type: "status_change",
        });
        await associatedOffer.save();
      }
    }

    // 5. Create Transaction Record for Escrow
    const transaction = new Transaction({
      txnId: razorpay_payment_id,
      amount: amount,
      currency: "USD",
      sender: userId,
      receiver: freelancerId,
      status: "Escrow",
      type: "Deposit",
      description: `Razorpay Payment (${razorpay_payment_id}) for '${jobTitle}'`,
      job: jobId
    });
    await transaction.save();

    // 6. Create Transaction Record for Platform Commission
    const config = await SystemConfig.findOne({ key: "platformCommission" });
    const platformFeePercent = config ? config.value / 100 : 0.05;
    const commissionAmount = Math.round(amount * platformFeePercent * 100) / 100;

    const commissionTxn = new Transaction({
      txnId: `${razorpay_payment_id}_fee`,
      amount: commissionAmount,
      currency: "USD",
      sender: userId,
      receiver: userId,
      status: "Pending",
      type: "Commission",
      description: `Platform Commission for '${jobTitle}'`,
      job: jobId
    });
    await commissionTxn.save();

    // 7. Notifications
    const paymentConfirmNotif = new Notification({
      recipient: freelancerId,
      sender: userId,
      type: "payment",
      relatedId: paymentDoc._id,
      title: "Payment Received",
      message: `Payment of $${amount} received for '${jobTitle}'. Project is now active!`,
    });
    await paymentConfirmNotif.save();
    emitToUser(freelancerId.toString(), "newNotification", paymentConfirmNotif);

    // 8. Emit updates and update chat message specifically
    emitToUser(userId.toString(), "escrowUpdate", { offerId: paymentDoc._id, amount: amount });
    if (paymentType === "proposal") {
      emitToUser(userId.toString(), "proposalUpdate", paymentDoc);
      emitToUser(freelancerId.toString(), "proposalUpdate", paymentDoc);
    } else {
      emitToUser(userId.toString(), "offerUpdate", paymentDoc);
      emitToUser(freelancerId.toString(), "offerUpdate", paymentDoc);
    }

    // Sync Chat Card Status
    try {
      const Message = (await import("../models/Message")).default;
      const idToSearch = paymentDoc._id.toString();

      const relatedMessages = await Message.find({
        $or: [
          { "metadata.offerId": idToSearch },
          { "metadata.proposalId": idToSearch }
        ]
      });

      for (const msg of relatedMessages) {
        if (!msg.metadata) msg.metadata = {};
        msg.metadata.isPaid = true;
        msg.metadata.status = "paid";
        msg.markModified("metadata");
        await msg.save();

        const populatedMsg = await Message.findById(msg._id).populate("sender", "name imageUrl");
        emitToUser(userId.toString(), "messageUpdate", populatedMsg);
        emitToUser(freelancerId.toString(), "messageUpdate", populatedMsg);
      }
    } catch (msgErr) {
      console.error("   [ERROR] Failed to sync chat message status:", msgErr);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      transactionId: transaction._id,
      updatedDoc: paymentDoc
    });

  } catch (error: any) {
    console.error("   [ERROR] VERIFY RAZORPAY PAYMENT:", error.message);
    res.status(500).json({ message: "Verification failed" });
  }
};
