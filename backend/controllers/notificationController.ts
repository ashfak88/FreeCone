import { Response } from "express";
import Notification from "../models/Notification";
import Proposal from "../models/Proposal";
import Offer from "../models/Offer";

// GET all notifications for the authenticated user (received or sent)
export const getNotifications = async (req: any, res: Response): Promise<void> => {
  try {
    const { dir } = req.query;
    const query = dir === 'sent' 
      ? { sender: req.user._id, recipient: req.user._id } 
      : { recipient: req.user._id, sender: { $ne: req.user._id } };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .populate("sender", "name imageUrl")
      .populate("recipient", "name imageUrl");

    // Filter out orphaned notifications
    const validatedNotifications = [];
    for (const n of notifications) {
      if (n.type === 'proposal' && n.relatedId) {
        const proposalExists = await Proposal.exists({ _id: n.relatedId });
        if (!proposalExists) continue;
      } else if (n.type === 'offer' && n.relatedId) {
        const offerExists = await Offer.exists({ _id: n.relatedId });
        if (!offerExists) continue;
      }
      validatedNotifications.push(n);
    }

    res.status(200).json(validatedNotifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Server error while fetching notifications" });
  }
};

// MARK a notification as read
export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      res.status(404).json({ message: "Notification not found" });
      return;
    }
    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Server error while updating notification" });
  }
};

// MARK all notifications as read
export const markAllAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Error marking all as read:", error);
    res.status(500).json({ message: "Server error while updating notifications" });
  }
};
