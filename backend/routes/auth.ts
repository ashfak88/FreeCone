import express from "express";
import passport from "passport";
import {
  registerUser,
  loginUser,
  refreshToken,
  logoutUser,
  googleCallback
} from "../controllers/authController";
import { protect } from "../middleware/auth";
import { log } from "node:console";

const router = express.Router();

router.post("/register", registerUser);

router.post("/login", loginUser)


router.post("/refresh", refreshToken);
router.post("/logout", logoutUser);

router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  googleCallback
);

export default router


