import express from "express";
import { getJobs, createJob } from "../controllers/jobController";

const router = express.Router();

// GET all jobs
router.get("/", getJobs);

// POST a new job
router.post("/", createJob);

export default router;
