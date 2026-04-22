"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Bell, CheckCircle, AlertCircle, MessageSquare, Shield } from "lucide-react";
import { Notification, NotificationType, useNotificationStore } from "@/lib/notificationStore";
import { cn } from "@/lib/utils";

const iconMap: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  error: <AlertCircle className="w-4 h-4 text-rose-400" />,
  info: <Bell className="w-4 h-4 text-sky-400" />,
  warning: <AlertCircle className="w-4 h-4 text-amber-400" />,
  message: <MessageSquare className="w-4 h-4 text-indigo-400" />,
  audit: <Shield className="w-4 h-4 text-orange-400" />,
};

export default function NotificationItem({ notification }: { notification: Notification }) {
  const { removeNotification } = useNotificationStore();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, x: 50 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative w-80 overflow-hidden rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl transition-all",
        "bg-slate-900/85 dark:bg-slate-900/90"
      )}
    >
      {/* Windows Acrylic Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
            <span className="material-symbols-outlined text-[14px] text-primary font-bold">rocket_launch</span>
          </div>
          <span className="text-[11px] font-bold tracking-tight text-white/50 uppercase">FreeCone</span>
        </div>
        <button
          onClick={() => removeNotification(notification.id)}
          className="p-1 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4 flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {iconMap[notification.type]}
        </div>
        <div className="flex flex-col min-w-0 pr-2">
          <h4 className="text-[14px] font-bold text-white leading-tight mb-1 truncate">
            {notification.title}
          </h4>
          <p className="text-[13px] text-white/70 leading-snug line-clamp-3">
            {notification.message}
          </p>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 w-full h-[2px] opacity-30",
          notification.type === 'success' && "bg-emerald-500",
          notification.type === 'error' && "bg-rose-500",
          notification.type === 'info' && "bg-sky-500",
          notification.type === 'warning' && "bg-amber-500",
          notification.type === 'message' && "bg-indigo-500",
          notification.type === 'audit' && "bg-orange-500"
        )}
      />
    </motion.div>
  );
}
