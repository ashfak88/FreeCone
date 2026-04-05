"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import LoadingScreen from "@/components/LoadingScreen";

function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useStore((state) => state.setUser);
  const [showLoader, setShowLoader] = useState(false);
  const [redirectPath, setRedirectPath] = useState("/");

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        // Parse the user object
        const user = JSON.parse(decodeURIComponent(userStr));

        // Save to localStorage and update Zustand store — same as regular login
        localStorage.setItem("accessToken", token);
        
        if (typeof window !== "undefined") {
          (window as any).isLoggingInAnimation = true;
        }

        setUser(user);

        // Determine redirect path based on role (case-insensitive)
        const role = user.role?.toLowerCase();
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          setRedirectPath("/");
          setShowLoader(true);
        }
      } catch (err) {
        console.error("Failed to parse user from Google Auth:", err);
        router.push("/login?error=AuthenticationFailed");
      }
    } else {
      // Missing token or user, redirect back to login
      router.push("/login");
    }
  }, [router, searchParams, setUser]);

  return (
    <>
      {showLoader && <LoadingScreen destination={redirectPath} />}
      <div className={`flex flex-col items-center gap-4 transition-opacity duration-300 ${showLoader ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <div className="w-10 h-10 border-4 border-[#6A6B4C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium animate-pulse">Completing sign in...</p>
      </div>
    </>
  );
}

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#6A6B4C] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium animate-pulse">Loading...</p>
        </div>
      }>
        <AuthSuccessContent />
      </Suspense>
    </div>
  );
}
