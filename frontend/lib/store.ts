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
  budget: number;
  category: string;
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
  createdAt: string;
}

export interface Offer {
  _id: string;
  client: any;
  freelancer: any;
  jobTitle: string;
  description: string;
  budget: number;
  status: "pending" | "viewed" | "accepted" | "rejected";
  createdAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  type: "proposal" | "offer" | "message" | "payment" | "other";
  relatedId?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Proposal {
  _id: string;
  job: Job;
  talent: any;
  coverLetter: string;
  proposedRate: number;
  timeline: string;
  figmaLink?: string;
  status: "pending" | "viewed" | "accepted" | "rejected";
  createdAt: string;
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

  // Offer State
  offers: Offer[];
  isLoadingOffers: boolean;
  setOffers: (offers: Offer[]) => void;
  fetchOffers: () => Promise<void>;

  // Notification State
  notifications: any[];
  sentNotifications: any[];
  isLoadingNotifications: boolean;
  fetchNotifications: (dir?: 'received' | 'sent') => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;

  // User-specific Job/Proposal State
  myJobs: Job[];
  myProposals: Proposal[];
  receivedProposals: Proposal[];
  isLoadingMyData: boolean;
  fetchMyJobs: () => Promise<void>;
  fetchMyProposals: () => Promise<void>;
  fetchReceivedProposals: () => Promise<void>;
  updateProposalStatus: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
  markProposalAsViewed: (id: string) => Promise<void>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

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

    offers: [],
    isLoadingOffers: false,
    setOffers: (offers) => set({ offers }),
    fetchOffers: async () => {
      set({ isLoadingOffers: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        set({ offers: data });
      } catch (err) {
        console.error("Failed to fetch offers:", err);
      } finally {
        set({ isLoadingOffers: false });
      }
    },

    notifications: [],
    sentNotifications: [],
    isLoadingNotifications: false,
    fetchNotifications: async (dir: 'received' | 'sent' = 'received') => {
      set({ isLoadingNotifications: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/notifications?dir=${dir}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (dir === 'sent') {
          set({ sentNotifications: data });
        } else {
          set({ notifications: data });
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        set({ isLoadingNotifications: false });
      }
    },

    markNotificationAsRead: async (id: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/notifications/${id}/read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const updatedNotifications = get().notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          );
          set({ notifications: updatedNotifications });
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    },

    markAllNotificationsAsRead: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/notifications/mark-all-read`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const updatedNotifications = get().notifications.map((n) => ({
            ...n,
            isRead: true,
          }));
          set({ notifications: updatedNotifications });
        }
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    },

    myJobs: [],
    myProposals: [],
    receivedProposals: [],
    isLoadingMyData: false,
    fetchMyJobs: async () => {
      set({ isLoadingMyData: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/jobs/my-jobs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        set({ myJobs: data });
      } catch (err) {
        console.error("Failed to fetch my jobs:", err);
      } finally {
        set({ isLoadingMyData: false });
      }
    },
    fetchMyProposals: async () => {
      set({ isLoadingMyData: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/jobs/my-proposals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        set({ myProposals: data });
      } catch (err) {
        console.error("Failed to fetch my proposals:", err);
      } finally {
        set({ isLoadingMyData: false });
      }
    },
    fetchReceivedProposals: async () => {
      set({ isLoadingMyData: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/jobs/received-proposals`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        set({ receivedProposals: data });
      } catch (err) {
        console.error("Failed to fetch received proposals:", err);
      } finally {
        set({ isLoadingMyData: false });
      }
    },
    updateProposalStatus: async (id: string, status: 'accepted' | 'rejected') => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/jobs/proposals/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });

        if (res.ok) {
          // Update local state
          const updatedReceived = get().receivedProposals.map((p) =>
            p._id === id ? { ...p, status } : p
          );
          set({ receivedProposals: updatedReceived });
        } else {
          const errorData = await res.json();
          console.error("Failed to update proposal status:", errorData.message);
        }
      } catch (err) {
        console.error("Error updating proposal status:", err);
      }
    },
    markProposalAsViewed: async (id: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/jobs/proposals/${id}/viewed`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          // Update local state for received proposals
          const updatedReceived = get().receivedProposals.map((p) =>
            p._id === id ? { ...p, status: 'viewed' as any } : p
          );
          set({ receivedProposals: updatedReceived });
        }
      } catch (err) {
        console.error("Error marking proposal as viewed:", err);
      }
    },
  }
});
