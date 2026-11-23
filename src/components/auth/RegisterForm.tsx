"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { getDashboardPath } from "@/lib/auth-redirect";

export default function RegisterForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const passwordValid =
    password.length >= 6 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password);

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!passwordValid) {
      setError(
        "Password must contain at least 6 characters, one uppercase letter and one lowercase letter.",
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const { error: registerError } =
        await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          image: image.trim() || undefined,
        });

      if (registerError) {
        setError(registerError.message || "Registration failed.");
        return;
      }

      setSuccess("Account created successfully!");

      const dashboardPath = await getDashboardPath();

      router.replace(dashboardPath);
      router.refresh();
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setError("");
      setGoogleLoading(true);

      await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/auth/callback`,
      });
    } catch (err) {
      console.error("Google registration error:", err);
      setError("Google authentication failed.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#35232F]">
          Create Your Account
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Join SalonBook and discover beauty services near you.
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

      <form onSubmit={handleRegister} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            autoComplete="name"
            maxLength={100}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
          />
        </div>

        <div>
          <label htmlFor="image" className="mb-2 block text-sm font-semibold text-gray-700">
            Profile Image URL (Optional)
          </label>
          <input
            id="image"
            type="url"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="https://example.com/profile.jpg"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
          />

          <div className="mt-2 space-y-1 text-xs">
            <p className={password.length >= 6 ? "text-green-600" : "text-gray-400"}>
              ✓ At least 6 characters
            </p>
            <p className={/[A-Z]/.test(password) ? "text-green-600" : "text-gray-400"}>
              ✓ One uppercase letter
            </p>
            <p className={/[a-z]/.test(password) ? "text-green-600" : "text-gray-400"}>
              ✓ One lowercase letter
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#75415F] focus:ring-2 focus:ring-[#75415F]/10"
          />
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full rounded-xl bg-[#75415F] px-5 py-3.5 font-semibold text-white transition hover:bg-[#593149] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-sm text-gray-400">OR</span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        onClick={handleGoogleRegister}
        disabled={loading || googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 px-5 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
      >
        <GoogleIcon />
        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
      </button>

      <p className="mt-7 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[#75415F] hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
        transform="translate(0 3)"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.24 5.48-4.7 7.18l7.2 5.59c4.2-3.88 6.54-9.59 6.54-17.24Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59a14.4 14.4 0 0 1 0-9.18l-7.98-6.2a24 24 0 0 0 0 21.58l7.98-6.2Z"
        transform="translate(0 3)"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.91-5.8l-7.2-5.59c-2 1.35-4.56 2.14-8.71 2.14-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.2C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}