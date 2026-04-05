import mongoose, { Document, Schema } from "mongoose";

export interface IPortfolioItem {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  link?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  role: "admin" | "user" | "client" | "talent";
  title?: string;
  bio?: string;
  location?: string;
  rating?: number;
  skills?: string[];
  rate?: number;
  imageUrl?: string;
  portfolio: IPortfolioItem[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  isProfileComplete: boolean;
  status: "active" | "pending" | "blocked";
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
      enum: ["admin", "user", "client", "talent"],
      default: "user",
    },
    title: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    rating: {
      type: Number,
      default: 0,
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
      default: "",
    },
    portfolio: [
      {
        title: String,
        description: String,
        technologies: [String],
        imageUrl: String,
        link: String,
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      website: String,
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "pending", "blocked"],
      default: "active",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
