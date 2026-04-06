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

      const handleConnect = () => {
        socket.emit("join", userId);
        console.log("   [SOCKET] Joined personal room:", userId);
      };

      if (socket.connected) {
        handleConnect();
      }

      socket.on("connect", handleConnect);

      const onNewNotification = (notification: any) => {
        console.log("   [SOCKET] New notification received:", notification);
        // Add popup for NEW notifications (status: 'new')
        useNotificationStore.getState().addNotification({
          title: notification.title || "New Notification",
          message: notification.message || "You have a new update",
          type: "success"
        });
        fetchNotifications('received');
      };

      const onNotificationUpdate = (notification: any) => {
        console.log("   [SOCKET] Notification update received (Status Change):", notification);
        // SILENT UPDATE: We refresh the notification list but do NOT show a popup.
        fetchNotifications('received');
        fetchNotifications('sent');
      };

      const onNewMessage = (message: any) => {
        console.log("   [SOCKET] New message received:", message);
        useStore.getState().addMessage(message);
        useStore.getState().fetchConversations();
        
        // Show popup ONLY for incoming messages that are NOT from the user themselves
        if (message.sender?._id !== user?.id && message.sender?._id !== user?._id) {
          useNotificationStore.getState().addNotification({
            title: `New Message from ${message.sender?.name || 'User'}`,
            message: message.content,
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

      socket.on("newNotification", onNewNotification);
      socket.on("notificationUpdate", onNotificationUpdate);
      socket.on("newMessage", onNewMessage);
      socket.on("conversationUpdate", onConversationUpdate);
      socket.on("messageUpdate", onMessageUpdate);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("newNotification", onNewNotification);
        socket.off("notificationUpdate", onNotificationUpdate);
        socket.off("newMessage", onNewMessage);
        socket.off("conversationUpdate", onConversationUpdate);
        socket.off("messageUpdate", onMessageUpdate);
      };
    } else {
      socketService.disconnect();
    }
  }, [user?.id, user?._id, fetchNotifications]);

  return <>{children}</>;
}
