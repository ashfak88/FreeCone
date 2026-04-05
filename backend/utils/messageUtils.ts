import Message from "../models/Message";
import Conversation from "../models/Conversation";
import { getIO } from "../config/socket";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";

const logToFile = (message: string) => {
  // Use a fallback to process.stdout if fs fails
  try {
    const logPath = path.join(process.cwd(), "message_debug.log");
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
  } catch (e) {}
  console.log(`[MESSAGE_DEBUG] ${message}`);
};

/**
 * Sends a system-generated or automated message between two users
 * @param senderId The ID of the user "sending" the automated message
 * @param recipientId The ID of the user receiving the message
 * @param content The text content of the message
 */
export const sendSystemMessage = async (
  senderId: string | mongoose.Types.ObjectId,
  recipientId: string | mongoose.Types.ObjectId,
  content: string
): Promise<void> => {
  try {
    // 1. Find or create conversation
    const sender = new mongoose.Types.ObjectId(senderId.toString());
    const recipient = new mongoose.Types.ObjectId(recipientId.toString());

    logToFile(`START sendSystemMessage: sender=${sender}, recipient=${recipient}, content="${content.substring(0, 25)}"`);

    let conversation = await Conversation.findOne({
      participants: { $all: [sender, recipient] },
    });
    
    if (conversation) {
        logToFile(`FOUND existing conversation: ${conversation._id}`);
        // Ensure not deleted
        await Conversation.findByIdAndUpdate(conversation._id, {
            $pull: { deletedBy: { $in: [sender, recipient] } }
        });
    } else {
        logToFile(`CREATING new conversation for ${sender} & ${recipient}`);
        conversation = new Conversation({
          participants: [sender, recipient],
          updatedAt: new Date(),
        });
        await conversation.save();
        logToFile(`NEW conversation saved: ${conversation._id}`);
    }

    // 2. Create the automated message
    const message = new Message({
      conversationId: conversation._id,
      sender: senderId,
      content,
      readBy: [senderId],
    });

    await message.save();

    // 3. Update conversation last message
    conversation.lastMessage = message._id;
    conversation.updatedAt = new Date();
    await conversation.save();
    logToFile(`Conversation ready: ${conversation._id}`);

    // 4. Prepare populated payloads for Socket.IO
    const populatedConversation = await Conversation.findById(conversation._id)
      .populate("participants", "name imageUrl")
      .populate("lastMessage");

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name imageUrl");

    // 5. Emit via Socket.IO
    const io = getIO();
    const recipientStr = recipientId.toString();
    const senderStr = senderId.toString();

    // Emit to both participants to keep UI in sync
    io.to(recipientStr).emit("newMessage", populatedMessage);
    io.to(recipientStr).emit("newConversation", populatedConversation);
    
    io.to(senderStr).emit("newMessage", populatedMessage);
    io.to(senderStr).emit("newConversation", populatedConversation);

    logToFile(`SUCCESS: Message sent and emitted. sender: ${senderStr}, recipient: ${recipientStr}`);
  } catch (error: any) {
    logToFile(`ERROR: ${error.message}`);
    console.error("[ERROR] Failed to send system message:", error.message);
  }
};
