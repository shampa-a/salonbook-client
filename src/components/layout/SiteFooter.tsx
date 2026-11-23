import Link from "next/link";
import SalonBookLogo from "@/components/brand/SalonBookLogo";

export default function SiteFooter() {
  return (
    <footer className="bg-[#291F27] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-12">

        <div>
          <SalonBookLogo light />

          <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">
            Discover beauty. Find your favourite salon. Book your perfect
            self-care moment with SalonBook.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Explore</h3>

          <div className="mt-5 flex flex-col gap-4 text-sm text-white/60">
            <Link href="/salons" className="hover:text-white">Discover Salons</Link>
            <Link href="/categories" className="hover:text-white">Categories</Link>
            <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">For Business</h3>

          <div className="mt-5 flex flex-col gap-4 text-sm text-white/60">
            <Link href="/for-business" className="hover:text-white">List Your Salon</Link>
            <Link href="/login" className="hover:text-white">Business Login</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Support</h3>

          <div className="mt-5 flex flex-col gap-4 text-sm text-white/60">
            <Link href="/contact" className="hover:text-white">Contact Us</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col justify-between gap-4 px-5 py-6 text-xs text-white/40 sm:px-8 md:flex-row lg:px-12">
          <p>© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
          <p>Made for your beauty and wellness journey.</p>
        </div>
      </div>
    </footer>
  );
}