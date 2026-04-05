import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJob extends Document {
  user: mongoose.Types.ObjectId; // The client who posted the job
  freelancer?: mongoose.Types.ObjectId; // The hired freelancer
  title: string;
  description: string;
  budget: number;
  category: string;
  status: "pending" | "active" | "completed" | "disputed";
  timeline: string;
  skills: string[];
  client: {
    name: string;
    role: string;
    avatar?: string;
    location: string;
    rating: number;
    reviewsCount: number;
    verified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // temporarily false to not break existing jobs
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "disputed"],
      default: "pending",
    },
    title: {
      type: String,
      required: [true, 'Please provide a job title'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a job description'],
    },
    budget: {
      type: Number,
      required: [true, 'Please provide a budget'],
    },
    category: {
      type: String,
      default: 'General',
    },
    timeline: {
      type: String,
      default: '3-4 Weeks',
    },
    skills: {
      type: [String],
      default: [],
    },
    client: {
      name: { type: String, default: 'Elite Client' },
      role: { type: String, default: 'Founder' },
      avatar: { type: String },
      location: { type: String, default: 'Global Remote' },
      rating: { type: Number, default: 4.9 },
      reviewsCount: { type: Number, default: 0 },
      verified: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;