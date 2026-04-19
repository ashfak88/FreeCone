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
  totalReviews?: number;
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
  successRate?: number;
  completedProjects?: number;
  totalProjectsStarted?: number;
  resume?: string;
  loginHistory: Array<{
    device: string;
    location: string;
    timestamp: Date;
    status: "Successful" | "Blocked";
  }>;
  paymentAccount?: {
    upiId?: string;
    cardDetails?: {
      holderName?: string;
      last4?: string;
      expiry?: string;
    };
  };
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
    totalReviews: {
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
    successRate: {
      type: Number,
      default: 0,
    },
    completedProjects: {
      type: Number,
      default: 0,
    },
    totalProjectsStarted: {
      type: Number,
      default: 0,
    },
    resume: {
      type: String,
      default: "",
    },
    loginHistory: [
      {
        device: String,
        location: String,
        timestamp: { type: Date, default: Date.now },
        status: { type: String, enum: ["Successful", "Blocked"] }
      }
    ],
    paymentAccount: {
      upiId: { type: String, default: "" },
      cardDetails: {
        holderName: { type: String, default: "" },
        last4: { type: String, default: "" },
        expiry: { type: String, default: "" },
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
