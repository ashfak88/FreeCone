import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  updatedAt: Date;
  favoritedBy: mongoose.Types.ObjectId[];
  deletedBy: mongoose.Types.ObjectId[];
}

const ConversationSchema: Schema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  updatedAt: { type: Date, default: Date.now },
  favoritedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  deletedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
});

export default mongoose.models.Conversation || mongoose.model<IConversation>("Conversation", ConversationSchema);
