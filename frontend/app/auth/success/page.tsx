"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const userStr = searchParams.get("user");

    if (token && userStr) {
      try {
        // Parse the user object
        const user = JSON.parse(decodeURIComponent(userStr));

        // Save to localStorage just like standard login
        localStorage.setItem("accessToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Redirect to home page
        router.push("/");
      } catch (err) {
        console.error("Failed to parse user from Google Auth:", err);
        router.push("/login?error=AuthenticationFailed");
      }
    } else {
      // Missing token or user, redirect back to login
      router.push("/login");
    }
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f8]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#6A6B4C] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-600 font-medium animate-pulse">Completing sign in...</p>
      </div>
    </div>
  );
}
