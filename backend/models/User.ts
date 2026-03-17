import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: "admin" | "client" | "freelancer";
  rating?: number;
  description?: string;
  skills?: string[];
  rate?: number;
  imageUrl?: string;
  createdAt: Date;
}

const UserSchema: Schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: ["admin", "client", "freelancer"],
      default: "client",
    },
    rating: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
    },
    rate: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
