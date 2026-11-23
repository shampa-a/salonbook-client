import type { Metadata } from "next";

import Link from "next/link";

import RegisterForm from "@/components/auth/RegisterForm";
import SalonBookLogo from "@/components/brand/SalonBookLogo";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your SalonBook account.",
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen">

      {/* Left Side */}
      <section className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-[#75415F] p-12 text-white lg:flex">

        <SalonBookLogo light />

        <div className="relative z-10 max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[#E6C18B]">
            Beauty & Wellness
          </p>

          <h1 className="text-5xl font-bold leading-tight">
            Your Beauty Journey Starts Here.
          </h1>

          <p className="mt-6 max-w-md leading-8 text-white/75">
            Discover trusted salons, explore beauty services
            and book appointments with ease.
          </p>
        </div>

        <p className="text-sm text-white/60">
          © {new Date().getFullYear()} SalonBook. All rights reserved.
        </p>

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-white/10" />

      </section>

      {/* Right Side */}
      <section className="flex w-full items-center justify-center px-5 py-12 lg:w-1/2 lg:px-12">

        <div className="w-full max-w-md">

          <div className="mb-8 flex items-center justify-between lg:hidden">
            <SalonBookLogo />

            <Link
              href="/"
              className="text-sm text-gray-500 hover:text-[#75415F]"
            >
              Home
            </Link>
          </div>

          <RegisterForm />

        </div>

      </section>

    </main>
  );
}