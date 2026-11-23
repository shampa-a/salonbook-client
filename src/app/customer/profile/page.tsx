"use client";

import { FormEvent, useEffect, useState } from "react";
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

export default function CustomerProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<Customer | null>(null);

  const [name, setName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProfile = async () => {
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
            `Unable to load profile. Status: ${response.status}`,
          );
        }

        const result: AuthResponse = await response.json();

        if (!result.success || !result.user) {
          throw new Error("Customer profile not found.");
        }

        if (result.user.blocked) {
          await authClient.signOut();
          router.replace("/login");
          return;
        }

        if (result.user.role !== "customer") {
          if (result.user.role === "admin") {
            router.replace("/admin/dashboard");
          } else {
            router.replace("/salon/dashboard");
          }

          return;
        }

        setUser(result.user);
        setName(result.user.name);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        console.error("Profile loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => controller.abort();
  }, [router]);

  const handleUpdateProfile = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const trimmedName = name.trim();

    if (trimmedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (trimmedName.length > 100) {
      setError("Name cannot exceed 100 characters.");
      return;
    }

    if (trimmedName === user?.name) {
      setError("No changes were made.");
      return;
    }

    try {
      setSaving(true);

      const { error: updateError } = await authClient.updateUser({
        name: trimmedName,
      });

      if (updateError) {
        throw new Error(
          updateError.message || "Unable to update your profile.",
        );
      }

      setUser((current) =>
        current
          ? {
              ...current,
              name: trimmedName,
            }
          : current,
      );

      setSuccess("Your profile has been updated successfully.");
    } catch (err) {
      console.error("Profile update error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Profile update failed.",
      );
    } finally {
      setSaving(false);
    }
  };

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
          : "Logout failed.",
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
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F9] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">
            Unable to load profile
          </h2>

          <p className="mt-3 text-sm text-red-600">
            {error || "Your account information is unavailable."}
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

  return (
    <div className="min-h-screen bg-[#FAF7F9]">
      {/* Header */}

      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/customer/dashboard"
            className="text-2xl font-bold text-[#75415F]"
          >
            SalonBook
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/customer/dashboard"
              className="text-sm font-semibold text-gray-600 hover:text-[#75415F]"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {loggingOut ? "Signing out..." : "Logout"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Page Heading */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#35232F]">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage your personal information and account details.
          </p>
        </div>

        {/* Profile Card */}

        <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {/* Profile Header */}

          <div className="bg-gradient-to-r from-[#75415F] to-[#A36B8B] px-6 py-10 text-white sm:px-8">
            <div className="flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {user.name}
                </h2>

                <p className="mt-1 text-sm text-white/80">
                  {user.email}
                </p>

                <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                  Customer Account
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}

          <div className="p-6 sm:p-8">
            <div className="mb-7">
              <h3 className="text-xl font-bold text-[#35232F]">
                Personal Information
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Update your personal account information.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
              >
                {success}
              </div>
            )}

            <form
              onSubmit={handleUpdateProfile}
              className="space-y-6"
            >
              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                  autoComplete="name"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
                />
              </div>

              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500 outline-none"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Email address cannot be changed from this page.
                </p>
              </div>

              {/* Role */}

              <div>
                <label
                  htmlFor="role"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Account Type
                </label>

                <input
                  id="role"
                  type="text"
                  value="Customer"
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                />
              </div>

              {/* Status */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Account Status
                </label>

                <span className="inline-flex rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
                  Active
                </span>
              </div>

              {/* Submit */}

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#75415F] px-7 py-3 font-semibold text-white transition hover:bg-[#593149] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>

                <Link
                  href="/customer/dashboard"
                  className="rounded-xl border border-gray-200 px-7 py-3 text-center font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </section>

        {/* Footer */}

        <footer className="mt-10 border-t border-gray-200 py-6 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} SalonBook. All rights reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}