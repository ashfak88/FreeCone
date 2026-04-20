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
    // Sanitize filename: remove extension and special characters for the base
    const parts = file.originalname.split('.');
    const ext = parts.length > 1 ? parts.pop().toLowerCase() : 'pdf';
    const cleanName = parts
      .join('.')
      .replace(/[^a-zA-Z0-9]/g, '_');
      
    return {
      folder: "resumes",
      resource_type: "auto", // Automatically handles PDFs as images and others as raw
      public_id: `resume_${req.user?.id || req.user?._id || Date.now()}_${cleanName}`,
      format: ext, // Forcing the format ensures the URL has the correct extension and headers
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