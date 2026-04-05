import mongoose, { Document, Schema } from "mongoose";

export interface IOffer extends Document {
  client: mongoose.Types.ObjectId;
  freelancer: mongoose.Types.ObjectId;
  jobTitle: string;
  description: string;
  budget: number;
  status: "pending" | "accepted" | "rejected";
  isPaid: boolean;
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
    isPaid: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Offer || mongoose.model<IOffer>("Offer", OfferSchema);
