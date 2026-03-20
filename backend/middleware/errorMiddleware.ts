import { Request, Response, NextFunction } from "express";

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[ROUTE NOT FOUND] ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: "Not Found", 
    path: req.url,
    message: "If you see this, the server IS RUNNING but this path is not defined." 
  });
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
