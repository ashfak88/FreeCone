import { Request, Response, NextFunction } from "express";
import SystemConfig from "../models/Config";

export const checkMaintenance = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    const isMaintenance = maintenance ? (maintenance.value === true || String(maintenance.value).toLowerCase() === "true") : false;

    // Use originalUrl to be safe with full paths, normalize to lowercase
    const fullPath = (req.originalUrl || req.url || "").toLowerCase();
    
    // EXEMPTIONS: Always allow admin and config routes to prevent lockout
    if (fullPath.includes("/admin") || fullPath.includes("/config")) {
      return next();
    }

    if (isMaintenance) {
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
