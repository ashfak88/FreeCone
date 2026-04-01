import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";

// @desc    Get all users (displaying as freelancers)
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (req: Request, res: Response): Promise<any> => {
  try {
    const search = req.query.search?.toString().trim() || "";
    const rateRange = req.query.rateRange?.toString().trim() || "";
    const rating = req.query.rating?.toString().trim() || "";

    console.log(`[DEBUG] Received Params - search: "${search}", rateRange: "${rateRange}", rating: "${rating}"`);

    let query: any = { role: { $in: ["talent", "user"] } };

    // Search filter
    if (search !== "") {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { bio: { $regex: search, $options: "i" } },
        { skills: { $regex: search, $options: "i" } },
      ];
    }

    // Rate filter
    if (rateRange !== "") {
      if (rateRange === "0-50") {
        query.rate = { $gt: 0, $lte: 50 };
      } else if (rateRange === "50-100") {
        query.rate = { $gt: 50, $lte: 100 };
      } else if (rateRange === "above-100" || rateRange === "100+") {
        query.rate = { $gt: 100 };
      }
    }

    // Rating filter
    if (rating !== "" && !isNaN(Number(rating))) {
      query.rating = { $gte: Number(rating) };
    }

    const freelancers = await User.find(query).select("-password").sort({ rating: -1 });
    console.log(`[DEBUG] Found ${freelancers.length} users matching filters.`);
    res.status(200).json(freelancers);
  } catch (error: any) {
    console.error("Error in getFreelancers:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    console.log("   [DEBUG] Attempting profile update for user:", userId);

    if (!userId) {
      console.log("   [DEBUG] Update failed: No User ID in request.");
      return res.status(401).json({ message: "Not authorized" });
    }

    // Capture fields from request body
    const updates: any = {};
    const allowedFields = ['name', 'title', 'bio', 'location', 'skills', 'rate', 'imageUrl', 'portfolio', 'socialLinks'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Mark profile as complete if they've provided basic info
    if (updates.name || updates.title || (updates.skills && updates.skills.length > 0)) {
      updates.isProfileComplete = true;
    }

    console.log("   [DEBUG] Updates being applied:", Object.keys(updates));

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      console.log("   [DEBUG] Update failed: User not found in database for ID:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("   [DEBUG] Profile updated successfully for:", updatedUser.email);
    res.status(200).json(updatedUser);
  } catch (error: any) {
    console.error("   [DEBUG] Profile Update Error:", error);
    res.status(500).json({
      message: "Server Error during profile update",
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("   [DEBUG] Get Profile Error:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all users for testing
// @route   GET /api/test-users
// @access  Public (Testing only)
export const getTestUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await User.find({}).select("-password");
    res.json({ count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
