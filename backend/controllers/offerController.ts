import { Request, Response } from "express";
import Offer from "../models/Offer";
import Notification from "../models/Notification";

// @desc    Create a new offer
// @route   POST /api/offers
// @access  Private (Client only)
export const createOffer = async (req: Request, res: Response): Promise<any> => {
  console.log("   >>> [DEBUG] CREATE OFFER HIT! <<<");
  try {
    const { freelancerId, talentId, jobTitle, description, budget } = req.body;
    const clientId = (req as any).user?.id || (req as any).user?._id;

    if (!clientId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const recipientId = freelancerId || talentId;

    if (!recipientId || !jobTitle || !description || !budget) {
      return res.status(400).json({ message: "Please provide all required fields (talentId/freelancerId, jobTitle, description, budget)" });
    }

    const offer = new Offer({
      client: clientId,
      freelancer: recipientId,
      jobTitle,
      description,
      budget,
    });

    const savedOffer = await offer.save();

    // Create a notification for the freelancer
    const newNotification = new Notification({
      recipient: recipientId,
      sender: clientId,
      type: "offer",
      relatedId: savedOffer._id,
      title: "New Job Offer",
      message: `${(req as any).user?.name || 'A client'} sent you an offer for '${jobTitle}' with a budget of $${budget}.`,
    });
    await newNotification.save();

    res.status(201).json(savedOffer);
  } catch (error: any) {
    console.error("   [ERROR] CREATE OFFER:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get offers for the logged in user (freelancer or client)
// @route   GET /api/offers
// @access  Private
export const getMyOffers = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Find offers where user is either client or freelancer
    const offers = await Offer.find({
      $or: [{ client: userId }, { freelancer: userId }],
    })
      .populate("client", "name email imageUrl")
      .populate("freelancer", "name email imageUrl role")
      .sort({ createdAt: -1 });

    res.status(200).json(offers);
  } catch (error: any) {
    console.error("   [ERROR] GET OFFERS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
