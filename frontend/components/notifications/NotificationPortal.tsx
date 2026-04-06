"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useNotificationStore } from "@/lib/notificationStore";
import NotificationItem from "./NotificationItem";

export default function NotificationPortal() {
  const { notifications } = useNotificationStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-4 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem notification={notification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
