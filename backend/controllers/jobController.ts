import { Request, Response } from "express";
import Job from "../models/Job";
import User from "../models/User";
import Proposal from "../models/Proposal";
import Notification from "../models/Notification";
import Transaction from "../models/Transaction";
import Offer from "../models/Offer";
import Message from "../models/Message";
import { emitToUser } from "../config/socket";
import { sendSystemMessage } from "../utils/messageUtils";


export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ status: "pending" }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.status(200).json(job);
  } catch (error: any) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createJob = async (req: any, res: Response): Promise<void> => {
  try {
    const { title, description, budget, category, timeline, skills, client, user } = req.body;

    if (!title || !description || !budget) {
      res.status(400).json({ message: "Please provide all required fields." });
      return;
    }

    const newJob = new Job({
      user: req.user?._id || user,
      title,
      description,
      budget,
      category,
      timeline,
      skills,
      client,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error: any) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

export const applyForJob = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { coverLetter, proposedRate, timeline, figmaLink } = req.body;
    const talentId = req.user?._id;
    const resume = req.file?.path;

    if (!talentId) {
      res.status(401).json({ message: "You must be logged in to apply." });
      return;
    }

    const userData = await User.findById(talentId);
    const finalResume = resume || userData?.resume;

    const job = await Job.findById(id);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    const newProposal = new Proposal({
      job: id,
      talent: talentId,
      coverLetter,
      proposedRate,
      timeline,
      figmaLink,
      resume: finalResume,
    });
    const savedProposal = await newProposal.save();

    if (job.user && job.user.toString() !== talentId.toString()) {
      const clientNotification = new Notification({
        recipient: job.user,
        sender: talentId,
        type: "proposal",
        relatedId: savedProposal._id,
        title: "New Job Proposal",
        message: `A new proposal has been received for '${job.title}' with a rate of $${proposedRate}.`,
      });
      await clientNotification.save();

      emitToUser(job.user.toString(), "newNotification", clientNotification);
      emitToUser(job.user.toString(), "proposalUpdate", savedProposal);
    }

    const talentNotification = new Notification({
      recipient: talentId,
      sender: talentId,
      type: "proposal",
      relatedId: savedProposal._id,
      title: "Proposal Sent",
      message: `You sent a proposal for '${job.title}' with a rate of $${proposedRate}.`,
    });
    await talentNotification.save();
    emitToUser(talentId.toString(), "proposalUpdate", savedProposal);

    res.status(201).json({ message: "Application submitted successfully", proposal: savedProposal });
  } catch (error: any) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error while applying for job" });
  }
};

