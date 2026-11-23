


export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#FCFAF9]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-12 lg:py-28">

        <div>
          <span className="inline-block rounded-full border border-[#EAD9E2] bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#75415F]">
            Your beauty, your way
          </span>

          <h1
            className="mt-7 text-5xl font-semibold leading-tight tracking-tight text-[#35232F] sm:text-6xl lg:text-[68px]"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Discover your
            <span className="block italic text-[#A76583]">
              beauty destination.
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-[#77717A] sm:text-lg">
            Find trusted salons, explore beauty treatments and book your next
            appointment with ease. Your perfect self-care experience starts
            here.
          </p>

          <form
            action="/salons"
            method="GET"
            className="mt-9 flex flex-col gap-3 rounded-2xl border border-[#EEE5E9] bg-white p-3 shadow-xl shadow-[#75415F]/5 sm:flex-row"
          >
            <input
              type="text"
              name="location"
              placeholder="Enter your location"
              aria-label="Location"
              className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#AAA1A8]"
            />

            <select
              name="service"
              defaultValue=""
              aria-label="Choose a service"
              className="rounded-xl border-t border-[#EEE5E9] bg-white px-4 py-3 text-sm text-[#77717A] outline-none sm:border-l sm:border-t-0"
            >
              <option value="">All services</option>
              <option value="hair">Hair & Styling</option>
              <option value="facial">Facial & Skincare</option>
              <option value="makeup">Makeup</option>
              <option value="nails">Nails</option>
              <option value="spa">Spa & Massage</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-[#75415F] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#593149]"
            >
              Search
            </button>
          </form>

          <div className="mt-7 flex flex-wrap gap-6 text-sm text-[#77717A]">
            <span>✓ Easy booking</span>
            <span>✓ Discover local salons</span>
            <span>✓ Free for customers</span>
          </div>
        </div>

        <div className="relative">
          <div
            className="h-[420px] rounded-t-[190px] rounded-b-[28px] bg-cover bg-center shadow-2xl shadow-[#75415F]/10 sm:h-[540px]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=90')",
            }}
            role="img"
            aria-label="Beautiful salon interior"
          />

          <div className="absolute -bottom-6 left-5 right-5 rounded-2xl border border-[#EEE5E9] bg-white p-5 shadow-xl sm:left-10 sm:right-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#A76583]">
              Your self-care journey
            </p>

            <p
              className="mt-2 text-xl font-semibold text-[#35232F]"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Make time for yourself.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}