import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };

      req.user = await User.findById(decoded.id).select("-password");
      
      if (!req.user) {
        console.warn(`   [AUTH] Token valid but user ${decoded.id} not found in DB`);
        return res.status(401).json({ message: "User no longer exists" });
      }

      if (req.user.status === "blocked") {
        console.warn(`   [AUTH] Access denied: User ${req.user.email} is suspended`);
        return res.status(403).json({ message: "Your account is suspended. Please contact support." });
      }

      return next();
    } catch (error: any) {
      console.error("   [AUTH] Token verification failed:", error.message);
      return res.status(401).json({ message: "Not authorized, token expired or invalid" });
    }
  }

  if (!token) {
    console.warn("   [AUTH] Request blocked: No token provided");
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction): any => {
  if (req.user && req.user.role === "admin") {
    return next();
  } else {
    return res.status(403).json({ message: "Not authorized as an admin" });
  }
};
