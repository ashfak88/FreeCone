import { Request, Response } from "express";
import User from "../models/User";

// @desc    Get all users (displaying as freelancers)
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (req: Request, res: Response): Promise<any> => {
  try {
    // Fetch all users, disregarding the specific "freelancer" role filter
    const freelancers = await User.find({}).select("-password");
    res.status(200).json(freelancers);
  } catch (error: any) {
    console.error(error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
