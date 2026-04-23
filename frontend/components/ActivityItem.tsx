"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  FileText, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  Wallet, 
  CircleDot 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItemProps {
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  onClick?: () => void;
}

const typeConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  proposal: {
    icon: FileText,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  offer: {
    icon: Send,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  payment: {
    icon: Wallet,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  message: {
    icon: MessageSquare,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  completion_request: {
    icon: CheckCircle2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  confirmation: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  other: {
    icon: CircleDot,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
  },
};

export default function ActivityItem({ type, title, message, createdAt, isRead, onClick }: ActivityItemProps) {
  const config = typeConfig[type] || typeConfig.other;
  const Icon = config.icon;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex gap-4 p-4 hover:bg-slate-50/80 transition-all rounded-xl border border-transparent hover:border-slate-100 group",
        onClick ? "cursor-pointer" : "cursor-default"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
        config.bgColor
      )}>
        <Icon className={cn("w-5 h-5", config.color)} />
      </div>

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 truncate">{title}</h4>
          <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {message}
        </p>
      </div>

      {!isRead && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
      )}
    </div>
  );
}
