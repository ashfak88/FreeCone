import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IJob extends Document {
  title: string;
  description: string;
  budget: number;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new mongoose.Schema(
  {
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
  },
  { timestamps: true }
);

const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);

export default Job;