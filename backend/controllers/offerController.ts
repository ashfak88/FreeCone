import { Request, Response } from "express";
import Offer from "../models/Offer";
import Notification from "../models/Notification";
import { emitToUser } from "../config/socket";

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

    // Create a notification for the freelancer (Received)
    const freelancerNotification = new Notification({
      recipient: recipientId,
      sender: clientId,
      type: "offer",
      relatedId: savedOffer._id,
      title: "New Job Offer",
      message: `${(req as any).user?.name || 'A client'} sent you an offer for '${jobTitle}' with a budget of $${budget}.`,
    });
    await freelancerNotification.save();

    // Emit real-time notification to freelancer
    emitToUser(recipientId, "newNotification", freelancerNotification);

    // Create a notification for the client (Sent)
    const clientNotification = new Notification({
      recipient: clientId,
      sender: clientId,
      type: "offer",
      relatedId: savedOffer._id,
      title: "Offer Sent",
      message: `You sent an offer for '${jobTitle}' to the talent.`,
    });
    await clientNotification.save();

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

// @desc    Update offer status (Accept/Reject)
// @route   PUT /api/offers/:id/status
// @access  Private
export const updateOfferStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'
    const userId = (req as any).user?.id || (req as any).user?._id;

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Use 'accepted' or 'rejected'." });
    }

    const offer = await Offer.findById(id).populate("client", "name") as any;
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Check if current user is the freelancer receiving the offer (recipient)
    if (offer.freelancer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "You are not authorized to update this offer." });
    }

    offer.status = status;
    await offer.save();

    // 1. Update the Client's notification (Sent history)
    const clientNotification = await Notification.findOne({
      recipient: offer.client._id,
      relatedId: offer._id,
      type: "offer"
    });

    if (clientNotification) {
      clientNotification.title = `Offer ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      clientNotification.message = `Your offer for '${offer.jobTitle}' has been ${status}.`;
      clientNotification.isRead = false;
      await clientNotification.save();
      
      // Emit update to client
      emitToUser(offer.client._id, "notificationUpdate", clientNotification);
    }

    // 2. Update the Freelancer's notification (Received history)
    const freelancerNotification = await Notification.findOne({
      recipient: userId,
      relatedId: offer._id,
      type: "offer"
    });

    if (freelancerNotification) {
      freelancerNotification.title = `Offer ${status === 'accepted' ? 'Accepted' : 'Rejected'}`;
      freelancerNotification.message = `You ${status} the offer for '${offer.jobTitle}'.`;
      await freelancerNotification.save();
    }

    res.status(200).json({ message: `Offer ${status} successfully`, offer });
  } catch (error: any) {
    console.error("   [ERROR] UPDATE OFFER STATUS:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};
