"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileCompletionBanner() {
  const pathname = usePathname();
  
  // Don't show the banner on the profile page itself to avoid redundancy
  if (pathname === "/profile") return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-3 text-primary text-sm font-bold">
        <span className="material-symbols-outlined shrink-0">info</span>
        <p>Your profile is incomplete. Complete it now to appear in our talent marketplace and start winning work!</p>
      </div>
      <Link 
        href="/profile"
        className="px-5 py-2 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all shrink-0 whitespace-nowrap"
      >
        Update Profile
      </Link>
    </div>
  );
}
