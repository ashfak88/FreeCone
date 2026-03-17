import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import passport from "passport";
import User from "../models/User";

const router = express.Router();

function generateAccessToken(userId: string, role: string) {
  const secret = process.env.JWT_ACCESS_SECRET as string;
  return jwt.sign({ id: userId, role }, secret, { expiresIn: "15m" });
}

function generateRefreshToken(userId: string) {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
}

// @route   POST /api/auth/register
router.post("/register", async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/login
router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(String(user._id), user.role);
    const refreshToken = generateRefreshToken(String(user._id));

    // Send refresh token as secure HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      message: "Logged in successfully",
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/auth/refresh
router.post("/refresh", (req: Request, res: Response): any => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
    const accessSecret = process.env.JWT_ACCESS_SECRET as string;
    const decoded = jwt.verify(token, refreshSecret) as { id: string };
    const newAccessToken = jwt.sign({ id: decoded.id }, accessSecret, { expiresIn: "15m" });
    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
});

// @route   POST /api/auth/logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
  res.json({ message: "Logged out successfully" });
});

// @route   GET /api/auth/google
// @desc    Authenticate with Google
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Successful authentication
    const user = req.user as any;

    // Generate tokens identical to normal login
    const accessToken = generateAccessToken(String(user._id), user.role);
    const refreshToken = generateRefreshToken(String(user._id));

    // Send refresh token as secure HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Create frontend user info object
    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    // Redirect to frontend success page with token params
    const successUrl = new URL("http://localhost:3000/auth/success");
    successUrl.searchParams.append("token", accessToken);
    successUrl.searchParams.append("user", encodeURIComponent(JSON.stringify(userInfo)));

    res.redirect(successUrl.toString());
  }
);

export default router;
