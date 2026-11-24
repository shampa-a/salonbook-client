import Link from "next/link";

const categories = [
  {
    name: "Hair & Styling",
    description: "Haircuts, styling and treatments",
    icon: "✂",
    color: "bg-[#F7EAF0]",
    href: "/categories/hair-styling",
  },
  {
    name: "Facial & Skincare",
    description: "Facials and skincare treatments",
    icon: "✧",
    color: "bg-[#F3EDE8]",
    href: "/categories/facial-skincare",
  },
  {
    name: "Makeup",
    description: "Professional makeup services",
    icon: "♡",
    color: "bg-[#F8E8EC]",
    href: "/categories/makeup",
  },
  {
    name: "Nails",
    description: "Manicure and pedicure",
    icon: "❀",
    color: "bg-[#F0EAF5]",
    href: "/categories/nails",
  },
  {
    name: "Spa & Massage",
    description: "Relaxation and wellness",
    icon: "♧",
    color: "bg-[#EAF1EC]",
    href: "/categories/spa-massage",
  },
  {
    name: "Hair Coloring",
    description: "Professional hair coloring",
    icon: "✦",
    color: "bg-[#F5EFE5]",
    href: "/categories/hair-coloring",
  },
];

const featuredSalons = [
  {
    name: "The Beauty Lounge",
    location: "Gulshan, Dhaka",
    rating: "4.9",
    reviews: 120,
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=900&q=85",
    tag: "Popular",
  },
  {
    name: "Blush Beauty Studio",
    location: "Banani, Dhaka",
    rating: "4.8",
    reviews: 96,
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=900&q=85",
    tag: "Top Rated",
  },
  {
    name: "The Hair Atelier",
    location: "Dhanmondi, Dhaka",
    rating: "4.9",
    reviews: 85,
    image:
      "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d2?w=900&q=85",
    tag: "Featured",
  },
];

const popularServices = [
  {
    name: "Women's Haircut",
    category: "Hair & Styling",
    duration: "45 minutes",
    image:
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=700&q=85",
  },
  {
    name: "Facial Treatment",
    category: "Facial & Skincare",
    duration: "60 minutes",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=700&q=85",
  },
  {
    name: "Manicure",
    category: "Nails",
    duration: "40 minutes",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=700&q=85",
  },
  {
    name: "Relaxing Massage",
    category: "Spa & Massage",
    duration: "60 minutes",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=700&q=85",
  },
];

const steps = [
  {
    number: "01",
    title: "Discover",
    description:
      "Explore beauty salons and wellness centres near your location.",
    icon: "⌕",
  },
  {
    number: "02",
    title: "Choose",
    description:
      "Compare services, prices, ratings and available appointment times.",
    icon: "♡",
  },
  {
    number: "03",
    title: "Book",
    description:
      "Choose your preferred service and reserve an appointment.",
    icon: "▣",
  },
];

const benefits = [
  {
    title: "Easy Discovery",
    description:
      "Find salons, beauty professionals and wellness services in one place.",
    icon: "⌕",
  },
  {
    title: "Convenient Booking",
    description:
      "Choose a suitable date and time without making unnecessary phone calls.",
    icon: "▣",
  },
  {
    title: "Transparent Pricing",
    description:
      "Explore service prices before making your appointment.",
    icon: "৳",
  },
  {
    title: "Your Bookings in One Place",
    description:
      "Keep track of your appointments and booking history.",
    icon: "♡",
  },
];

const testimonials = [
  {
    name: "Sarah Ahmed",
    location: "Dhaka",
    review:
      "Finding a salon and comparing services is much easier when everything is available in one place.",
    rating: 5,
  },
  {
    name: "Nusrat Jahan",
    location: "Dhaka",
    review:
      "I love the idea of choosing a service and booking an appointment without calling multiple salons.",
    rating: 5,
  },
  {
    name: "Farhana Rahman",
    location: "Dhaka",
    review:
      "A convenient way to discover beauty services and plan my self-care appointments.",
    rating: 5,
  },
];

const faqs = [
  {
    question: "What is SalonBook?",
    answer:
      "SalonBook is a platform designed to help customers discover beauty salons, explore services and book appointments online.",
  },
  {
    question: "Is SalonBook free for customers?",
    answer:
      "Customers can browse salons and use the customer booking features without paying a SalonBook platform subscription.",
  },
  {
    question: "How can I register my salon?",
    answer:
      "Salon owners can register through the business registration page. After submitting the required information, the salon can be reviewed by the platform administration team.",
  },
  {
    question: "Can I cancel or reschedule an appointment?",
    answer:
      "The platform will support appointment management. Cancellation and rescheduling will follow the applicable salon booking policies.",
  },
  {
    question: "How can I contact a salon?",
    answer:
      "Customers will be able to view available salon contact information on the salon profile.",
  },
];

