import { create } from 'zustand';

export interface PortfolioItem {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
  link?: string;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  imageUrl?: string;
  title?: string;
  bio?: string;
  about?: string;
  description?: string;
  location?: string;
  skills?: string[];
  rate?: number;
  rating?: number;
  reviews?: number;
  hoursWorked?: number;
  successRate?: string;
  portfolio?: PortfolioItem[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  isProfileComplete?: boolean;
}

export interface Job {
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  type: string;
  postedBy: string;
  createdAt: string;
  tags: string[];
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;

  jobs: Job[];
  isLoadingJobs: boolean;
  setJobs: (jobs: Job[]) => void;
  fetchJobs: () => Promise<void>;

  // Talent State
  talent: User[];
  isLoadingTalent: boolean;
  setTalent: (talent: User[]) => void;
  fetchTalent: (filters?: { search?: string; rateRange?: string; rating?: string | number }) => Promise<void>;
}

const API_URL = "http://localhost:5000/api";

export const useStore = create<AppState>((set, get) => {
  let initialUser = null;
  if (typeof window !== 'undefined') {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        initialUser = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
  }

  return {
    user: initialUser,
    setUser: (user) => {
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('accessToken');
        }
      }
      set({ user });
    },
    updateUser: (updates) => {
      const currentUser = get().user;
      if (!currentUser) return;

      const updatedUser = { ...currentUser, ...updates };

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      set({ user: updatedUser });
    },

    jobs: [],
    isLoadingJobs: false,
    setJobs: (jobs) => set({ jobs }),
    fetchJobs: async () => {
      set({ isLoadingJobs: true });
      try {
        const res = await fetch(`${API_URL}/jobs`);
        const data = await res.json();
        set({ jobs: data });
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        set({ isLoadingJobs: false });
      }
    },

    talent: [],
    isLoadingTalent: false,
    setTalent: (talent) => set({ talent }),
    fetchTalent: async (filters: { search?: string; rateRange?: string; rating?: string | number } = {}) => {
      set({ isLoadingTalent: true });
      try {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append("search", filters.search);
        if (filters?.rateRange) queryParams.append("rateRange", filters.rateRange);
        if (filters?.rating !== undefined && filters?.rating !== "") {
          queryParams.append("rating", filters.rating.toString());
        }

        const url = `${API_URL}/users/freelancers?${queryParams.toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        set({ talent: data });
      } catch (err) {
        console.error("Error fetching talent:", err);
      } finally {
        set({ isLoadingTalent: false });
      }
    },
  }
});
