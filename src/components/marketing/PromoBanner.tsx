import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="bg-[#75415F] px-5 py-20 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-8 md:flex-row md:items-center">

        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E6B8C9]">
            For salon owners
          </p>

          <h2
            className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Your salon deserves to be discovered.
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
            Join SalonBook, showcase your services, manage appointments and
            connect with customers looking for their next beauty experience.
          </p>
        </div>

        <Link
          href="/for-business"
          className="shrink-0 rounded-full bg-white px-8 py-4 text-sm font-semibold text-[#75415F] transition hover:bg-[#F8F0F3]"
        >
          List Your Salon →
        </Link>
      </div>
    </section>
  );
}