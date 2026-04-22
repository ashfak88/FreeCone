import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import Job from "../models/Job";
import Transaction from "../models/Transaction";
import Complaint from "../models/Complaint";
import Notification from "../models/Notification";
import SystemConfig from "../models/Config";
import { emitToUser } from "../config/socket";

export const getDashboardStats = async (req: Request, res: Response): Promise<any> => {
  try {

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfPrevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const todayRevenueResult = await Transaction.aggregate([
      { $match: { createdAt: { $gte: today }, type: "Commission", status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const todayRevenue = todayRevenueResult[0]?.total || 0;

    const yesterdayRevenueResult = await Transaction.aggregate([
      { $match: { createdAt: { $gte: yesterday, $lt: today }, type: "Commission", status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const yesterdayRevenue = yesterdayRevenueResult[0]?.total || 0;

    const todayRevGrowth = yesterdayRevenue === 0 ? (todayRevenue > 0 ? 100 : 0) :
      ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    const totalRevenueResult = await Transaction.aggregate([
      { $match: { type: "Commission", status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const totalVolumeResult = await Transaction.aggregate([
      { $match: { status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalVolume = totalVolumeResult[0]?.total || 0;

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isProfileComplete: true });
    const todaySignups = await User.countDocuments({ createdAt: { $gte: today } });
    const yesterdaySignups = await User.countDocuments({ createdAt: { $gte: yesterday, $lt: today } });

    const todaySignupGrowth = yesterdaySignups === 0 ? (todaySignups > 0 ? 100 : 0) :
      ((todaySignups - yesterdaySignups) / yesterdaySignups) * 100;

    const currentMonthUsers = await User.countDocuments({ createdAt: { $gte: startOfMonth } });
    const prevMonthUsers = await User.countDocuments({
      createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth }
    });
    const userGrowth = prevMonthUsers === 0 ? (currentMonthUsers > 0 ? 100 : 0) :
      ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100;

    const currentMonthRevenueResult = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, type: "Commission", status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const prevMonthRevenueResult = await Transaction.aggregate([
      { $match: { createdAt: { $gte: startOfPrevMonth, $lt: startOfMonth }, type: "Commission", status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const currentMonthRevenue = currentMonthRevenueResult[0]?.total || 0;
    const prevMonthRevenue = prevMonthRevenueResult[0]?.total || 0;
    const revenueGrowth = prevMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) :
      ((currentMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100;

    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyStats = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo }, type: "Commission", status: "Success" } },
      {
        $group: {
          _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const growthData: { month: string; year: number; revenue: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
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
      if (target) target.revenue = s.revenue;
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
      todayRevGrowth: Math.round(todayRevGrowth),
      todaySignups,
      todaySignupGrowth: Math.round(todaySignupGrowth),
      totalRevenue,
      totalVolume: Math.round(totalVolume),
      activeUsers,
      userGrowth: Math.round(userGrowth),
      revenueGrowth: Math.round(revenueGrowth),
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

    if (role === "freelancer") {
      query.role = "talent";
    } else if (role === "client") {
      query.role = "client";
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 })
    res.json(users)
  } catch (error: any) {
    console.error("Error fetching admin users:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getUserDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const id = req.params.id as string;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid User ID format" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const jobsCount = await Job.countDocuments({
      $or: [{ user: id }, { freelancer: id }]
    });

    const transactions = await Transaction.find({
      $or: [{ sender: id }, { receiver: id }]
    }).sort({ createdAt: -1 }).limit(10);

    const totalVolumeResult = await Transaction.aggregate([
      { $match: { $or: [{ sender: new mongoose.Types.ObjectId(id) }, { receiver: new mongoose.Types.ObjectId(id) }], status: "Success" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    const totalVolume = totalVolumeResult[0]?.total || 0;

    res.json({
      user,
      stats: {
        jobsCount,
        totalVolume
      },
      recentTransactions: transactions
    });
  } catch (error: any) {
    console.error("Error fetching admin user detail:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<any> => {
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

export const updateUserRole = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["admin", "user", "client", "talent"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
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
      .filter(t => t.status === "Success" && (t.type === "Deposit" || t.type === "Milestone" || t.type === "Commission"))
      .reduce((acc, t) => acc + t.amount, 0);

    const platformCommission = transactions
      .filter(t => t.status === "Success" && t.type === "Commission")
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
        platformCommission,
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
      const searchStr = search as string;
      query.$or = [
        { title: { $regex: searchStr, $options: "i" } },
        { category: { $regex: searchStr, $options: "i" } },
        { _id: mongoose.isValidObjectId(searchStr) ? searchStr : undefined }
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

export const getAdminProjectDetail = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const project = await Job.findById(id)
      .populate("user", "name email imageUrl role")
      .populate("freelancer", "name email imageUrl role");
    
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Also fetch related transactions
    const transactions = await Transaction.find({ job: id })
      .populate("sender", "name email")
      .populate("receiver", "name email");

    res.json({ project, transactions });
  } catch (error: any) {
    console.error("Error fetching admin project detail:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateAdminProjectStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "active", "completed", "disputed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const project = await Job.findByIdAndUpdate(id, { status }, { new: true })
      .populate("user", "name email")
      .populate("freelancer", "name email");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error: any) {
    console.error("Error updating admin project status:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAdminComplaints = async (req: Request, res: Response): Promise<any> => {
  try {
    const { status, category } = req.query;
    let query: any = {};

    if (status && status !== "All") query.status = status;
    if (category && category !== "All") query.category = category;

    const complaints = await Complaint.find(query)
      .populate("user", "name email imageUrl")
      .populate("reportedUser", "name email imageUrl")
      .sort({ createdAt: -1 });

    res.json(complaints);
  } catch (error: any) {
    console.error("Error fetching admin complaints:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateComplaintStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "investigating", "resolved", "dismissed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true })
      .populate("user", "name email")
      .populate("reportedUser", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Create a real-time notification for the user who filed the complaint
    try {
      const admin = (req as any).user;
      const recipientId = (complaint.user as any)._id || complaint.user;
      
      const notification = new Notification({
        recipient: recipientId,
        sender: admin?._id || admin?.id || recipientId, 
        type: "audit",
        title: "Complaint Update",
        message: `The status of your complaint ("${complaint.subject}") has been updated to: ${status.toUpperCase()}.`,
        relatedId: complaint._id
      });

      const savedNotification = await notification.save();

      // Emit real-time notification via Socket.io
      emitToUser(recipientId.toString(), 'newNotification', savedNotification);
    } catch (notifError: any) {
      console.error("Error creating complaint update notification:", notifError.message);
      // We don't fail the request if notification fails, but we log it
    }

    res.json(complaint);
  } catch (error: any) {
    console.error("Error updating complaint status:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// System Settings
export const getSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let commission = await SystemConfig.findOne({ key: "platformCommission" });
    if (!commission) {
      commission = await SystemConfig.create({ key: "platformCommission", value: 5 });
    }

    let maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });
    if (!maintenance) {
      maintenance = await SystemConfig.create({ key: "maintenanceMode", value: false });
    }

    res.json({
      platformCommission: commission.value,
      maintenanceMode: maintenance.value
    });
  } catch (error: any) {
    console.error("   [ERROR] GET_SETTINGS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const { platformCommission, maintenanceMode } = req.body;
    console.log("   [ADMIN] Update Settings Request:", req.body);

    const updates = [];

    if (platformCommission !== undefined) {
      updates.push(SystemConfig.findOneAndUpdate(
        { key: "platformCommission" },
        { value: parseFloat(platformCommission) },
        { new: true, upsert: true }
      ));
    }

    if (maintenanceMode !== undefined) {
      updates.push(SystemConfig.findOneAndUpdate(
        { key: "maintenanceMode" },
        { value: maintenanceMode === true || maintenanceMode === "true" },
        { new: true, upsert: true }
      ));
    }

    await Promise.all(updates);

    const commission = await SystemConfig.findOne({ key: "platformCommission" });
    const maintenance = await SystemConfig.findOne({ key: "maintenanceMode" });

    res.json({
      message: "Settings updated successfully",
      platformCommission: commission?.value || 5,
      maintenanceMode: maintenance?.value || false
    });
  } catch (error: any) {
    console.error("   [ERROR] UPDATE_SETTINGS:", error);
    res.status(500).json({ message: "Server Error", details: error.message });
  }
};

export const broadcastMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, message } = req.body;
    const adminId = (req as any).user.id;

    if (!title || !message) {
      return res.status(400).json({ message: "Title and message are required" });
    }

    const users = await User.find({ status: { $ne: "blocked" }, role: { $ne: "admin" } }).select("_id");

    const notifications = users.map(u => ({
      recipient: u._id,
      sender: adminId,
      type: "other",
      title,
      message,
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);

      // Emit socket events to each user
      users.forEach(u => {
        emitToUser(u._id.toString(), "newNotification", {
          title,
          message,
          type: "other",
          createdAt: new Date()
        });
      });
    }

    res.status(200).json({
      message: `Broadcast successfully sent to ${users.length} users.`,
      count: users.length
    });
  } catch (error: any) {
    console.error("   [ERROR] BROADCAST_MESSAGE:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

export const notifyUser = async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId, title, message } = req.body;
    const adminId = (req as any).user.id;

    if (!userId || !title || !message) {
      return res.status(400).json({ message: "UserId, title and message are required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notification = new Notification({
      recipient: user._id,
      sender: adminId,
      type: "other",
      title,
      message,
    });

    const savedNotification = await notification.save();

    // Emit real-time notification via Socket.io
    emitToUser(user._id.toString(), 'newNotification', savedNotification);

    res.status(200).json({ message: "Notification sent successfully" });
  } catch (error: any) {
    console.error("   [ERROR] NOTIFY_USER:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
