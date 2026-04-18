import { Request, Response } from "express";
import User from "../models/User";

export const profilePhotoUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const reqAny = req as any;
    if (!reqAny.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imageUrl = reqAny.file.path; 

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
};

export const profilePhotoDelete = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

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
};

export const resumeUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const reqAny = req as any;
    if (!reqAny.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumeUrl = reqAny.file.path; 
    console.log(`[DEBUG] Resume uploaded: Original name: "${reqAny.file.originalname}", Cloudinary URL: ${resumeUrl}`);
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { resume: resumeUrl } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Resume uploaded successfully",
      resumeUrl: resumeUrl,
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Resume Upload Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const resumeDelete = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { resume: "" } },
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Resume removed successfully",
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Remove Resume Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const voiceMessageUpload = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const reqAny = req as any;
    if (!reqAny.file) {
      return res.status(400).json({ message: "No audio file uploaded" });
    }

    const audioUrl = reqAny.file.path; 

    res.status(200).json({
      message: "Voice message uploaded successfully",
      audioUrl: audioUrl
    });
  } catch (error: any) {
    console.error("Voice Upload Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
