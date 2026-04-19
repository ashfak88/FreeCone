import { Request, Response } from "express";
import Message from "../models/Message";
import Conversation from "../models/Conversation";
import { getIO } from "../config/socket";
import mongoose from "mongoose";

export const getConversations = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
      deletedBy: { $ne: userId } // Hide if deleted by current user
    })
      .populate("participants", "name imageUrl")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    res.status(200).json(conversations);
  } catch (error: any) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ message: "Server error while fetching conversations" });
  }
};

export const deleteConversation = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    await Conversation.findByIdAndUpdate(conversationId, {
      $addToSet: { deletedBy: userId }
    });

    res.status(200).json({ message: "Conversation deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting conversation:", error);
    res.status(500).json({ message: "Server error while deleting conversation." });
  }
};

export const deleteAllConversations = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user._id;

    await Conversation.updateMany(
      { participants: userId },
      { $addToSet: { deletedBy: userId } }
    );

    res.status(200).json({ message: "All conversations deleted successfully." });
  } catch (error: any) {
    console.error("Error deleting all conversations:", error);
    res.status(500).json({ message: "Server error while deleting all conversations." });
  }
};

export const toggleFavorite = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      res.status(404).json({ message: "Conversation not found." });
      return;
    }

    const hasFavorited = conversation.favoritedBy.includes(userId);
    if (hasFavorited) {
      conversation.favoritedBy = conversation.favoritedBy.filter((id: any) => id.toString() !== userId.toString());
    } else {
      conversation.favoritedBy.push(userId);
    }
    
    await conversation.save();
    
    // Return updated conversation to hydrate UI
    const populatedConversation = await Conversation.findById(conversationId)
      .populate("participants", "name imageUrl")
      .populate("lastMessage");

    res.status(200).json(populatedConversation);
  } catch (error: any) {
    console.error("Error toggling favorite:", error);
    res.status(500).json({ message: "Server error while toggling favorite." });
  }
};

export const getMessages = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate("sender", "name imageUrl")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Server error while fetching messages" });
  }
};

export const sendMessage = async (req: any, res: Response): Promise<void> => {
  try {
    const { recipientId, content, conversationId, type, metadata } = req.body;
    const senderId = req.user._id;

    console.log("   [SERVER] Full Request Body:", JSON.stringify(req.body, null, 2));
    console.log(`   [SERVER] sendMessage from ${senderId}: type=${type || 'text'}, recipient=${recipientId}, convId=${conversationId}`);

    if (!content || (!recipientId && !conversationId)) {
      res.status(400).json({ 
        message: "Missing required fields: content, and either recipientId or conversationId",
        receivedBody: req.body 
      });
      return;
    }

    let conversation;
    
    if (conversationId) {
      if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        res.status(400).json({ message: "Invalid Conversation ID format" });
        return;
      }
      conversation = await Conversation.findById(conversationId);
    } else if (recipientId) {
      if (!mongoose.Types.ObjectId.isValid(recipientId)) {
        res.status(400).json({ message: "Invalid Recipient ID format" });
        return;
      }
      conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          participants: [senderId, recipientId],
        });
        await conversation.save();
      }
    }

    if (!conversation) {
      res.status(404).json({ message: "Conversation thread not discovered or created" });
      return;
    }

    // Create message
    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      content,
      type: type || "text",
      metadata: metadata || {},
      readBy: [senderId],
    });

    await message.save();

    // Update conversation last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();

    // Find actual recipient from participants
    const actualRecipientId = conversation.participants.find((p: any) => p.toString() !== senderId.toString());

    // Prepare socket payloads
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name imageUrl")
      .populate("lastMessage");

    const populatedMessage = await Message.findById(message._id).populate("sender", "name imageUrl");

    // Socket Emissions
    const io = getIO();
    if (actualRecipientId) {
      const recipientStr = actualRecipientId.toString();
      console.log(`   [SERVER] Emitting to recipient ${recipientStr}`);
      io.to(recipientStr).emit("newMessage", populatedMessage);
      io.to(recipientStr).emit("newConversation", populatedConversation);
    }

    res.status(201).json(populatedMessage);
  } catch (error: any) {
    console.error("   [SERVER ERROR] sendMessage:", error);
    res.status(500).json({ 
      message: "Server encountered an error while processing your message",
      error: error.message 
    });
  }
};

export const markAsRead = async (req: any, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // 1. Update database
    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    // 2. Find conversation to know who to notify
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      const io = getIO();
      // Notify other participants that messages were read
      conversation.participants.forEach((participantId: any) => {
        if (participantId.toString() !== userId.toString()) {
          io.to(participantId.toString()).emit("messagesRead", {
            conversationId,
            readerId: userId
          });
        }
      });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error: any) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Server error while marking as read" });
  }
};
