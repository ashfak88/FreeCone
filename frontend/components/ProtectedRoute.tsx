"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";

const userOnlyProtectedRoutes = [
  "/dashboard",
  "/messages",
  "/notifications",
  "/post-job",
  "/proposals",
  "/send-offer",
  "/profile",
];

const adminOnlyPrefix = "/admin";

const authRoutes = [
  "/login",
  "/register"
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, fetchProfile } = useStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const isUserProtectedRoute = userOnlyProtectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = pathname.startsWith(adminOnlyPrefix);
  const isAuthRoute = authRoutes.includes(pathname);

  useEffect(() => {
    if (isHydrated) {
      const hasToken = localStorage.getItem("accessToken");
      const isAuthenticated = !!user || !!hasToken;
      const isLoggingIn = typeof window !== 'undefined' ? (window as any).isLoggingInAnimation : false;

      // Sync user if token exists but user state is missing
      if (hasToken && !user) {
        fetchProfile();
      }

      if (!isAuthenticated) {
        if (isUserProtectedRoute || isAdminRoute) {
          router.push(`/login`);
        }
      } else {
        // We HAVE a session (token and/or user object)
        const isAdmin = user?.role?.toLowerCase() === "admin";

        if (isAdminRoute && user && !isAdmin) {
          // Standard user trying to access admin panel
          router.push("/");
        } else if (!isAdminRoute && !isAuthRoute && isAdmin) {
          // Admin trying to access standard user side (isolated to Admin Panel)
          router.push("/admin/dashboard");
        } else if (isAuthRoute && !isLoggingIn) {
          // FORCE REDIRECT from auth pages if we have a session
          if (user) {
            router.push(isAdmin ? "/admin/dashboard" : "/");
          } else if (hasToken) {
            // Default to home if user object isn't here yet but token IS
            router.push("/");
          }
        }
      }
    }
  }, [isHydrated, isAdminRoute, isAuthRoute, user, router, pathname, fetchProfile]);

  // Combined protection check for rendering
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const isDenied = isHydrated && user && (
    (isAdminRoute && !isAdmin) ||
    (!isAdminRoute && !isAuthRoute && isAdmin)
  );

  const isBlocked = (isUserProtectedRoute || isAdminRoute) && !user && (typeof window !== 'undefined' && !localStorage.getItem("accessToken"));

  if (isDenied || isBlocked) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
