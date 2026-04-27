import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import SystemConfig from "../models/Config";

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    const isMaintenance = maintenance ? (maintenance.value === true || String(maintenance.value).toLowerCase() === "true") : false;

    const fullPath = (req.originalUrl || req.url || "").toLowerCase();
    
    if (
      req.method === "OPTIONS" ||
      fullPath.includes("/admin") || 
      fullPath.includes("/config") || 
      fullPath.includes("/auth")
    ) {
      if (isMaintenance) {
        console.log(`   [MAINTENANCE] ALLOWING exempt path: ${req.method} ${fullPath}`);
      }
      return next();
    }

    if (isMaintenance) {
      console.log(`   [MAINTENANCE] Checking access for: ${req.method} ${fullPath}`);
      
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        try {
          const secret = process.env.JWT_ACCESS_SECRET as string;
          if (!secret) {
            console.error("   [MAINTENANCE] JWT_ACCESS_SECRET is missing!");
          }
          const decoded = jwt.verify(token, secret) as { role: string };
          
          const role = (decoded.role || "").toLowerCase();
          console.log(`   [MAINTENANCE] Detected role from token: ${role}`);

          if (role === "admin") {
            console.log(`   [MAINTENANCE] ALLOWING admin user: ${fullPath}`);
            return next(); 
          }
        } catch (err: any) {
          console.log(`   [MAINTENANCE] Token check failed: ${err.message}`);
        }
      }

      console.log(`   [MAINTENANCE] BLOCKING request to ${fullPath}`);
      return res.status(503).json({ 
        message: "System under maintenance. Please try again later.",
        maintenance: true 
      });
    }

    next();
  } catch (error) {
    console.error("   [MAINTENANCE] Error:", error);
    next();
  }
};







