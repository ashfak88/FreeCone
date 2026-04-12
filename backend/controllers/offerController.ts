import { Request, Response } from "express";
import Offer from "../models/Offer";
import Notification from "../models/Notification";
import Transaction from "../models/Transaction";
import { emitToUser } from "../config/socket";
import { sendSystemMessage } from "../utils/messageUtils";


// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Client only)
export const createOffer = async (req: Request, res: Response): Promise<any> => {
  console.log("   >>> [DEBUG] CREATE OFFER HIT! <<<");
  try {
    const { freelancerId, talentId, jobId, jobTitle, description, budget } = req.body;
    const clientId = (req as any).user?.id || (req as any).user?._id;

    if (!clientId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const recipientId = freelancerId || talentId;

    if (!recipientId || !jobTitle || !description || !budget) {
      return res.status(400).json({ message: "Please provide all required fields (talentId/freelancerId, jobTitle, description, budget)" });
    }

    const offer = new Offer({
      client: clientId,
      freelancer: recipientId,
      job: jobId,
      jobTitle,
      description,
      budget,
    });

    const savedOffer = await offer.save();

    // Create a notification for the freelancer (Received)
    const freelancerNotification = new Notification({
      recipient: recipientId,
      sender: clientId,
      type: "offer",
      relatedId: savedOffer._id,
      title: "New Job Offer",
      message: `${(req as any).user?.name || 'A client'} sent you an offer for '${jobTitle}' with a budget of $${budget}.`,
    });
    await freelancerNotification.save();

    // Emit real-time notification to freelancer
    emitToUser(recipientId, "newNotification", freelancerNotification);
    emitToUser(recipientId, "offerUpdate", savedOffer);

    // Create a notification for the client (Sent)
    const clientNotification = new Notification({
      recipient: clientId,
      sender: clientId,
      type: "offer",
      relatedId: savedOffer._id,
      title: "Offer Sent",
      message: `You sent an offer for '${jobTitle}' to the talent.`,
    });
    await clientNotification.save();
    emitToUser(clientId, "offerUpdate", savedOffer);

    res.status(201).json(savedOffer);
  } catch (error: any) {
    console.error("   [ERROR] CREATE OFFER:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get offers for the logged in user (freelancer or client)
// @route   GET /api/offers
// @access  Private
export const getMyOffers = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Find offers where user is either client or freelancer
    const offers = await Offer.find({
      $or: [{ client: userId }, { freelancer: userId }],
    })
      .populate("client", "name email imageUrl")
      .populate("freelancer", "name email imageUrl role")
      .sort({ createdAt: -1 });

    res.status(200).json(offers);
  } catch (error: any) {
    console.error("   [ERROR] GET OFFERS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get a single offer by ID
// @route   GET /api/offers/:id
// @access  Private
export const getOfferById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const offer = await Offer.findById(id)
      .populate("client", "name email imageUrl")
      .populate("freelancer", "name email imageUrl");

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Safely get client & freelancer IDs regardless of populate state
    const clientId = (offer.client as any)?._id?.toString() || offer.client?.toString();
    const freelancerId = (offer.freelancer as any)?._id?.toString() || offer.freelancer?.toString();

    // Check if user is participant
    if (clientId !== userId.toString() && freelancerId !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to view this offer" });
    }

    res.status(200).json(offer);
  } catch (error: any) {
    console.error("   [ERROR] GET OFFER BY ID:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update offer status (Accept/Reject)
// @route   PUT /api/offers/:id/status
// @access  Private
export const updateOfferStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const status = (req.body.status || "").toLowerCase();
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'accepted' or 'rejected'." });
    }

    const offer = await Offer.findById(id).populate("client", "name") as any;
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check if current user is the freelancer receiving the offer (recipient)
    if (offer.freelancer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this offer." });
    }

    offer.status = status;
    await offer.save();

    // Send automated chat message if accepted
    if (status === 'accepted') {
      const clientId = offer.client._id || offer.client;
      // 1. Confirmation message
      const messageContent = `I have accepted your offer for '${offer.jobTitle}'. Let's get started! 🤝`;
      await sendSystemMessage(userId, clientId, messageContent);

      // 2. Payment Request message
      const paymentMsg = `Offer accepted! Please pay the advance of $${offer.budget} to start the project.`;
      await sendSystemMessage(userId, clientId, paymentMsg, 'payment', {
        offerId: offer._id,
        amount: offer.budget,
        jobTitle: offer.jobTitle,
        type: 'advance_payment'
      });
    }

    // 1. Update the Client's notification (Sent history)
    const clientNotification = await Notification.findOne({
      recipient: offer.client._id,
      relatedId: offer._id,
      type: "offer"
    });

    if (clientNotification) {
      clientNotification.title = `Offer ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      clientNotification.message = `Your offer for '${offer.jobTitle}' has been ${status}.`;
      clientNotification.isRead = false;
      await clientNotification.save();

      // Emit update to client
      emitToUser(offer.client._id, "notificationUpdate", clientNotification);
      emitToUser(offer.client._id, "offerUpdate", offer);
    }

    // 1.5 Create a NEW Payment notification if accepted
    if (status === 'accepted') {
      const paymentNotification = new Notification({
        recipient: offer.client._id,
        sender: userId,
        type: "payment",
        relatedId: offer._id,
        title: "Payment Required",
        message: `Your offer for '${offer.jobTitle}' was accepted! Please pay the advance of $${offer.budget} now.`,
      });
      await paymentNotification.save();
      emitToUser(offer.client._id, "newNotification", paymentNotification);
    }

    // 2. Update the Freelancer's notification (Received history)
    const freelancerNotification = await Notification.findOne({
      recipient: userId,
      relatedId: offer._id,
      type: "offer"
    });

    if (freelancerNotification) {
      freelancerNotification.title = `Offer ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      freelancerNotification.message = `You ${status} the offer for '${offer.jobTitle}'.`;
      await freelancerNotification.save();
      emitToUser(userId, "offerUpdate", offer);
    }

    res.status(200).json({ message: `Offer ${status} successfully`, offer });
  } catch (error: any) {
    console.error("   [ERROR] UPDATE OFFER STATUS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Mark an offer as paid
// @route   PUT /api/offers/:id/pay
// @access  Private (Client only)
export const payOffer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const offer = await Offer.findById(id).populate("freelancer", "name") as any;
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Only the client who created the offer can pay
    if (offer.client.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the client can mark this as paid." });
    }

    if (offer.isPaid) {
      return res.status(400).json({ message: "This offer has already been paid." });
    }

    offer.isPaid = true;
    offer.projectStatus = "active";
    offer.updates.push({
      text: "Project started! Funds are now in escrow.",
      type: "status_change",
    });
    await offer.save();

    // Increment projects started count for both parties
    const User = (await import("../models/User")).default;
    await User.findByIdAndUpdate(userId, { $inc: { totalProjectsStarted: 1 } });
    await User.findByIdAndUpdate(offer.freelancer._id || offer.freelancer, { $inc: { totalProjectsStarted: 1 } });

    // Update associated job or create one for standalone offers
    const Job = (await import("../models/Job")).default;
    if (offer.job) {
      await Job.findByIdAndUpdate(offer.job, {
        freelancer: offer.freelancer._id || offer.freelancer,
        status: "active"
      });
    } else {
      // Create a NEW Job document so it appears in Admin/Client projects
      const newJob = new Job({
        user: userId,
        freelancer: offer.freelancer._id || offer.freelancer,
        title: offer.jobTitle,
        description: offer.description,
        budget: offer.budget,
        status: "active"
      });
      await newJob.save();
      // Link the offer to the new job
      offer.job = newJob._id;
      await offer.save();
    }

    // Create an Escrow transaction record
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const transaction = new Transaction({
      txnId,
      amount: offer.budget,
      currency: "USD",
      sender: userId,
      receiver: offer.freelancer._id,
      status: "Escrow",
      type: "Deposit",
      description: `Advance payment for '${offer.jobTitle}' — held in escrow`,
    });
    await transaction.save();

    // Notify the freelancer about the payment
    const paymentConfirmNotif = new Notification({
      recipient: offer.freelancer._id,
      sender: userId,
      type: "payment",
      relatedId: offer._id,
      title: "Payment Received",
      message: `You received a payment of $${offer.budget} for '${offer.jobTitle}'. Funds are now in escrow.`,
    });
    await paymentConfirmNotif.save();
    emitToUser(offer.freelancer._id, "newNotification", paymentConfirmNotif);

    // Emit escrow update to both parties
    emitToUser(userId, "escrowUpdate", { offerId: offer._id, amount: offer.budget });
    emitToUser(offer.freelancer._id, "escrowUpdate", { offerId: offer._id, amount: offer.budget });

    res.status(200).json({ message: "Payment successful", offer, transaction });
  } catch (error: any) {
    console.error("   [ERROR] PAY OFFER:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get escrow summary for the logged-in user
// @route   GET /api/offers/escrow-summary
// @access  Private
export const getEscrowSummary = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Total escrow held AS CLIENT (money sent, in escrow)
    const clientEscrow = await Transaction.aggregate([
      { $match: { sender: require("mongoose").Types.ObjectId.createFromHexString(userId.toString()), status: "Escrow" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    // Total escrow held AS FREELANCER (money to receive, in escrow)
    const freelancerEscrow = await Transaction.aggregate([
      { $match: { receiver: require("mongoose").Types.ObjectId.createFromHexString(userId.toString()), status: "Escrow" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);

    // Total paid out (success)
    const totalPaid = await Transaction.aggregate([
      { $match: { sender: require("mongoose").Types.ObjectId.createFromHexString(userId.toString()), status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Total earned (success, as receiver)
    const totalEarned = await Transaction.aggregate([
      { $match: { receiver: require("mongoose").Types.ObjectId.createFromHexString(userId.toString()), status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.status(200).json({
      escrowAsClient: {
        total: clientEscrow[0]?.total || 0,
        count: clientEscrow[0]?.count || 0,
      },
      escrowAsFreelancer: {
        total: freelancerEscrow[0]?.total || 0,
        count: freelancerEscrow[0]?.count || 0,
      },
      totalSpent: totalPaid[0]?.total || 0,
      totalEarned: totalEarned[0]?.total || 0,
    });
  } catch (error: any) {
    console.error("   [ERROR] GET ESCROW SUMMARY:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add update/milestone to an offer/project
// @route   POST /api/offers/:id/updates
// @access  Private
export const addOfferUpdate = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { text, type } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Check if user is participant
    if (offer.client.toString() !== userId.toString() && offer.freelancer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    offer.updates.push({ text, type: type || "general" });
    await offer.save();

    res.status(200).json(offer);
  } catch (error: any) {
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Complete an offer/project
// @route   PUT /api/offers/:id/complete
// @access  Private
export const completeOffer = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    if (offer.client.toString() !== userId.toString() && offer.freelancer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const isFreelancer = userId.toString() === offer.freelancer.toString();

    if (isFreelancer) {
      // Freelancer requests review
      offer.projectStatus = "review";
      offer.updates.push({
        text: "Freelancer requested project completion - Waiting for client approval.",
        type: "status_change",
      });

      // Notify Client
      const notif = await Notification.create({
        recipient: offer.client,
        sender: offer.freelancer,
        type: "completion_request",
        relatedId: offer._id,
        title: "Completion Requested",
        message: `Freelancer has requested completion for "${offer.jobTitle}". Please review and approve.`,
      });
      emitToUser(offer.client.toString(), "newNotification", notif);

    } else {
      // Client accepts completion
      offer.projectStatus = "completed";
      offer.updates.push({
        text: "Project completion approved by client!",
        type: "status_change",
      });

      // Release Escrow -> Success
      const Transaction = (await import("../models/Transaction")).default;
      const transaction = await Transaction.findOneAndUpdate(
        { 
          sender: offer.client, 
          receiver: offer.freelancer, 
          status: "Escrow" 
        }, 
        { status: "Success", type: "Payout", description: `Released funds for completed project: ${offer.jobTitle}` },
        { sort: { createdAt: -1 } }
      );

      // Update Freelancer stats
      const User = (await import("../models/User")).default;
      const freelancer = await User.findById(offer.freelancer);
      if (freelancer) {
        freelancer.completedProjects = (freelancer.completedProjects || 0) + 1;
        const totalStarted = freelancer.totalProjectsStarted || 1;
        freelancer.successRate = Math.min(100, Math.round((freelancer.completedProjects / totalStarted) * 100));
        await freelancer.save();
      }

      // Update Client stats (optional but consistent)
      const client = await User.findById(offer.client);
      if (client) {
        client.completedProjects = (client.completedProjects || 0) + 1;
        const totalStarted = client.totalProjectsStarted || 1;
        client.successRate = Math.min(100, Math.round((client.completedProjects / totalStarted) * 100));
        await client.save();
      }

      // Also update associated Job if exists
      if (offer.job) {
        const Job = (await import("../models/Job")).default;
        await Job.findByIdAndUpdate(offer.job, { status: "completed" });
      }

      // Notify Freelancer
      const notif = await Notification.create({
        recipient: offer.freelancer,
        sender: offer.client,
        type: "other",
        relatedId: offer._id,
        title: "Project Completed",
        message: `Client approved the completion of "${offer.jobTitle}". Funds are now released.`,
      });
      emitToUser(offer.freelancer.toString(), "newNotification", notif);
      emitToUser(offer.freelancer.toString(), "escrowUpdate", { offerId: offer._id });
      emitToUser(offer.client.toString(), "escrowUpdate", { offerId: offer._id });
    }

    await offer.save();
    res.status(200).json(offer);
  } catch (error: any) {
    console.error("   [ERROR] COMPLETE PROJECT:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reject project completion review
// @route   PUT /api/offers/:id/reject-completion
// @access  Private
export const rejectCompletion = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { reason = "No specific reason provided." } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Only client can reject completion
    if (offer.client.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    offer.projectStatus = "active";
    offer.rejectionReason = reason;
    offer.updates.push({
      text: `Client rejected the completion request. Reason: ${reason}`,
      type: "status_change",
    });

    // Notify Freelancer
    const notif = await Notification.create({
      recipient: offer.freelancer,
      sender: offer.client,
      type: "other", // Using 'other' or a custom type if desired
      relatedId: offer._id,
      title: "Revision Required",
      message: `Project "${offer.jobTitle}" needs revision. Reason: ${reason}`,
    });

    // Use standard event name 'newNotification'
    emitToUser(offer.freelancer.toString(), "newNotification", notif);
    
    // Internal event for project page sync
    emitToUser(offer.freelancer.toString(), "projectUpdate", { 
      offerId: offer._id, 
      status: 'active', 
      reason 
    });

    await offer.save();
    res.status(200).json(offer);
  } catch (error: any) {
    console.error("   [ERROR] REJECT COMPLETION:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update GitHub repository link for an offer
// @route   PUT /api/offers/:id/github
// @access  Private
export const updateOfferGithub = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { githubRepo } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    const offer = await Offer.findById(id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });

    // Check if user is participant
    if (offer.client.toString() !== userId.toString() && offer.freelancer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update the link
    offer.githubRepo = githubRepo;
    
    // Add a timeline update
    offer.updates.push({
      text: `GitHub repository link updated: ${githubRepo}`,
      type: "general",
    });

    await offer.save();

    res.status(200).json(offer);
  } catch (error: any) {
    console.error("   [ERROR] UPDATE GITHUB REPO:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