export default function DiscoverySections() {
  return (
    <>
      {/* Popular Categories */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
                Explore our services
              </p>

              <h2 className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Browse by category
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#77717A]">
                Find the perfect beauty and wellness service for yourself.
              </p>
            </div>

            <Link
              href="/categories"
              className="text-sm font-semibold text-[#75415F] hover:text-[#593149]"
            >
              Explore all categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group rounded-2xl border border-[#EEE5E9] p-5 transition duration-300 hover:-translate-y-1 hover:border-[#D8B9C9] hover:shadow-lg"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl text-[#75415F] ${category.color}`}
                >
                  {category.icon}
                </div>

                <h3 className="mt-5 text-sm font-semibold text-[#35232F]">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-[#77717A]">
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Salons */}
      <section className="bg-[#FCFAF9] px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
                Discover amazing places
              </p>

              <h2
                className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
                style={{ fontFamily: "Georgia, serif" }}
              >
                Featured salons
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#77717A]">
                Explore beauty destinations worth discovering.
              </p>
            </div>

            <Link
              href="/salons"
              className="text-sm font-semibold text-[#75415F] hover:text-[#593149]"
            >
              View all salons →
            </Link>
          </div>

          <div className="grid gap-7 md:grid-cols-2 lg:grid-cols-3">
            {featuredSalons.map((salon) => (
              <article
                key={salon.name}
                className="overflow-hidden rounded-3xl border border-[#EEE5E9] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="relative h-60 bg-cover bg-center"
                  style={{ backgroundImage: `url("${salon.image}")` }}
                  role="img"
                  aria-label={`${salon.name} salon interior`}
                >
                  <span className="absolute left-5 top-5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#75415F] shadow-sm">
                    {salon.tag}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#35232F]">
                        {salon.name}
                      </h3>

                      <p className="mt-2 text-sm text-[#77717A]">
                        {salon.location}
                      </p>
                    </div>

                    <div className="rounded-xl bg-[#F8F0F3] px-3 py-2 text-sm font-semibold text-[#75415F]">
                      ★ {salon.rating}
                    </div>
                  </div>

                  <p className="mt-4 text-xs text-[#77717A]">
                    {salon.reviews} customer reviews
                  </p>

                  <Link
                    href="/salons"
                    className="mt-6 block rounded-full border border-[#75415F] py-3 text-center text-sm font-semibold text-[#75415F] transition hover:bg-[#75415F] hover:text-white"
                  >
                    Explore Salon
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section
  id="categories"
  className="scroll-mt-24 bg-white px-5 py-20 sm:px-8 lg:px-12"
>
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
              Find your treatment
            </p>

            <h2
              className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Popular beauty services
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#77717A]">
              Discover treatments and services for your next appointment.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {popularServices.map((service) => (
              <Link
                href="/salons"
                key={service.name}
                className="group overflow-hidden rounded-2xl border border-[#EEE5E9] bg-white"
              >
                <div
                  className="h-52 bg-cover bg-center transition duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${service.image}")` }}
                  role="img"
                  aria-label={service.name}
                />

                <div className="p-5">
                  <p className="text-xs font-medium text-[#A76583]">
                    {service.category}
                  </p>

                  <h3 className="mt-2 text-base font-semibold text-[#35232F]">
                    {service.name}
                  </h3>

                  <p className="mt-3 text-xs text-[#77717A]">
                    {service.duration}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
  id="how-it-works"
  className="scroll-mt-24 bg-[#F8F0F3] px-5 py-20 sm:px-8 lg:px-12"
>
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
              Simple and convenient
            </p>

            <h2
              className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Your next appointment in three steps
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#77717A]">
              Discover, choose and book your favourite beauty services.
            </p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white text-3xl text-[#75415F] shadow-sm">
                  {step.icon}
                </div>

                <p className="mt-6 text-xs font-semibold tracking-widest text-[#A76583]">
                  STEP {step.number}
                </p>

                <h3 className="mt-3 text-xl font-semibold text-[#35232F]">
                  {step.title}
                </h3>

                <p className="mx-auto mt-3 max-w-xs text-sm leading-7 text-[#77717A]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SalonBook */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
              The SalonBook experience
            </p>

            <h2
              className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Beauty booking made easier
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-[#EEE5E9] p-7"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F8F0F3] text-2xl text-[#75415F]">
                  {benefit.icon}
                </div>

                <h3 className="mt-5 text-base font-semibold text-[#35232F]">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-[#77717A]">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section
  id="discover"
  className="scroll-mt-24 bg-[#FCFAF9] px-5 py-20 sm:px-8 lg:px-12"
>
        <div className="mx-auto max-w-[1440px]">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
              Customer experiences
            </p>

            <h2
              className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              A better way to plan self-care
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-2xl border border-[#EEE5E9] bg-white p-7"
              >
                <div
                  className="text-lg tracking-widest text-[#C18A9D]"
                  aria-label={`${testimonial.rating} out of 5 stars`}
                >
                  {"★".repeat(testimonial.rating)}
                </div>

                <p className="mt-5 text-sm leading-7 text-[#625963]">
                  &ldquo;{testimonial.review}&rdquo;
                </p>

                <div className="mt-7 border-t border-[#EEE5E9] pt-5">
                  <h3 className="text-sm font-semibold text-[#35232F]">
                    {testimonial.name}
                  </h3>

                  <p className="mt-1 text-xs text-[#77717A]">
                    {testimonial.location}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A76583]">
              Need some help?
            </p>

            <h2
              className="mt-3 text-3xl font-semibold text-[#35232F] sm:text-4xl"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[#EEE5E9] bg-white p-6"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#35232F]">
                  {faq.question}

                  <span className="text-xl text-[#75415F] transition group-open:rotate-45">
                    +
                  </span>
                </summary>

                <p className="mt-4 text-sm leading-7 text-[#77717A]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}