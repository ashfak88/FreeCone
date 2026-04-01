"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const protectedBaseRoutes = [
  "/dashboard",
  "/messages",
  "/notifications",
  "/post-job",
  "/proposals",
  "/send-offer",
  "/profile",
  "/jobs",
  "/talent",
  "/projects"
];

const authRoutes = [
  "/login",
  "/register"
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isProtected = protectedBaseRoutes.some(route => pathname.startsWith(route));

  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (isHydrated) {
      const hasToken = localStorage.getItem("accessToken");
      const isAuthenticated = !!user || !!hasToken;
      const isLoggingIn = typeof window !== 'undefined' ? (window as any).isLoggingInAnimation : false;

      if (isProtected && !isAuthenticated) {
        router.push(`/login`);
      } else if (isAuthRoute && isAuthenticated && !isLoggingIn) {
        // Redirect away from login/register if already authenticated
        router.push(`/`);
      }
    }
  }, [isHydrated, isProtected, isAuthRoute, user, router]);

  // If it's a protected route and we lack authentication, block render
  if (isProtected) {
    if (!isHydrated) return null; // Avoid hydration mismatch

    const hasToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;

    // If there's no user and no token, we are redirecting, so don't render children
    if (!user && !hasToken) {
      return (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }
  }

  // If it's an auth-only route and we ARE authenticated, block render
  if (isAuthRoute) {
    if (!isHydrated) return null;

    const hasToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    const isLoggingIn = typeof window !== 'undefined' ? (window as any).isLoggingInAnimation : false;

    if ((user || hasToken) && !isLoggingIn) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-900 gap-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Redirecting...</p>
        </div>
      );
    }
  }

  return <>{children}</>;
}
