export interface Freelancer {
  _id?: string;
  id?: number; // Keep for compatibility if needed
  name: string;
  role: string;
  rating: number;
  description: string;
  skills: string[];
  rate: number;
  imageUrl: string;
}
