"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getDashboardPath } from "@/lib/auth-redirect";

export default function AuthCallbackPage() {
  const router = useRouter();

  const [message, setMessage] = useState(
    "Verifying your account...",
  );

  useEffect(() => {
    let active = true;

    const verifySession = async () => {
      try {
        const dashboardPath = await getDashboardPath();

        if (!active) return;

        if (dashboardPath === "/login") {
          setMessage("Unable to verify your account. Redirecting...");
        }

        router.replace(dashboardPath);
        router.refresh();

      } catch {
        if (!active) return;

        setMessage("Authentication failed. Redirecting to login.");

        router.replace("/login");
      }
    };

    void verifySession();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fcfaf9] px-5">

      <div className="text-center">

        <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-[#75415F]/20 border-t-[#75415F]" />

        <h1 className="text-xl font-bold text-[#35232F]">
          SalonBook
        </h1>

        <p className="mt-2 text-sm text-gray-500">
          {message}
        </p>

      </div>

    </main>
  );
}