export const getMyJobs = async (req: any, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error: any) {
    console.error("Error fetching my jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyProposals = async (req: any, res: Response): Promise<void> => {
  try {
    const proposals = await Proposal.find({ talent: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });
    res.status(200).json(proposals);
  } catch (error: any) {
    console.error("Error fetching my proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getReceivedProposals = async (req: any, res: Response): Promise<void> => {
  try {
    const myJobs = await Job.find({ user: req.user._id });
    const myJobIds = myJobs.map(job => job._id);

    const proposals = await Proposal.find({ job: { $in: myJobIds } })
      .populate("job")
      .populate("talent", "name email imageUrl title skills")
      .sort({ createdAt: -1 });

    res.status(200).json(proposals);
  } catch (error: any) {
    console.error("Error fetching received proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a single proposal by ID
// @route   GET /api/jobs/proposals/:id
// @access  Private
export const getProposalById = async (req: any, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = req.user?._id;

    const proposal = await Proposal.findById(id)
      .populate("job")
      .populate("talent", "name email imageUrl title skills")
      .populate({
        path: "job",
        populate: { path: "user", select: "name email imageUrl" }
      });

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    const job = proposal.job as any;
    // Check if user is participant (client or talent)
    if (job.user._id.toString() !== userId.toString() && proposal.talent._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(proposal);
  } catch (error: any) {
    console.error("Error fetching proposal by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProposalStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const status = (req.body.status || "").toLowerCase();
    const clientId = req.user._id;

    if (!['accepted', 'rejected'].includes(status)) {
      res.status(400).json({ message: "Invalid status. Use 'accepted' or 'rejected'." });
      return;
    }

    const proposal = await Proposal.findById(id).populate("job");
    if (!proposal) {
      res.status(404).json({ message: "Proposal not found" });
      return;
    }

    const job = proposal.job as any;
    if (job.user.toString() !== clientId.toString()) {
      res.status(403).json({ message: "You are not authorized to update this proposal." });
      return;
    }

    proposal.status = status;
    await proposal.save();

    // Send automated chat message ONLY if accepted
    if (status === 'accepted') {
      const freelancerId = (proposal.talent._id || proposal.talent).toString();
      const jobTitle = job.title;

      // Ensure an Offer document is created for this project to show up in the projects dashboard
      // Just check if one already exists first
      const existingOffer = await Offer.findOne({ job: job._id, freelancer: freelancerId });
      if (!existingOffer) {
        const newOffer = new Offer({
          client: clientId,
          freelancer: freelancerId,
          job: job._id,
          jobTitle: jobTitle,
          description: proposal.coverLetter || job.description,
          budget: proposal.proposedRate,
          status: 'accepted'
        });
        await newOffer.save();
      } else {
        existingOffer.status = 'accepted';
        await existingOffer.save();
      }

      // 1. Handshake / Confirmation message to freelancer (This is the ONLY one needed for acceptance)
      const confirmationMsg = `The client has accepted your proposal for '${jobTitle}'. Please confirm if you are ready to start.`;
      await sendSystemMessage(clientId, freelancerId, confirmationMsg, 'confirmation', {
        proposalId: proposal._id,
        jobTitle: jobTitle,
        amount: proposal.proposedRate,
        freelancerId: freelancerId
      });
    }

    const talentNotification = await Notification.findOne({
      recipient: proposal.talent,
      relatedId: proposal._id,
      type: "proposal"
    });

    if (talentNotification) {
      talentNotification.title = `Proposal ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      talentNotification.message = `Your proposal for '${job.title}' has been ${status}.`;
      talentNotification.isRead = false;
      await talentNotification.save();

      emitToUser(proposal.talent.toString(), "notificationUpdate", talentNotification);
      emitToUser(proposal.talent.toString(), "proposalUpdate", proposal);
    }

    const clientNotification = await Notification.findOne({
      recipient: clientId,
      relatedId: proposal._id,
      type: "proposal"
    });

    if (clientNotification) {
      clientNotification.title = `Proposal ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      clientNotification.message = `You ${status} the proposal for '${job.title}'.`;
      await clientNotification.save();

      emitToUser(clientId.toString(), "notificationUpdate", clientNotification);
      emitToUser(clientId.toString(), "proposalUpdate", proposal);
    }

    res.status(200).json({ message: `Proposal ${status} successfully`, proposal });
  } catch (error: any) {
    console.error("Error updating proposal status:", error);
    res.status(500).json({ message: "Server error while updating proposal status" });
  }
};

export const confirmProposalHandshake = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, messageId } = req.body; // 'confirm' or 'reject'
    const freelancerId = req.user._id;

    const proposal = await Proposal.findById(id).populate("job");
    if (!proposal) {
      res.status(404).json({ message: "Proposal not found" });
      return;
    }

    const job = proposal.job as any;
    if (proposal.talent.toString() !== freelancerId.toString()) {
      res.status(403).json({ message: "Only the freelancer can confirm this handshake." });
      return;
    }

    if (action === 'confirm') {
      const clientId = job.user._id || job.user;

      // 1. Send Payment card to client
      const paymentMsg = `I'm ready to start! Please proceed with the payment of $${proposal.proposedRate}.`;
      await sendSystemMessage(freelancerId, clientId, paymentMsg, 'payment', {
        proposalId: proposal._id,
        amount: proposal.proposedRate,
        jobTitle: job.title,
        type: 'proposal'
      });

      // 2. Create Payment notification for client
      const paymentNotification = new Notification({
        recipient: clientId,
        sender: freelancerId,
        type: "payment",
        relatedId: proposal._id,
        title: "Payment Required (Proposal)",
        message: `Freelancer confirmed the project! Please pay the advance of $${proposal.proposedRate} now.`,
      });
      await paymentNotification.save();
      emitToUser(clientId.toString(), "newNotification", paymentNotification);

      // 3. Update the chat message metadata to persist the state
      if (messageId) {
        try {
          const msgToUpdate = await Message.findById(messageId);
          if (msgToUpdate) {
            if (!msgToUpdate.metadata) msgToUpdate.metadata = {};
            msgToUpdate.metadata.status = "confirmed";
            msgToUpdate.markModified("metadata");
            await msgToUpdate.save();

            const populatedMsg = await Message.findById(messageId).populate("sender", "name imageUrl");
            if (populatedMsg) {
              emitToUser(freelancerId.toString(), "messageUpdate", populatedMsg);
              emitToUser(clientId.toString(), "messageUpdate", populatedMsg);
            }
          }
        } catch (err) {
          console.error("Failed to update message metadata:", err);
        }
      }

      res.status(200).json({ message: "Handshake confirmed. Payment requested from client." });
    } else {
      proposal.status = 'rejected';
      await proposal.save();

      // Notify client about rejection if needed
      const clientId = job.user._id || job.user;
      const rejectMsg = `I'm sorry, I cannot proceed with this project at this time.`;
      await sendSystemMessage(freelancerId, clientId, rejectMsg);

      res.status(200).json({ message: "Handshake rejected." });

      // Update the chat message metadata to persist the state
      if (messageId) {
        try {
          const msgToUpdate = await Message.findById(messageId);
          if (msgToUpdate) {
            if (!msgToUpdate.metadata) msgToUpdate.metadata = {};
            msgToUpdate.metadata.status = "rejected";
            msgToUpdate.markModified("metadata");
            await msgToUpdate.save();

            const populatedMsg = await Message.findById(messageId).populate("sender", "name imageUrl");
            if (populatedMsg) {
              emitToUser(freelancerId.toString(), "messageUpdate", populatedMsg);
              emitToUser(clientId.toString(), "messageUpdate", populatedMsg);
            }
          }
        } catch (err) {
          console.error("Failed to update message metadata:", err);
        }
      }
    }
  } catch (error: any) {
    console.error("Error in confirmProposalHandshake:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const payProposal = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;

    const proposal = await Proposal.findById(id).populate("talent", "name") as any;
    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" });
    }

    // Since Proposal.job is not fully populated, we might need more info or just find job
    const job = await Job.findById(proposal.job);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Only the client (job owner) can pay
    if (job.user.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the client can mark this as paid." });
    }

    if (proposal.isPaid) {
      return res.status(400).json({ message: "This proposal has already been paid." });
    }

    proposal.isPaid = true;
    await proposal.save();

    // Link the freelancer to the job and set it to active
    if (job) {
      job.freelancer = proposal.talent;
      job.status = "active";
      await job.save();
    }

    // ACTIVATE THE ASSOCIATED OFFER/PROJECT
    const associatedOffer = await Offer.findOne({ job: job._id, freelancer: proposal.talent._id || proposal.talent });
    if (associatedOffer) {
      associatedOffer.isPaid = true;
      associatedOffer.projectStatus = "active";
      associatedOffer.updates.push({
        text: "Project started! Funds are now in escrow.",
        type: "status_change",
      });
      await associatedOffer.save();
    }

    // Create an Escrow transaction record
    const txnId = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const transaction = new Transaction({
      txnId,
      amount: proposal.proposedRate,
      currency: "USD",
      sender: userId,
      receiver: proposal.talent._id,
      status: "Escrow",
      type: "Deposit",
      description: `Advance payment for '${job.title}' (Proposal #${proposal._id}) — held in escrow`,
    });
    await transaction.save();

    // Notify the freelancer about the payment
    const paymentConfirmNotif = new Notification({
      recipient: proposal.talent._id,
      sender: userId,
      type: "payment",
      relatedId: proposal._id,
      title: "Payment Received",
      message: `You received a payment of $${proposal.proposedRate} for '${job.title}'. Funds are now in escrow.`,
    });
    await paymentConfirmNotif.save();
    emitToUser(proposal.talent._id.toString(), "newNotification", paymentConfirmNotif);

    // Emit escrow update to both parties
    emitToUser(userId.toString(), "escrowUpdate", { proposalId: proposal._id, amount: proposal.proposedRate });
    emitToUser(proposal.talent._id.toString(), "escrowUpdate", { proposalId: proposal._id, amount: proposal.proposedRate });

    res.status(200).json({ message: "Payment successful", proposal, transaction });
  } catch (error: any) {
    console.error("   [ERROR] PAY PROPOSAL:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const markProposalAsViewed = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = req.user._id;

    const proposal = await Proposal.findById(id).populate("job");
    if (!proposal) {
      res.status(404).json({ message: "Proposal not found" });
      return;
    }

    const job = proposal.job as any;
    if (job.user.toString() !== clientId.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    if (proposal.status === 'pending') {
      proposal.status = 'viewed';
      await proposal.save();
    }

    res.status(200).json({ message: "Proposal marked as viewed", proposal });
  } catch (error: any) {
    console.error("Error marking proposal as viewed:", error);
    res.status(500).json({ message: "Server error" });
  }
};
