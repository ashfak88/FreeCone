import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  txnId: string;
  amount: number;
  currency: string;
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  status: "Success" | "Pending" | "Escrow" | "Failed";
  type: "Payout" | "Deposit" | "Commission" | "Milestone";
  job: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    txnId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["Success", "Pending", "Escrow", "Failed"],
      default: "Pending",
    },
    type: {
      type: String,
      enum: ["Payout", "Deposit", "Commission", "Milestone"],
      required: true,
    },
    job: { type: Schema.Types.ObjectId, ref: "Job" },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
