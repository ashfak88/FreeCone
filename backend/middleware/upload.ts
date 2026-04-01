import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary";

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

const resumeStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: "resumes",
      resource_type: "raw",
      public_id: `resume_${req.user?.id || req.user?._id || Date.now()}_${file.originalname}`,
    };
  },
});

export const uploadProfile = multer({ storage: profileStorage });
export const uploadResume = multer({ storage: resumeStorage });