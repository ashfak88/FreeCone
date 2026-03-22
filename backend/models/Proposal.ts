import mongoose, { Document, Schema } from "mongoose";

export interface IProposal extends Document {
  job: mongoose.Types.ObjectId;
  talent: mongoose.Types.ObjectId;
  coverLetter: string;
  proposedRate: number;
  timeline: string;
  figmaLink?: string;
  status: "pending" | "viewed" | "accepted" | "rejected";
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
    status: {
      type: String,
      enum: ["pending", "viewed", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Proposal || mongoose.model<IProposal>("Proposal", ProposalSchema);
