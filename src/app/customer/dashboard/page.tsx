"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Customer {
  id: string;
  name: string;
  email: string;
  role: "customer" | "salonOwner" | "admin";
  blocked: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: Customer;
  message?: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const verifyUser = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/v1/auth/me`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load your account. Status: ${response.status}`,
          );
        }

        const result: AuthResponse = await response.json();

        if (!result.success || !result.user) {
          throw new Error("Customer information not found.");
        }

        if (result.user.blocked) {
          await authClient.signOut();
          router.replace("/login");
          return;
        }

        if (result.user.role !== "customer") {
          switch (result.user.role) {
            case "admin":
              router.replace("/admin/dashboard");
              return;

            case "salonOwner":
              router.replace("/salon/dashboard");
              return;

            default:
              router.replace("/login");
              return;
          }
        }

        setUser(result.user);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Customer dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    verifyUser();

    return () => {
      controller.abort();
    };
  }, [router]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const { error: logoutError } = await authClient.signOut();

      if (logoutError) {
        throw new Error(
          logoutError.message || "Unable to sign out.",
        );
      }

      router.replace("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Logout failed. Please try again.",
      );

      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F9]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#75415F]/20 border-t-[#75415F]" />

          <p className="mt-4 text-sm text-gray-500">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F9] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Unable to load dashboard
          </h2>

          <p className="mt-3 text-sm text-red-600">
            {error || "Customer account information is unavailable."}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-[#75415F] px-6 py-3 font-semibold text-white hover:bg-[#593149]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const firstName = user.name.trim().split(" ")[0] || "Customer";

  return (
    <div className="min-h-screen bg-[#FAF7F9]">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-[#75415F]"
          >
            SalonBook
          </Link>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-gray-800">
                {user.name}
              </p>

              <p className="text-xs text-gray-500">
                Customer Account
              </p>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <section className="rounded-3xl bg-gradient-to-r from-[#75415F] to-[#A36B8B] p-8 text-white shadow-sm sm:p-10">
          <p className="text-sm font-medium text-white/80">
            CUSTOMER DASHBOARD
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome back, {firstName}!
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">
            Discover your favourite salons, explore beauty services
            and manage your appointments from one place.
          </p>

          <Link
            href="/salons"
            className="mt-7 inline-flex rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#75415F] transition hover:bg-gray-100"
          >
            Explore Salons
          </Link>
        </section>

        {/* Dashboard Stats */}
        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <DashboardCard
            title="My Appointments"
            description="View and manage your appointments."
            value="View appointments"
            href="/customer/appointments"
            icon="📅"
          />

          <DashboardCard
            title="Find a Salon"
            description="Discover salons and beauty services."
            value="Explore salons"
            href="/salons"
            icon="💇"
          />

          <DashboardCard
            title="My Profile"
            description="Manage your personal account information."
            value="View profile"
            href="/customer/profile"
            icon="👤"
          />
        </section>

        {/* Quick Actions */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-[#35232F]">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Everything you need to manage your salon experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <QuickAction
              title="Book an Appointment"
              description="Find a salon and book your next appointment."
              href="/salons"
            />

            <QuickAction
              title="Appointment History"
              description="Check your previous and upcoming bookings."
              href="/customer/appointments"
            />
          </div>
        </section>

        {/* Account Information */}
        <section className="mt-10 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#35232F]">
            Account Information
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Full Name
              </p>

              <p className="mt-2 font-semibold text-gray-800">
                {user.name}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Email Address
              </p>

              <p className="mt-2 font-semibold text-gray-800">
                {user.email}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Account Type
              </p>

              <p className="mt-2 font-semibold capitalize text-gray-800">
                {user.role}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Account Status
              </p>

              <span className="mt-2 inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                Active
              </span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-12 border-t border-gray-200 py-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SalonBook. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

/* Dashboard Card */

interface DashboardCardProps {
  title: string;
  description: string;
  value: string;
  href: string;
  icon: string;
}

function DashboardCard({
  title,
  description,
  value,
  href,
  icon,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#75415F]/10 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-lg font-bold text-[#35232F]">
        {title}
      </h3>

      <p className="mt-2 min-h-10 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <Link
        href={href}
        className="mt-5 inline-flex text-sm font-bold text-[#75415F] hover:underline"
      >
        {value} →
      </Link>
    </div>
  );
}

/* Quick Action */

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
}

function QuickAction({
  title,
  description,
  href,
}: QuickActionProps) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#75415F]/30 hover:shadow-md"
    >
      <h3 className="font-bold text-[#35232F] transition group-hover:text-[#75415F]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>

      <span className="mt-4 inline-block text-sm font-semibold text-[#75415F]">
        Get Started →
      </span>
    </Link>
  );
}