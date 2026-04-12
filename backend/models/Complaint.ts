import mongoose, { Document, Schema } from "mongoose";

export interface IComplaint extends Document {
  user: mongoose.Types.ObjectId;
  reportedUser?: mongoose.Types.ObjectId;
  subject: string;
  message: string;
  category: "security" | "bug" | "billing" | "user_report" | "other" | "message";
  status: "pending" | "investigating" | "resolved" | "dismissed";
  createdAt: Date;
}

const ComplaintSchema: Schema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["security", "bug", "billing", "user_report", "other", "message"],
      default: "security",
    },
    status: {
      type: String,
      enum: ["pending", "investigating", "resolved", "dismissed"],
      default: "pending",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.models.Complaint || mongoose.model<IComplaint>("Complaint", ComplaintSchema);
