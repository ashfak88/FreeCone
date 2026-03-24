import express from "express";
import { uploadProfile } from "../middleware/upload";
import User from "../models/User";
import { Request, Response } from "express";
import { protect } from "../middleware/auth";

const router = express.Router();

// @route   POST /api/upload/profile-photo
// @desc    Upload profile photo to Cloudinary
// @access  Private (Authenticated)
router.post("/profile-photo", protect, uploadProfile.single("image"), async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const reqAny = req as any;
    if (!reqAny.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = reqAny.file.path; // Cloudinary URL

    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { imageUrl: imageUrl } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile photo uploaded successfully",
      imageUrl: imageUrl,
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Upload Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// @route   DELETE /api/upload/profile-photo
// @desc    Remove profile photo (reset to default)
// @access  Private (Authenticated)
router.delete("/profile-photo", protect, async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Update user in DB, setting imageUrl to empty string
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { imageUrl: "" } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile photo removed successfully",
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Remove Photo Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

export default router;