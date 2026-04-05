import mongoose, { Document, Schema } from "mongoose";

export interface IProposal extends Document {
  job: mongoose.Types.ObjectId;
  talent: mongoose.Types.ObjectId;
  coverLetter: string;
  proposedRate: number;
  timeline: string;
  figmaLink?: string;
  resume?: string;
  status: "pending" | "viewed" | "accepted" | "rejected";
  isPaid: boolean;
  createdAt: Date;
}

const ProposalSchema: Schema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    talent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coverLetter: {
      type: String,
      required: true,
    },
    proposedRate: {
      type: Number,
      required: true,
    },
    timeline: {
      type: String,
      required: true,
    },
    figmaLink: {
      type: String,
    },
    resume: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "viewed", "accepted", "rejected"],
      default: "pending",
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);
