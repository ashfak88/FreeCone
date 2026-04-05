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
    };
  },
});

// ---------------- RESUME STORAGE ----------------
const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "resumes",
      resource_type: "raw", // important for PDF/DOC files
      public_id: `resume_${req.user?.id || req.user?._id || Date.now()}_${file.originalname}`,
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