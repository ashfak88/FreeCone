import express from "express";
import { uploadProfile, uploadResume } from "../middleware/upload";
import { protect } from "../middleware/auth";
import { profilePhotoUpload, profilePhotoDelete, resumeUpload, resumeDelete } from "../controllers/uploadController";

const router = express.Router();

router.post("/profile-photo", protect, uploadProfile.single("image"), profilePhotoUpload);
router.delete("/profile-photo", protect, profilePhotoDelete);

router.post("/resume", protect, uploadResume.single("resume"), resumeUpload);
router.delete("/resume", protect, resumeDelete);

export default router;