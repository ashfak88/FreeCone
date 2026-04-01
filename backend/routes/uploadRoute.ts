import express from "express";
import { uploadProfile } from "../middleware/upload";
import { protect } from "../middleware/auth";
import { profilePhotoUpload, profilePhotoDelete } from "../controllers/uploadController";

const router = express.Router();

router.post("/profile-photo", protect, uploadProfile.single("image"), profilePhotoUpload);

router.delete("/profile-photo", protect, profilePhotoDelete);

export default router;