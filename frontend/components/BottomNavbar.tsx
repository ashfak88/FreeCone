"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dash", icon: "dashboard", href: "/admin/dashboard" },
  { label: "Users", icon: "group", href: "/admin/users" },
  { label: "Projects", icon: "account_tree", href: "/admin/projects" },
  { label: "Payment", icon: "payments", href: "/admin/payments" },
  { label: "Audit", icon: "receipt_long", href: "/admin/audit" },
  { label: "Config", icon: "settings", href: "/admin/config" },
];

export default function BottomNavbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-4 pointer-events-none">
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pointer-events-auto flex items-center gap-1 p-2 bg-primary dark:bg-primary backdrop-blur-xl border border-white/20 rounded-[32px] shadow-2xl shadow-primary/20"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex flex-col items-center justify-center min-w-[70px] h-14 rounded-3xl transition-all duration-300",
                isActive ? "text-white" : "text-white/60 hover:text-white"
              )}
            >
              {/* Active Background Glow */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white/20 rounded-3xl border border-white/30"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <span className={cn(
                "material-symbols-outlined text-[22px] transition-transform duration-300 group-hover:scale-110",
                isActive ? "fill-1" : ""
              )}>
                {item.icon}
              </span>
              
              <span className="text-[8px] font-black uppercase tracking-[0.15em] mt-0.5 opacity-80 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>

              {/* Active Dot */}
              {isActive && (
                <motion.div 
                  layoutId="activeDot"
                  className="absolute -bottom-1.5 size-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </motion.nav>
    </div>
  );
}
