import { Request, Response } from "express";
import Complaint from "../models/Complaint";

export const submitComplaint = async (req: Request, res: Response): Promise<any> => {
  try {
    const { subject, message, category, reportedUser } = req.body;
    const userId = (req as any).user.id;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const complaint = new Complaint({
      user: userId,
      reportedUser: reportedUser || undefined,
      subject,
      message,
      category: category || "security"
    });

    await complaint.save();

    res.status(201).json({
      message: "Your report has been successfully submitted to the administrator.",
      complaint
    });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
