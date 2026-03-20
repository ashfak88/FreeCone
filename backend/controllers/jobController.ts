import { Request, Response } from "express";
import Job from "../models/Job";

// GET all jobs
export const getJobs = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST a new job
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
      res.status(400).json({ message: "Please provide all required fields." });
      return;
    }

    const newJob = new Job({
      title,
      description,
      budget,
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ message: "Server error while creating job" });
  }
};
