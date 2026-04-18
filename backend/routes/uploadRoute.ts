import express from "express";
import { uploadProfile, uploadResume, uploadVoice } from "../middleware/upload";
import { protect } from "../middleware/auth";
import { profilePhotoUpload, profilePhotoDelete, resumeUpload, resumeDelete, voiceMessageUpload } from "../controllers/uploadController";

const router = express.Router();

router.post("/profile-photo", protect, uploadProfile.single("image"), profilePhotoUpload);
router.delete("/profile-photo", protect, profilePhotoDelete);

router.post("/resume", protect, uploadResume.single("resume"), resumeUpload);
router.delete("/resume", protect, resumeDelete);

router.post("/voice-message", protect, uploadVoice.single("voice"), voiceMessageUpload);

export default router;