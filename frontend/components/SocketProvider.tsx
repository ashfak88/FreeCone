"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { socketService } from "@/lib/socket";
import toast from "react-hot-toast";

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

      // If already connected, join immediately
      if (socket.connected) {
        handleConnect();
      }

      socket.on("connect", handleConnect);

      const onNewNotification = (notification: any) => {
        console.log("   [SOCKET] New notification received:", notification);
        toast.success(notification.title || "New notification");
        fetchNotifications('received');
      };

      const onNotificationUpdate = (notification: any) => {
        console.log("   [SOCKET] Notification update received:", notification);
        toast.success(notification.title || "Notification updated");
        fetchNotifications('received');
        fetchNotifications('sent');
      };

      socket.on("newNotification", onNewNotification);
      socket.on("notificationUpdate", onNotificationUpdate);

      return () => {
        socket.off("connect", handleConnect);
        socket.off("newNotification", onNewNotification);
        socket.off("notificationUpdate", onNotificationUpdate);
      };
    } else {
      socketService.disconnect();
    }
  }, [user?.id, user?._id, fetchNotifications]);

  return <>{children}</>;
}
