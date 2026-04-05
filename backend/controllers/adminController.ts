import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Job from "../models/Job";
import Transaction from "../models/Transaction";

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Revenue Calculations
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    
    const todayJobs = await Job.find({ createdAt: { $gte: today } });
    const todayRevenue = todayJobs.reduce((acc, job) => acc + (job.budget || 0), 0);

    const totalRevenueResult = await Job.aggregate([
      { $group: { _id: null, total: { $sum: "$budget" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    // 2. Growth and Counts
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isProfileComplete: true });
    const totalProjects = await Job.countDocuments();
    const todaySignups = await User.countDocuments({ createdAt: { $gte: today } });

    // Calculate Growth (Month over Month)
    const currentMonthUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const prevMonthUsers = await User.countDocuments({ 
      createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth } 
    });
    const userGrowth = prevMonthUsers === 0 ? (currentMonthUsers > 0 ? 100 : 0) : 
                      ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100;

    const currentMonthProjects = await Job.countDocuments({ createdAt: { $gte: startOfMonth } });
    const prevMonthProjects = await Job.countDocuments({
      createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth }
    });
    const projectGrowth = prevMonthProjects === 0 ? (currentMonthProjects > 0 ? 100 : 0) :
                         ((currentMonthProjects - prevMonthProjects) / prevMonthProjects) * 100;

    // 3. Monthly Aggregate for Chart
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const monthlyStats = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
        revenue: { $sum: "$budget" }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    interface GrowthDataItem {
      month: string;
      year: number;
      revenue: number;
    }
    const growthData: GrowthDataItem[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() - 5 + i, 1);
      growthData.push({
        month: monthNames[d.getMonth()],
        year: d.getFullYear(),
        revenue: 0
      });
    }

    monthlyStats.forEach(s => {
      const monthName = monthNames[s._id.month - 1];
      const year = s._id.year;
      const target = growthData.find(g => g.month === monthName && g.year === year);
      if (target) {
        target.revenue = s.revenue;
      }
    });

    // 4. Activity Logs
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5);
    const recentJobs = await Job.find().sort({ createdAt: -1 }).limit(5);

    const activities = [
      ...recentUsers.map(u => ({
        id: u._id,
        type: "person_add",
        title: "New user registered",
        description: `${u.name} joined as a ${u.role}`,
        time: u.createdAt,
      })),
      ...recentJobs.map(j => ({
        id: j._id,
        type: "work",
        title: "New project posted",
        description: j.title || "Untitled Project",
        time: j.createdAt,
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    res.json({
      todayRevenue,
      todaySignups,
      totalRevenue,
      activeUsers,
      totalProjects,
      userGrowth: Math.round(userGrowth),
      projectGrowth: Math.round(projectGrowth),
      growthData: growthData.slice(-6),
      activities
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUsers = async (req: Request, res: Response): Promise<any> => {
  try {
    const { role, status, search } = req.query;
    
    let query: any = {};
    
    // Filtering by role
    if (role === "freelancer") {
      query.role = "talent";
    } else if (role === "client") {
      query.role = "client";
    }
    
    // Filtering by status
    if (status) {
      query.status = status;
    }
    
    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    console.error("Error fetching admin users:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<any> => {
  // Existing updateUserStatus logic ...
  // (Assuming it was correct in line 107-127)
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["active", "pending", "blocked"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const user = await User.findByIdAndUpdate(id, { status }, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { search, type, status } = req.query;
    let query: any = {};

    if (type && type !== "All") query.type = type;
    if (status && status !== "All") query.status = status;

    if (search) {
      query.$or = [
        { txnId: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const transactions = await Transaction.find(query)
      .populate("sender", "name email imageUrl")
      .populate("receiver", "name email imageUrl")
      .sort({ createdAt: -1 });

    const totalRevenue = transactions
      .filter(t => t.status === "Success" && (t.type === "Deposit" || t.type === "Milestone"))
      .reduce((acc, t) => acc + t.amount, 0);

    const pendingEscrow = transactions
      .filter(t => t.status === "Escrow")
      .reduce((acc, t) => acc + t.amount, 0);

    const completedPayouts = transactions
      .filter(t => t.status === "Success" && t.type === "Payout")
      .reduce((acc, t) => acc + t.amount, 0);

    res.json({
      transactions,
      stats: {
        totalRevenue,
        pendingEscrow,
        completedPayouts
      }
    });
  } catch (error: any) {
    console.error("Error fetching admin transactions:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
export const getAdminProjects = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status, search } = req.query;
    let query: any = {};

    if (status && status !== "All") {
      query.status = String(status).toLowerCase();
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { _id: mongoose.isValidObjectId(search) ? search : undefined }
      ].filter(q => q._id !== undefined || !q._id);
    }

    const projects = await Job.find(query)
      .populate("user", "name email")
      .populate("freelancer", "name email imageUrl")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error: any) {
    console.error("Error fetching admin projects:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
