"use client";

import { useState } from "react";
import Link from "next/link";
import SalonBookLogo from "@/components/brand/SalonBookLogo";

const navigation = [
  { label: "Discover", href: "/salons" },
  { label: "Categories", href: "/categories" },
  { label: "How It Works", href: "/how-it-works" },
];

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#eee5e9] bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[82px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">

        {/* Brand */}
        <SalonBookLogo />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-9 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-sm font-medium text-[#625963] transition hover:text-[#75415F]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/login"
            className="text-sm font-semibold text-[#493B47] transition hover:text-[#75415F]"
          >
            Sign in
          </Link>

          <Link
            href="/for-business"
            className="rounded-full border border-[#75415F] px-6 py-3 text-sm font-semibold text-[#75415F] transition hover:bg-[#75415F] hover:text-white"
          >
            List your salon
          </Link>

          <Link
            href="/signup"
            className="rounded-full bg-[#75415F] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#75415F]/15 transition hover:bg-[#593149]"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#eee5e9] text-[#75415F] lg:hidden"
        >
          {menuOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6L6 18M6 6L18 18" />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M4 7H20M4 12H20M4 17H20" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="border-t border-[#eee5e9] bg-white px-5 py-6 lg:hidden">
          <nav className="flex flex-col gap-5">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="text-base font-medium text-[#493B47]"
              >
                {item.label}
              </Link>
            ))}

            <hr className="border-[#eee5e9]" />

            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="font-semibold text-[#75415F]"
            >
              Sign in
            </Link>

            <Link
              href="/for-business"
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-[#75415F] px-5 py-3 text-center font-semibold text-[#75415F]"
            >
              List your salon
            </Link>

            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-[#75415F] px-5 py-3 text-center font-semibold text-white"
            >
              Get Started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}