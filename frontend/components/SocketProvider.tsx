"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { socketService } from "@/lib/socket";
import { useNotificationStore } from "@/lib/notificationStore";

export default function SocketProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, fetchNotifications } = useStore();

  useEffect(() => {
    const userId = user?.id || user?._id;
    
    if (userId) {
      const socket = socketService.connect();
      
      // Crucial: Use the service's joinRoom so it re-joins on automatic reconnect
      socketService.joinRoom(userId);

      const onNewNotification = (notification: any) => {
        console.log("   [SOCKET] New notification received:", notification);
        useNotificationStore.getState().addNotification({
          title: notification.title || "New Notification",
          message: notification.message || "You have a new update",
          type: "success"
        });
        fetchNotifications('received');
      };

      const onNotificationUpdate = (notification: any) => {
        console.log("   [SOCKET] Notification update received (Status Change):", notification);
        fetchNotifications('received');
        fetchNotifications('sent');
      };

      const onNewMessage = (message: any) => {
        console.log("   [SOCKET] New message received:", message);
        useStore.getState().addMessage(message);
        useStore.getState().fetchConversations();
        
        if (
          message.sender?._id !== user?.id &&
          message.sender?._id !== user?._id &&
          !message.metadata?.silent
        ) {
          // Fix: Check for voice message type to show descriptive text instead of the URL
          const displayMessage = message.type === 'voice' 
            ? "🎤 Voice Message" 
            : message.content;

          useNotificationStore.getState().addNotification({
            title: `New Message from ${message.sender?.name || 'User'}`,
            message: displayMessage,
            type: "message"
          });
        }
      };
      
      const onMessageUpdate = (message: any) => {
        console.log("   [SOCKET] Message update received:", message);
        useStore.getState().updateMessageLocally(message);
      };

      const onConversationUpdate = (conversation: any) => {
        console.log("   [SOCKET] Conversation update received:", conversation);
        useStore.getState().updateConversationLocally(conversation);
      };

      const onNewConversation = (conversation: any) => {
        console.log("   [SOCKET] New conversation received:", conversation);
        useStore.getState().fetchConversations();
      };

      const onMessagesRead = ({ conversationId, readerId }: { conversationId: string, readerId: string }) => {
        console.log("   [SOCKET] Messages read in conversation:", conversationId, "by user:", readerId);
        useStore.getState().markMessagesAsReadLocally(conversationId, readerId);
      };

      // Status Update Listeners for real-time UI synchronization
      const onStatusUpdate = () => {
        console.log("   [SOCKET] Triggering silent refresh due to status update");
        useStore.getState().fetchMyJobs();
        useStore.getState().fetchMyProposals();
        useStore.getState().fetchReceivedProposals();
        useStore.getState().fetchOffers();
        fetchNotifications('received');
      };

      socket.on("newNotification", onNewNotification);
      socket.on("notificationUpdate", onNotificationUpdate);
      socket.on("newMessage", onNewMessage);
      socket.on("conversationUpdate", onConversationUpdate);
      socket.on("newConversation", onNewConversation);
      socket.on("messageUpdate", onMessageUpdate);
      socket.on("messagesRead", onMessagesRead);
      
      // Listen for all possible status update events from backend
      socket.on("proposalUpdate", onStatusUpdate);
      socket.on("offerUpdate", onStatusUpdate);
      socket.on("escrowUpdate", onStatusUpdate);
      socket.on("projectUpdate", onStatusUpdate);

      return () => {
        socket.off("newNotification", onNewNotification);
        socket.off("notificationUpdate", onNotificationUpdate);
        socket.off("newMessage", onNewMessage);
        socket.off("conversationUpdate", onConversationUpdate);
        socket.off("newConversation", onNewConversation);
        socket.off("messageUpdate", onMessageUpdate);
        socket.off("messagesRead", onMessagesRead);
        
        socket.off("proposalUpdate", onStatusUpdate);
        socket.off("offerUpdate", onStatusUpdate);
        socket.off("escrowUpdate", onStatusUpdate);
        socket.off("projectUpdate", onStatusUpdate);
      };
    } else {
      socketService.disconnect();
    }
  }, [user?.id, user?._id, fetchNotifications]);

  return <>{children}</>;
}
