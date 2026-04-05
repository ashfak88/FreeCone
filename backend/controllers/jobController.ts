import { Request, Response } from "express";
import Job from "../models/Job";
import Proposal from "../models/Proposal";
import Notification from "../models/Notification";
import { emitToUser } from "../config/socket";
import { sendSystemMessage } from "../utils/messageUtils";


export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
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
      resume,
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
      .populate("talent", "name email imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(proposals);
  } catch (error: any) {
    console.error("Error fetching received proposals:", error);
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

    // Send automated chat message if accepted
    if (status === 'accepted') {
      const job = proposal.job as any;
      const freelancerId = proposal.talent._id || proposal.talent;
      const messageContent = `Your proposal for '${job.title}' has been accepted! 🚀`;
      await sendSystemMessage(clientId, freelancerId, messageContent);
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
