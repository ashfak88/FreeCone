import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

const generateAccessToken = (userId: string, role: string) => {
  const secret = process.env.JWT_ACCESS_SECRET as string;
  return jwt.sign({ id: userId, role }, secret, { expiresIn: "24h" });
};

const generateRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET as string;
  return jwt.sign({ id: userId }, secret, { expiresIn: "7d" });
};

// Register User
export const registerUser = async (req: Request, res: Response): Promise<any> => {
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
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        bio: user.bio,
        location: user.location,
        skills: user.skills,
        rate: user.rate,
        imageUrl: user.imageUrl,
        portfolio: user.portfolio,
        socialLinks: user.socialLinks,
        isProfileComplete: user.isProfileComplete
      },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Login User
export const loginUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (user.status === "blocked") {
      return res.status(403).json({ message: "Your account is suspended. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log the login attempt
    const device = req.headers["user-agent"] || "Unknown Device";
    user.loginHistory = user.loginHistory || [];
    user.loginHistory.unshift({
      device: device.split("(")[0].trim(), // Simple parser for OS/Browser info
      location: "IP Detected", // Simplified for local dev
      timestamp: new Date(),
      status: "Successful"
    });
    
    // Keep only last 10 entries
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(0, 10);
    }

    await user.save();

    const accessToken = generateAccessToken(String(user._id), user.role);

    res.json({
      message: "Logged in successfully",
      accessToken,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        title: user.title,
        bio: user.bio,
        location: user.location,
        skills: user.skills,
        rate: user.rate,
        imageUrl: user.imageUrl,
        portfolio: user.portfolio,
        socialLinks: user.socialLinks,
        loginHistory: user.loginHistory, // Include in response
        isProfileComplete: user.isProfileComplete
      },
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<any> => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
    const accessSecret = process.env.JWT_ACCESS_SECRET as string;
    const decoded = jwt.verify(token, refreshSecret) as { id: string };

    const user = await User.findById(decoded.id);
    if (!user || user.status === "blocked") {
      return res.status(403).json({ message: "Your account is suspended. Please contact support." });
    }

    const newAccessToken = jwt.sign({ id: user._id, role: user.role }, accessSecret, { expiresIn: "24h" });
    res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(403).json({ message: "Invalid or expired refresh token" });
  }
};

// Logout User
export const logoutUser = (_req: Request, res: Response) => {
  res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
  res.json({ message: "Logged out successfully" });
};

// Google Callback
export const googleCallback = (req: Request, res: Response) => {
  const user = req.user as any;

  if (user && user.status === "blocked") {
    const errorUrl = new URL("http://localhost:3000/auth/error");
    errorUrl.searchParams.append("message", "Your account is suspended. Please contact support.");
    return res.redirect(errorUrl.toString());
  }

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id));

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const userInfo = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    title: user.title,
    bio: user.bio,
    location: user.location,
    skills: user.skills,
    rate: user.rate,
    imageUrl: user.imageUrl,
    isProfileComplete: user.isProfileComplete
  };

  const successUrl = new URL("http://localhost:3000/auth/success");
  successUrl.searchParams.append("token", accessToken);
  successUrl.searchParams.append("user", encodeURIComponent(JSON.stringify(userInfo)));

  res.redirect(successUrl.toString());
};
