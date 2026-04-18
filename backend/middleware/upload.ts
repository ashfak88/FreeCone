import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

// ---------------- PROFILE PHOTO STORAGE ----------------
const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "profile_photos",
      allowed_formats: ["jpg", "png", "jpeg", "webp"],
      public_id: `user_${req.user?.id || req.user?._id || Date.now()}`,
      access_mode: "public",
      type: "upload",
    };
  },
});

// ---------------- RESUME STORAGE ----------------
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    // Sanitize filename: remove extension and special characters
    const cleanName = file.originalname
      .split('.')
      .slice(0, -1)
      .join('.')
      .replace(/[^a-zA-Z0-9]/g, '_');
      
    return {
      folder: "resumes",
      resource_type: "auto", // Better for various doc types
      public_id: `resume_${req.user?.id || req.user?._id || Date.now()}_${cleanName}`,
      access_mode: "public",
      type: "upload",
    };
  },
});

// ---------------- VOICE MESSAGE STORAGE ----------------
const voiceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "voice_messages",
      resource_type: "video", // Required for audio files in Cloudinary
      public_id: `voice_${req.user?.id || req.user?._id || Date.now()}_${Date.now()}`,
      access_mode: "public",
      type: "upload",
    };
  },
});

// ---------------- MULTER EXPORTS ----------------
export const uploadProfile = multer({
  storage: profileStorage,
});

export const uploadResume = multer({
  storage: resumeStorage,
});

export const uploadVoice = multer({
  storage: voiceStorage,
});