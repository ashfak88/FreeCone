import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User";
import Offer from "../models/Offer";
import Review from "../models/Review";

// @desc    Get all users (displaying as freelancers)
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (req: Request, res: Response): Promise<any> => {
  try {
    const search = req.query.search?.toString().trim() || "";
    const rateRange = req.query.rateRange?.toString().trim() || "";
    const rating = req.query.rating?.toString().trim() || "";

    console.log(`[DEBUG] Received Params - search: "${search}", rateRange: "${rateRange}", rating: "${rating}"`);

    // Find freelancers who are currently busy (active or review status)
    const busyOffers = await Offer.find({
      projectStatus: { $in: ["active", "review"] }
    }).distinct("freelancer");

    let query: any = {
      role: { $in: ["talent", "user"] },
      _id: { $nin: busyOffers }
    };

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
    const allowedFields = ['name', 'title', 'bio', 'location', 'skills', 'rate', 'imageUrl', 'portfolio', 'socialLinks', 'resume', 'age'];

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
// @desc    Get specific user profile by ID
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error: any) {
    console.error("   [ERROR] GET USER BY ID:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
// @desc    Submit a review for a freelancer
// @route   POST /api/users/review
// @access  Private (Client only)
export const submitReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { offerId, rating, comment } = req.body;
    const clientId = (req as any).user?.id || (req as any).user?._id;

    if (!offerId || !rating || !comment) {
      return res.status(400).json({ message: "Please provide offerId, rating, and comment" });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ message: "Project not found" });

    // 1. Verify only client can review
    if (offer.client.toString() !== clientId.toString()) {
      return res.status(403).json({ message: "Only the client can review this project" });
    }

    // 2. Verify project is completed
    if (offer.projectStatus !== 'completed') {
      return res.status(400).json({ message: "Project must be completed before reviewing" });
    }

    // 3. Verify not already reviewed
    if (offer.isReviewed) {
      return res.status(400).json({ message: "This project has already been reviewed" });
    }

    // 4. Create Review
    const review = new Review({
      offer: offerId,
      reviewer: clientId,
      reviewee: offer.freelancer,
      rating,
      comment,
    });
    await review.save();

    // 5. Update Freelancer Rating
    const freelancer = await User.findById(offer.freelancer);
    if (freelancer) {
      const currentRating = freelancer.rating || 0;
      const totalReviews = freelancer.totalReviews || 0;

      const newRating = ((currentRating * totalReviews) + rating) / (totalReviews + 1);

      freelancer.rating = Number(newRating.toFixed(1));
      freelancer.totalReviews = totalReviews + 1;
      await freelancer.save();
    }

    // 6. Mark Offer as reviewed
    offer.isReviewed = true;
    await offer.save();

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (error: any) {
    console.error("   [ERROR] SUBMIT REVIEW:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
// @desc    Get reviews for a specific user
// @route   GET /api/users/:id/reviews
// @access  Public
export const getUserReviews = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as any)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    const reviews = await Review.find({ reviewee: id })
      .populate("reviewer", "name imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error: any) {
    console.error("   [ERROR] GET USER REVIEWS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req: Request, res: Response): Promise<any> => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify old password
    if (user.password) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password" });
      }
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error: any) {
    console.error("   [ERROR] CHANGE PASSWORD:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
