import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import SystemConfig from "../models/Config";

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

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    if (!hasLetter || !hasDigit) {
      return res.status(400).json({ message: "Password must contain both letters and numbers" });
    }

    // CHECK MAINTENANCE MODE: Only admins can register (though usually admins are created differently, 
    // but this prevents regular users from registering during maintenance)
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    const isMaintenance = maintenance ? (maintenance.value === true || String(maintenance.value).toLowerCase() === "true") : false;

    if (isMaintenance) {
      return res.status(503).json({
        message: "System is under maintenance. Registration is temporarily disabled.",
        maintenance: true
      });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const userObject = user.toObject();
    delete userObject.password;

    res.status(201).json({
      message: "User registered successfully",
      user: {
        ...userObject,
        id: user._id
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

    // CHECK MAINTENANCE MODE: Only admins can login
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    const isMaintenance = maintenance ? (maintenance.value === true || String(maintenance.value).toLowerCase() === "true") : false;

    if (isMaintenance) {
      const role = (user.role || "").toLowerCase();
      console.log(`   [MAINTENANCE] Login attempt by role: ${role}`);

      if (role !== "admin") {
        console.log(`   [MAINTENANCE] BLOCKING non-admin login: ${user.email}`);
        return res.status(503).json({
          message: "System is under maintenance. Only administrators can login at this time.",
          maintenance: true
        });
      }
      console.log(`   [MAINTENANCE] ALLOWING admin login: ${user.email}`);
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

    const userObject = user.toObject();
    delete userObject.password;

    res.json({
      message: "Logged in successfully",
      accessToken,
      user: {
        ...userObject,
        id: user._id
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

    // CHECK MAINTENANCE MODE: Only admins can refresh tokens during maintenance
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    const isMaintenance = maintenance ? (maintenance.value === true || String(maintenance.value).toLowerCase() === "true") : false;

    if (isMaintenance) {
      const role = (user.role || "").toLowerCase();
      if (role !== "admin") {
        console.log(`   [MAINTENANCE] BLOCKING non-admin refresh: ${user.email}`);
        return res.status(503).json({
          message: "System is under maintenance. Access restricted to administrators.",
          maintenance: true
        });
      }
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
export const googleCallback = async (req: Request, res: Response) => {
  const user = req.user as any;

  if (user && user.status === "blocked") {
    const targetFrontend = process.env.FRONTEND_URL;
    if (!targetFrontend) {
      console.error("FRONTEND_URL is not defined in environment variables");
      return res.status(500).send("Configuration Error: FRONTEND_URL missing");
    }
    const errorUrl = new URL(`${targetFrontend}/auth/error`);
    errorUrl.searchParams.append("message", "Your account is suspended. Please contact support.");
    return res.redirect(errorUrl.toString());
  }

  // CHECK MAINTENANCE MODE: Only admins can login via Google
  const isMaintenanceActive = await (async () => {
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    return maintenance ? (maintenance.value === true || String(maintenance.value).toLowerCase() === "true") : false;
  })();

  if (isMaintenanceActive) {
    const role = (user.role || "").toLowerCase();
    console.log(`   [MAINTENANCE] Google login attempt by role: ${role}`);

    if (role !== "admin") {
      console.log(`   [MAINTENANCE] BLOCKING non-admin Google login: ${user.email}`);
      const targetFrontend = process.env.FRONTEND_URL;
      if (!targetFrontend) {
        return res.status(503).json({ message: "Maintenance mode active, and FRONTEND_URL is missing." });
      }
      const errorUrl = new URL(`${targetFrontend}/auth/error`);
      errorUrl.searchParams.append("message", "System is under maintenance. Only administrators can login at this time.");
      return res.redirect(errorUrl.toString());
    }
  }

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id));

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  const userObject = user.toObject();
  delete userObject.password;
  
  const userInfo = {
    ...userObject,
    id: user._id
  };

  const targetFrontend = process.env.FRONTEND_URL;
  if (!targetFrontend) {
    console.error("FRONTEND_URL is not defined in environment variables");
    return res.status(500).send("Configuration Error: FRONTEND_URL missing");
  }
  const successUrl = new URL(`${targetFrontend}/auth/success`);
  successUrl.searchParams.append("token", accessToken);
  successUrl.searchParams.append("user", encodeURIComponent(JSON.stringify(userInfo)));

  res.redirect(successUrl.toString());
};
