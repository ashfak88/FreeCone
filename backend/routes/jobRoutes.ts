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
  markProposalAsViewed
} from "../controllers/jobController";
import { protect } from "../middleware/auth";

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

// GET a single job by ID
router.get("/:id", getJobById);

// POST a new job
router.post("/", protect, createJob);

// POST apply for a job
router.post("/:id/apply", protect, applyForJob);

export default router;
