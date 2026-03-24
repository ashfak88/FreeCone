import { Request, Response } from "express";
import Job from "../models/Job";
import Proposal from "../models/Proposal";
import Notification from "../models/Notification";
import { emitToUser } from "../config/socket";


export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
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
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST a new job
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
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error while creating job" });
  }
};

// APPLY for a job
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

    // Create the proposal
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

    // Create a notification for the client (job poster) - Received (only if different user)
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

      // Emit real-time notification to client
      emitToUser(job.user.toString(), "newNotification", clientNotification);
    }

    // Create a notification for the talent (sender) - Sent
    const talentNotification = new Notification({
      recipient: talentId,
      sender: talentId,
      type: "proposal",
      relatedId: savedProposal._id,
      title: "Proposal Sent",
      message: `You sent a proposal for '${job.title}' with a rate of $${proposedRate}.`,
    });
    await talentNotification.save();

    res.status(201).json({ message: "Application submitted successfully", proposal: savedProposal });
  } catch (error) {
    console.error("Error applying for job:", error);
    res.status(500).json({ message: "Server error while applying for job" });
  }
};

// GET jobs posted by the logged-in user
export const getMyJobs = async (req: any, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching my jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET proposals sent by the logged-in user
export const getMyProposals = async (req: any, res: Response): Promise<void> => {
  try {
    const proposals = await Proposal.find({ talent: req.user._id })
      .populate("job")
      .sort({ createdAt: -1 });
    res.status(200).json(proposals);
  } catch (error) {
    console.error("Error fetching my proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET received proposals for jobs posted by the logged-in user
export const getReceivedProposals = async (req: any, res: Response): Promise<void> => {
  try {
    // 1. Find all jobs posted by this user
    const myJobs = await Job.find({ user: req.user._id });
    const myJobIds = myJobs.map(job => job._id);

    // 2. Find all proposals for these jobs
    const proposals = await Proposal.find({ job: { $in: myJobIds } })
      .populate("job")
      .populate("talent", "name email imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(proposals);
  } catch (error) {
    console.error("Error fetching received proposals:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE proposal status (Accept/Reject)
export const updateProposalStatus = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
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

    // Check if the current user is the owner of the job
    const job = proposal.job as any;
    if (job.user.toString() !== clientId.toString()) {
      res.status(403).json({ message: "You are not authorized to update this proposal." });
      return;
    }

    proposal.status = status;
    await proposal.save();

    // 1. Update the freelancer's notification (Sent history)
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

      // Emit update to talent
      emitToUser(proposal.talent.toString(), "notificationUpdate", talentNotification);
    }

    // 2. Update the client's notification (Received history)
    const clientNotification = await Notification.findOne({
      recipient: clientId,
      relatedId: proposal._id,
      type: "proposal"
    });

    if (clientNotification) {
      clientNotification.title = `Proposal ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      clientNotification.message = `You ${status} the proposal for '${job.title}'.`;
      await clientNotification.save();

      // Emit update to client
      emitToUser(clientId.toString(), "notificationUpdate", clientNotification);
    }

    res.status(200).json({ message: `Proposal ${status} successfully`, proposal });
  } catch (error) {
    console.error("Error updating proposal status:", error);
    res.status(500).json({ message: "Server error while updating proposal status" });
  }
};

// MARK proposal as viewed
export const markProposalAsViewed = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clientId = req.user._id;

    const proposal = await Proposal.findById(id).populate("job");
    if (!proposal) {
      res.status(404).json({ message: "Proposal not found" });
      return;
    }

    // Check if the current user is the owner of the job
    const job = proposal.job as any;
    if (job.user.toString() !== clientId.toString()) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Only update to 'viewed' if it's currently 'pending'
    if (proposal.status === 'pending') {
      proposal.status = 'viewed';
      await proposal.save();
    }

    res.status(200).json({ message: "Proposal marked as viewed", proposal });
  } catch (error) {
    console.error("Error marking proposal as viewed:", error);
    res.status(500).json({ message: "Server error" });
  }
};
