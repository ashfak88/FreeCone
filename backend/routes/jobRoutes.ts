import express from "express";
import { 
  getJobs, 
  createJob, 
  getJobById, 
  applyForJob,
  getMyJobs,
  getMyProposals,
  getReceivedProposals,
  updateProposalStatus,
  confirmProposalHandshake,
  payProposal,
  markProposalAsViewed,
  getProposalById
} from "../controllers/jobController";
import { protect } from "../middleware/auth";
import { uploadResume } from "../middleware/upload";

const router = express.Router();

// GET all jobs
router.get("/", getJobs);

// GET my jobs (posted by me)
router.get("/my-jobs", protect, getMyJobs);

// GET my proposals (sent by me)
router.get("/my-proposals", protect, getMyProposals);

// GET received proposals (for my jobs)
router.get("/received-proposals", protect, getReceivedProposals);

// PUT update proposal status (Accept/Reject)
router.put("/proposals/:id/status", protect, updateProposalStatus);

// PUT mark proposal as viewed
router.put("/proposals/:id/viewed", protect, markProposalAsViewed);

// GET a single proposal by ID
router.get("/proposals/:id", protect, getProposalById);

// POST confirm proposal handshake (Freelancer confirm readiness)
router.post("/proposals/:id/confirm", protect, confirmProposalHandshake);

// PUT pay for a proposal
router.put("/proposals/:id/pay", protect, payProposal);

// GET a single job by ID
router.get("/:id", getJobById);

// POST a new job
router.post("/", protect, createJob);

// POST apply for a job
router.post("/:id/apply", protect, uploadResume.single("resume"), applyForJob);

export default router;
