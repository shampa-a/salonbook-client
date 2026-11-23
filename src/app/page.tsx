export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6">
      <section className="max-w-2xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-primary">
          SalonBook
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
          Beauty bookings, made simple.
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted">
          Discover salons, explore beauty services, and book appointments
          with confidence.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <button className="rounded-lg bg-primary px-7 py-3 font-semibold text-white transition hover:bg-primary-dark">
            Explore Salons
          </button>

          <button className="rounded-lg border border-border px-7 py-3 font-semibold text-foreground transition hover:bg-secondary">
            List Your Salon
          </button>
        </div>

        <p className="mt-16 text-sm text-muted">
          SalonBook Platform
        </p>
      </section>
    </main>
  );
}