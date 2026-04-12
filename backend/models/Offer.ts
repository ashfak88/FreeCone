import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  job?: mongoose.Types.ObjectId;
  jobTitle: string;
  description: string;
  budget: number;
  status: "pending" | "accepted" | "rejected";
  projectStatus: "not_started" | "active" | "review" | "completed" | "disputed";
  updates: {
    text: string;
    type: "status_change" | "milestone_completed" | "payment_released" | "general";
    createdAt: Date;
  }[];
  isPaid: boolean;
  isReviewed: boolean;
  rejectionReason?: string;
  githubRepo?: string;
  createdAt: Date;
}

const OfferSchema: Schema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: false,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    projectStatus: {
      type: String,
      enum: ["not_started", "active", "review", "completed", "disputed"],
      default: "not_started",
    },
    updates: [
      {
        text: String,
        type: {
          type: String,
          enum: ["status_change", "milestone_completed", "payment_released", "general"],
          default: "general",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    },
    isReviewed: {
      type: Boolean,
      default: false,
    },
    rejectionReason: {
      type: String,
      default: "",
    },
    githubRepo: {
      type: String,
      required: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);
