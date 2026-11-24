"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "salonOwner" | "admin";
  blocked: boolean;
}

interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
}

interface SalonApplicationForm {
  name: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  city: string;
  state: string;
  area: string;
  street: string;
  postalCode: string;
  description: string;
}

const initialForm: SalonApplicationForm = {
  name: "",
  email: "",
  phone: "",
  website: "",
  country: "Bangladesh",
  city: "",
  state: "",
  area: "",
  street: "",
  postalCode: "",
  description: "",
};

export default function ForBusinessPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const [form, setForm] =
    useState<SalonApplicationForm>(initialForm);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Check authentication
  useEffect(() => {
    const controller = new AbortController();

    async function verifyAuthentication() {
      try {
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
          setUser(null);
          return;
        }

        if (!response.ok) {
          throw new Error(
            "Unable to verify your account. Please try again.",
          );
        }

        const result: AuthResponse = await response.json();

        if (!result.success || !result.user) {
          throw new Error("Account information not available.");
        }

        if (result.user.blocked) {
          setAuthError(
            "Your account has been blocked. Please contact support.",
          );
          return;
        }

        setUser(result.user);

        setForm((previous) => ({
          ...previous,
          email: result.user!.email,
        }));
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        setAuthError(
          err instanceof Error
            ? err.message
            : "Something went wrong.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    verifyAuthentication();

    return () => controller.abort();
  }, []);

  // Handle form fields
  function handleChange(
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Submit salon application
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!user) {
      setError("Please sign in before submitting your application.");
      return;
    }

    if (!form.name.trim()) {
      setError("Please enter your salon name.");
      return;
    }

    if (!form.email.trim()) {
      setError("Please enter your business email.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your business phone number.");
      return;
    }

    if (!form.city.trim() || !form.area.trim()) {
      setError("Please enter your city and area.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/v1/salons/applications`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
            website: form.website.trim(),
            description: form.description.trim(),
            address: {
              country: form.country.trim(),
              city: form.city.trim(),
              state: form.state.trim(),
              area: form.area.trim(),
              street: form.street.trim(),
              postalCode: form.postalCode.trim(),
            },
          }),
        },
      );

      const result = await response.json();

      if (response.status === 401) {
        setUser(null);
        throw new Error(
          "Your session has expired. Please sign in again.",
        );
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to submit your application.",
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F9]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#75415F]/20 border-t-[#75415F]" />

          <p className="mt-4 text-sm text-gray-500">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  // Authentication error
  if (authError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7F9] px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-[#35232F]">
            Unable to continue
          </h1>

          <p className="mt-3 text-sm text-red-600">
            {authError}
          </p>

          <Link
            href="/"
            className="mt-6 inline-block rounded-xl bg-[#75415F] px-6 py-3 font-semibold text-white"
          >
            Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Sign-in required
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FAF7F9] px-4">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#75415F]/10 text-3xl">
            🏪
          </div>

          <h1 className="mt-6 text-2xl font-bold text-[#35232F]">
            List Your Salon on SalonBook
          </h1>

          <p className="mt-3 text-sm leading-6 text-gray-500">
            Please sign in to your account before submitting
            your salon application.
          </p>

          <div className="mt-7 grid gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#75415F] px-6 py-3 font-semibold text-white transition hover:bg-[#593149]"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Create an Account
            </Link>

            <Link
              href="/"
              className="mt-2 text-sm font-medium text-[#75415F] hover:underline"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
            <span className="hidden text-sm text-gray-600 sm:block">
              {user.name}
            </span>

            <Link
              href="/"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-10 text-center">
          <span className="inline-flex rounded-full bg-[#75415F]/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#75415F]">
            Business Partnership
          </span>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-[#35232F] sm:text-4xl">
            Bring Your Salon to SalonBook
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-gray-500 sm:text-base">
            Create your salon listing, reach more customers
            and manage your bookings through SalonBook.
            Submit your business information to get started.
          </p>
        </div>

        {/* Information cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <InfoCard
            number="01"
            title="Submit Details"
            description="Tell us about your salon and services."
          />

          <InfoCard
            number="02"
            title="Admin Review"
            description="Our team reviews your application."
          />

          <InfoCard
            number="03"
            title="Get Approved"
            description="Access salon owner features after approval."
          />
        </div>

        {/* Success message */}
        {success ? (
          <div className="rounded-3xl border border-green-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl text-green-700">
              ✓
            </div>

            <h2 className="mt-6 text-2xl font-bold text-[#35232F]">
              Application Submitted!
            </h2>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-gray-600">
              Thank you for choosing SalonBook. Your salon
              application has been received successfully.
              Our administration team will review your
              application.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">
                Application Status: Pending
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Your salon will not be published until an
                administrator approves it.
              </p>
            </div>

            <Link
              href="/"
              className="mt-8 inline-flex rounded-xl bg-[#75415F] px-7 py-3 font-semibold text-white transition hover:bg-[#593149]"
            >
              Return to Home
            </Link>
          </div>
        ) : (
          /* Application form */
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-10"
          >
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#35232F]">
                Salon Information
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Enter accurate information about your business.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Business details */}
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Salon / Business Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Glamour Beauty Salon"
                required
              />

              <FormField
                label="Business Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="business@example.com"
                required
              />

              <FormField
                label="Phone Number"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+8801XXXXXXXXX"
                required
              />

              <FormField
                label="Website"
                name="website"
                type="url"
                value={form.website}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            {/* Address */}
            <div className="mb-6 mt-10">
              <h2 className="text-xl font-bold text-[#35232F]">
                Business Address
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Where can customers find your salon?
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                label="Country"
                name="country"
                value={form.country}
                onChange={handleChange}
                required
              />

              <FormField
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Dhaka"
                required
              />

              <FormField
                label="State / Division"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="e.g. Dhaka Division"
              />

              <FormField
                label="Area / Neighborhood"
                name="area"
                value={form.area}
                onChange={handleChange}
                placeholder="e.g. Dhanmondi"
                required
              />

              <FormField
                label="Street Address"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="House, road and street"
              />

              <FormField
                label="Postal Code"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                placeholder="e.g. 1205"
              />
            </div>

            {/* Description */}
            <div className="mt-8">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                About Your Salon
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={5}
                maxLength={2000}
                placeholder="Describe your salon, the services you offer and what makes your business special..."
                className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
              />

              <p className="mt-2 text-right text-xs text-gray-400">
                {form.description.length}/2000 characters
              </p>
            </div>

            {/* Notice */}
            <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">
                Important: Application Approval
              </p>

              <p className="mt-2 text-sm leading-6 text-amber-800">
                Submitting this form does not automatically
                create a salon owner account. An administrator
                must review and approve your application before
                salon owner privileges are granted.
              </p>
            </div>

            {/* Submit */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center rounded-xl bg-[#75415F] px-6 py-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#593149] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Submitting Application..."
                  : "Submit Salon Application"}
              </button>

              <p className="mt-4 text-center text-xs text-gray-400">
                By submitting, you confirm that the business
                information provided is accurate.
              </p>
            </div>
          </form>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-6">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} SalonBook. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

/* Reusable form field */

interface FormFieldProps {
  label: string;
  name: keyof SalonApplicationForm;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-gray-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        maxLength={name === "description" ? 2000 : undefined}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
      />
    </div>
  );
}

/* Information card */

interface InfoCardProps {
  number: string;
  title: string;
  description: string;
}

function InfoCard({
  number,
  title,
  description,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <span className="text-sm font-bold text-[#A36B8B]">
        STEP {number}
      </span>

      <h3 className="mt-3 font-bold text-[#35232F]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}