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
  totalReviews?: number;
  reviews?: number;
  hoursWorked?: number;
  successRate?: number;
  completedProjects?: number;
  totalProjectsStarted?: number;
  resume?: string;
  portfolio?: PortfolioItem[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    website?: string;
  };
  isProfileComplete: boolean;
  status: "active" | "pending" | "blocked";
  createdAt: string;
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
  user?: string;
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
  projectStatus?: "not_started" | "active" | "review" | "completed" | "disputed";
  updates?: {
    text: string;
    type: string;
    createdAt: string;
  }[];
  isPaid: boolean;
  isReviewed: boolean;
  rejectionReason?: string;
  githubRepo?: string;
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
  type: "proposal" | "offer" | "message" | "payment" | "completion_request" | "confirmation" | "other";
  relatedId?: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  txnId: string;
  amount: number;
  currency: string;
  sender: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  receiver: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  status: "Success" | "Pending" | "Escrow" | "Failed";
  type: string;
  job?: {
    _id: string;
    title: string;
  };
  description?: string;
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

export interface Review {
  _id: string;
  offer: string;
  reviewer: {
    _id: string;
    name: string;
    imageUrl?: string;
  };
  reviewee: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: any;
  updatedAt: string;
  isTemp?: boolean;
  favoritedBy?: string[];
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: any;
  content: string;
  type: "text" | "payment" | "confirmation";
  metadata?: any;
  isRead: boolean;
  createdAt: string;
}

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  fetchProfile: () => Promise<void>;

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
  updateOfferStatus: (id: string, status: 'accepted' | 'rejected') => Promise<void>;
  fetchOfferById: (id: string) => Promise<Offer | null>;
  addProjectUpdate: (id: string, text: string, type?: string) => Promise<void>;
  completeProject: (id: string) => Promise<void>;
  rejectProjectCompletion: (id: string, reason: string) => Promise<void>;
  updateGithubRepo: (id: string, githubRepo: string) => Promise<void>;
  submitReview: (reviewData: { offerId: string; rating: number; comment: string }) => Promise<boolean>;
  fetchUserById: (id: string) => Promise<User | null>;
  fetchUserReviews: (id: string) => Promise<Review[]>;

  // Transaction State
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;

  // Notification State
  notifications: any[];
  sentNotifications: any[];
  isLoadingNotifications: boolean;
  fetchNotifications: (dir?: 'received' | 'sent') => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  markAllNotificationsAsUnread: () => Promise<void>;

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

  // Chat/Message State
  conversations: Conversation[];
  activeConversation: Conversation | null;
  tempParticipant: User | null;
  messages: Message[];
  isLoadingMessages: boolean;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  deleteAllConversations: () => Promise<void>;
  toggleFavoriteConversation: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversation: Conversation | null) => void;
  setTempParticipant: (participant: User | null) => void;
  addMessage: (message: Message) => void;
  updateConversationLocally: (conversation: Conversation) => void;
  updateMessageLocally: (message: Message) => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

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

    fetchProfile: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          // Update local state and localStorage
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(data));
          }
          set({ user: data });
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    },

    jobs: [],
    isLoadingJobs: false,
    setJobs: (jobs) => set({ jobs }),
    fetchJobs: async () => {
      set({ isLoadingJobs: true });
      try {
        const res = await fetch(`${API_URL}/jobs`, { cache: "no-store" });
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
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json();
        set({ talent: data });
      } catch (err) {
        console.error("Error fetching talent:", err);
      } finally {
        set({ isLoadingTalent: false });
      }
    },
    fetchUserById: async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/users/${id}`, { cache: "no-store" });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error("Error fetching user by ID:", err);
      }
      return null;
    },

    offers: [],
    isLoadingOffers: false,
    setOffers: (offers) => set({ offers }),
    fetchOffers: async () => {
      set({ isLoadingOffers: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers`, {
          cache: "no-store",
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
    updateOfferStatus: async (id: string, status: 'accepted' | 'rejected') => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        });

        if (res.ok) {
          const updatedOffers = get().offers.map((o) =>
            o._id === id ? { ...o, status } : o
          );
          set({ offers: updatedOffers });
        } else {
          const errorData = await res.json();
          console.error("Failed to update offer status:", errorData.message);
        }
      } catch (err) {
        console.error("Error updating offer status:", err);
      }
    },
    fetchOfferById: async (id: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error("Failed to fetch offer:", err);
      }
      return null;
    },
    addProjectUpdate: async (id: string, text: string, type: string = "general") => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers/${id}/updates`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text, type }),
        });
        if (res.ok) {
          const updatedOffer = await res.json();
          const updatedOffers = get().offers.map((o) =>
            o._id === id ? updatedOffer : o
          );
          set({ offers: updatedOffers });
        }
      } catch (err) {
        console.error("Failed to add project update:", err);
      }
    },
    completeProject: async (id: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers/${id}/complete`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const updatedOffer = await res.json();
          const updatedOffers = get().offers.map((o) =>
            o._id === id ? updatedOffer : o
          );
          set({ offers: updatedOffers });
        }
      } catch (err) {
        console.error("Failed to complete project:", err);
      }
    },
    rejectProjectCompletion: async (id, reason) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers/${id}/reject-completion`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });
        if (res.ok) {
          const updatedOffer = await res.json();
          set((state) => ({
            offers: state.offers.map((o) => (o._id === id ? updatedOffer : o)),
          }));
        }
      } catch (err) {
        console.error("Failed to reject project completion:", err);
      }
    },
    updateGithubRepo: async (id: string, githubRepo: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/offers/${id}/github`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ githubRepo }),
        });
        if (res.ok) {
          const updatedOffer = await res.json();
          const updatedOffers = get().offers.map((o) =>
            o._id === id ? updatedOffer : o
          );
          set({ offers: updatedOffers });
        }
      } catch (err) {
        console.error("Failed to update GitHub repo:", err);
      }
    },
    submitReview: async (reviewData) => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/users/review`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(reviewData),
        });

        if (res.ok) {
          // Update the localized offer state
          const updatedOffers = get().offers.map((o) =>
            o._id === reviewData.offerId ? { ...o, isReviewed: true } : o
          );
          set({ offers: updatedOffers });
          return true;
        }
        return false;
      } catch (err) {
        console.error("Failed to submit review:", err);
        return false;
      }
    },
    fetchUserReviews: async (id: string) => {
      try {
        const res = await fetch(`${API_URL}/users/${id}/reviews`, { cache: "no-store" });
        if (res.ok) return await res.json();
      } catch (err) {
        console.error("Failed to fetch user reviews:", err);
      }
      return [];
    },

    transactions: [],
    fetchTransactions: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const res = await fetch(`${API_URL}/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          set({ transactions: data });
        }
      } catch (err) {
        console.error("Failed to fetch transactions:", err);
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
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const notificationData = Array.isArray(data) ? data : [];
        if (dir === 'sent') {
          set({ sentNotifications: notificationData });
        } else {
          set({ notifications: notificationData });
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
          const updatedSent = get().sentNotifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          );
          set({ notifications: updatedNotifications, sentNotifications: updatedSent });
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
          const updatedSent = get().sentNotifications.map((n) => ({
            ...n,
            isRead: true,
          }));
          set({ notifications: updatedNotifications, sentNotifications: updatedSent });
        }
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    },

    markAllNotificationsAsUnread: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/notifications/mark-all-unread`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const updatedNotifications = get().notifications.map((n) => ({
            ...n,
            isRead: false,
          }));
          const updatedSent = get().sentNotifications.map((n) => ({
            ...n,
            isRead: false,
          }));
          set({ notifications: updatedNotifications, sentNotifications: updatedSent });
        }
      } catch (err) {
        console.error("Failed to mark all as unread:", err);
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
          cache: "no-store",
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
          cache: "no-store",
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
          cache: "no-store",
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

    conversations: [],
    activeConversation: null,
    tempParticipant: null,
    messages: [],
    isLoadingMessages: false,
    fetchConversations: async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        set({ conversations: Array.isArray(data) ? data : [] });
      } catch (err) {
        console.error("Error fetching conversations:", err);
      }
    },
    fetchMessages: async (conversationId: string) => {
      set({ isLoadingMessages: true });
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        set({ messages: Array.isArray(data) ? data : [] });

        // Mark as read in backend
        fetch(`${API_URL}/messages/${conversationId}/read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => console.warn("Failed to mark as read returning from API"));

        // Optimistically clear the unread badge locally
        const { conversations, user } = get();
        if (user) {
          const myId = user._id || user.id;
          const updatedConvs = conversations.map(c => {
            if (c._id === conversationId && c.lastMessage) {
              const readArray = Array.isArray(c.lastMessage.readBy) ? c.lastMessage.readBy : [];
              const isAlreadyRead = readArray.some((r: any) => {
                if (typeof r === 'object' && r !== null) return r._id === myId || r.id === myId;
                return r === myId;
              });
              if (!isAlreadyRead) {
                return {
                  ...c,
                  lastMessage: {
                    ...c.lastMessage,
                    readBy: [...readArray, myId]
                  }
                };
              }
            }
            return c;
          });
          set({ conversations: updatedConvs });
        }
      } catch (err) {
        console.warn("Error fetching messages:", err);
      } finally {
        set({ isLoadingMessages: false });
      }
    },
    deleteConversation: async (conversationId: string) => {
      try {
        const token = localStorage.getItem("accessToken");
        await fetch(`${API_URL}/messages/${conversationId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const { conversations, activeConversation } = get();
        set({ conversations: conversations.filter(c => c._id !== conversationId) });
        if (activeConversation?._id === conversationId) {
          set({ activeConversation: null, messages: [] });
        }
      } catch (err) {
        console.warn("Failed to delete conversation:", err);
      }
    },
    deleteAllConversations: async () => {
      // Optimistic update
      const { conversations } = get();
      set({ conversations: [] });

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/messages/all`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          set({ conversations }); // Revert
          console.warn("Failed to delete all conversations API response");
        }
      } catch (err) {
        set({ conversations }); // Revert
        console.warn("Failed to delete all conversations:", err);
      }
    },
    toggleFavoriteConversation: async (conversationId: string) => {
      // Optimistic update
      const { conversations, user } = get();
      if (!user) return;
      const myId = user._id || user.id;

      const optimisticConversations = conversations.map(c => {
        if (c._id === conversationId) {
          const favs = c.favoritedBy || [];
          const hasFav = favs.some((id: any) => id.toString() === myId.toString());
          return {
            ...c,
            favoritedBy: hasFav
              ? favs.filter((id: any) => id.toString() !== myId.toString())
              : [...favs, myId]
          };
        }
        return c;
      });
      set({ conversations: optimisticConversations });

      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch(`${API_URL}/messages/${conversationId}/favorite`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          // Revert if failed
          set({ conversations });
          console.warn("Failed to toggle favorite API response");
          return;
        }

        const updatedConversation = await res.json();

        // Final sync
        set({
          conversations: get().conversations.map(c =>
            c._id === conversationId ? updatedConversation : c
          )
        });
      } catch (err) {
        set({ conversations }); // Revert
        console.warn("Failed to toggle favorite:", err);
      }
    },
    setActiveConversation: (conversation) => set({ activeConversation: conversation, tempParticipant: null }),
    setTempParticipant: (participant) => set({ tempParticipant: participant, activeConversation: null, messages: [] }),
    addMessage: (message) => {
      const { activeConversation, tempParticipant, messages } = get();
      const currentActiveId = activeConversation?._id;
      const incomingConvId = message.conversationId;

      console.log("   [STORE] addMessage check:", { currentActiveId, incomingConvId });

      // If we are in a temporary chat with a participant, we should check if this message 
      // belongs to the newly created conversation for that participant.
      // But usually, MessageInput will set activeConversation once it gets the first response.

      if (currentActiveId && incomingConvId === currentActiveId) {
        const isDuplicate = messages.some(m => m._id === message._id);
        if (!isDuplicate) {
          set({ messages: [...messages, message] });
        }
      } else if (!currentActiveId && tempParticipant) {
        // This handles cases where the first message comes in via socket before the POST response
        // Or for the recipient who doesn't have the conversation yet
        set({ messages: [...messages, message] });
      }
    },
    updateConversationLocally: (updatedConv) => {
      const { conversations } = get();
      const updatedId = updatedConv._id;

      // Ensure participants are properly merged if the incoming update is partial
      const existing = conversations.find(c => c._id === updatedId);
      const mergedConv = {
        ...existing,
        ...updatedConv,
        participants: updatedConv.participants?.length > 0 ? updatedConv.participants : (existing?.participants || [])
      };

      let newConversations;
      if (existing) {
        newConversations = conversations.map(c => c._id === updatedId ? mergedConv : c);
      } else {
        newConversations = [mergedConv, ...conversations];
      }

      // Sort by updatedAt descending
      newConversations.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA;
      });

      set({ conversations: newConversations });
    },
    updateMessageLocally: (updatedMessage) => {
      const { messages } = get();
      const newMessages = messages.map(m => {
        const mId = (m._id || (m as any).id)?.toString();
        const uId = (updatedMessage._id || (updatedMessage as any).id)?.toString();
        return mId === uId ? updatedMessage : m;
      });
      set({ messages: newMessages });
    },
  }
});
