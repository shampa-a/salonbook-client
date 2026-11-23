"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "rejected"
  | "no_show";

type FilterType = "all" | "upcoming" | "past";

interface Appointment {
  id: string;
  salonName: string;
  salonAddress?: string;
  serviceName: string;
  staffName?: string;
  startAt: string;
  endAt?: string;
  status: AppointmentStatus;
  totalPrice: number;
  currency: string;
}

interface AppointmentResponse {
  success: boolean;
  appointments: Appointment[];
  message?: string;
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  confirmed: "bg-green-50 text-green-700 border-green-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  no_show: "bg-gray-100 text-gray-700 border-gray-200",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
  no_show: "No Show",
};

function isUpcoming(appointment: Appointment): boolean {
  return (
    new Date(appointment.startAt).getTime() >= Date.now() &&
    ["pending", "confirmed"].includes(appointment.status)
  );
}

function isValidAppointment(value: unknown): value is Appointment {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  const validStatuses: AppointmentStatus[] = [
    "pending",
    "confirmed",
    "completed",
    "cancelled",
    "rejected",
    "no_show",
  ];

  return (
    typeof item.id === "string" &&
    typeof item.salonName === "string" &&
    typeof item.serviceName === "string" &&
    typeof item.startAt === "string" &&
    !Number.isNaN(Date.parse(item.startAt)) &&
    typeof item.totalPrice === "number" &&
    Number.isFinite(item.totalPrice) &&
    typeof item.currency === "string" &&
    validStatuses.includes(item.status as AppointmentStatus)
  );
}

export default function CustomerAppointmentsPage() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [retryCount, setRetryCount] = useState(0);

  // Fetch customer appointments
  const fetchAppointments = useCallback(
    async (signal: AbortSignal): Promise<void> => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/appointments/my`,
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            signal,
          },
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "You are not authorized to view these appointments.",
          );
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load appointments. Server returned ${response.status}.`,
          );
        }

        const result: AppointmentResponse = await response.json();

        if (
          !result ||
          result.success !== true ||
          !Array.isArray(result.appointments)
        ) {
          throw new Error(
            result?.message || "Invalid appointment response.",
          );
        }

        const validAppointments =
          result.appointments.filter(isValidAppointment);

        if (
          validAppointments.length !== result.appointments.length
        ) {
          throw new Error(
            "The server returned invalid appointment data.",
          );
        }

        if (signal.aborted) {
          return;
        }

        setAppointments(validAppointments);
        setError("");
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        if (signal.aborted) {
          return;
        }

        console.error("Appointment loading error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading appointments.",
        );
      } finally {
        if (!signal.aborted) {
          setLoading(false);
        }
      }
    },
    [router],
  );

  // Load appointments when the page mounts or retry is requested.
  useEffect(() => {
    const controller = new AbortController();

    // The API request is asynchronous. State updates happen after
    // the external API responds, not synchronously in this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAppointments(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchAppointments, retryCount]);

  // Upcoming appointments
  const upcomingAppointments = useMemo(
    () => appointments.filter(isUpcoming),
    [appointments],
  );

  // Completed appointments
  const completedAppointments = useMemo(
    () =>
      appointments.filter(
        (appointment) => appointment.status === "completed",
      ),
    [appointments],
  );

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    switch (filter) {
      case "upcoming":
        return appointments.filter(isUpcoming);

      case "past":
        return appointments.filter(
          (appointment) => !isUpcoming(appointment),
        );

      default:
        return appointments;
    }
  }, [appointments, filter]);

  // Format date
  const formatDate = (date: string): string => {
    return new Intl.DateTimeFormat("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  };

  // Format time
  const formatTime = (date: string): string => {
    return new Intl.DateTimeFormat("en-BD", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(date));
  };

  // Format price
  const formatPrice = (
    price: number,
    currency: string,
  ): string => {
    try {
      return new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: currency || "BDT",
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${price.toFixed(2)} ${currency || "BDT"}`;
    }
  };

  // Retry loading
  const handleRetry = () => {
    setError("");
    setLoading(true);
    setRetryCount((current) => current + 1);
  };

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

          <Link
            href="/customer/dashboard"
            className="text-sm font-semibold text-gray-600 transition hover:text-[#75415F]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Page Heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#35232F]">
              My Appointments
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Manage your salon appointments and booking history.
            </p>
          </div>

          <Link
            href="/salons"
            className="inline-flex items-center justify-center rounded-xl bg-[#75415F] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#593149]"
          >
            + Book Appointment
          </Link>
        </div>

        {/* Statistics */}
        <section className="mt-8 grid gap-5 sm:grid-cols-3">
          <StatCard
            title="Total Appointments"
            value={appointments.length}
            icon="📅"
          />

          <StatCard
            title="Upcoming"
            value={upcomingAppointments.length}
            icon="⏳"
          />

          <StatCard
            title="Completed"
            value={completedAppointments.length}
            icon="✓"
          />
        </section>

        {/* Booking History */}
        <section className="mt-10">

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-[#35232F]">
                Booking History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View all your salon bookings.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {(
                ["all", "upcoming", "past"] as FilterType[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  aria-pressed={filter === item}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
                    filter === item
                      ? "bg-[#75415F] text-white"
                      : "border border-gray-200 bg-white text-gray-600 hover:border-[#75415F]"
                  }`}
                >
                  {item === "all"
                    ? "All"
                    : item === "past"
                      ? "Past"
                      : "Upcoming"}
                </button>
              ))}
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-8 rounded-2xl bg-white p-12 text-center shadow-sm">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#75415F]/20 border-t-[#75415F]" />

              <p className="mt-4 text-sm text-gray-500">
                Loading appointments...
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-white p-8 text-center">
              <div className="text-4xl">⚠️</div>

              <h3 className="mt-4 font-bold text-gray-800">
                Unable to load appointments
              </h3>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={handleRetry}
                className="mt-5 rounded-lg bg-[#75415F] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#593149]"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading &&
            !error &&
            filteredAppointments.length === 0 && (
              <div className="mt-8 rounded-2xl border border-gray-100 bg-white px-6 py-16 text-center shadow-sm">
                <div className="text-5xl">📅</div>

                <h3 className="mt-5 text-xl font-bold text-[#35232F]">
                  No appointments found
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  {filter === "upcoming"
                    ? "You don't have any upcoming appointments."
                    : filter === "past"
                      ? "You don't have any past appointments."
                      : "You haven't booked any salon appointments yet."}
                </p>

                <Link
                  href="/salons"
                  className="mt-6 inline-flex rounded-xl bg-[#75415F] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#593149]"
                >
                  Explore Salons
                </Link>
              </div>
            )}

          {/* Appointment List */}
          {!loading &&
            !error &&
            filteredAppointments.length > 0 && (
              <div className="mt-6 space-y-5">
                {filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    formatDate={formatDate}
                    formatTime={formatTime}
                    formatPrice={formatPrice}
                  />
                ))}
              </div>
            )}

        </section>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 bg-white py-6 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} SalonBook. All rights reserved.
        </p>
      </footer>

    </div>
  );
}

// Statistics Card
function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <span className="text-2xl">{icon}</span>
      </div>

      <p className="mt-4 text-3xl font-bold text-[#35232F]">
        {value}
      </p>
    </div>
  );
}

// Appointment Card
function AppointmentCard({
  appointment,
  formatDate,
  formatTime,
  formatPrice,
}: {
  appointment: Appointment;
  formatDate: (date: string) => string;
  formatTime: (date: string) => string;
  formatPrice: (price: number, currency: string) => string;
}) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">

      {/* Salon Information */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h3 className="text-lg font-bold text-[#35232F]">
            {appointment.salonName}
          </h3>

          {appointment.salonAddress && (
            <p className="mt-1 text-sm text-gray-500">
              📍 {appointment.salonAddress}
            </p>
          )}
        </div>

        <span
          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_STYLES[appointment.status]}`}
        >
          {STATUS_LABELS[appointment.status]}
        </span>
      </div>

      {/* Appointment Details */}
      <div className="mt-6 grid gap-5 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">

        <div>
          <p className="text-xs font-medium text-gray-400">
            SERVICE
          </p>

          <p className="mt-2 font-semibold text-gray-800">
            {appointment.serviceName}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            DATE
          </p>

          <p className="mt-2 font-semibold text-gray-800">
            {formatDate(appointment.startAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            TIME
          </p>

          <p className="mt-2 font-semibold text-gray-800">
            {formatTime(appointment.startAt)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400">
            TOTAL PRICE
          </p>

          <p className="mt-2 font-semibold text-[#75415F]">
            {formatPrice(
              appointment.totalPrice,
              appointment.currency,
            )}
          </p>
        </div>

      </div>

      {/* Staff Information */}
      {appointment.staffName && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-400">
            STAFF MEMBER
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-700">
            {appointment.staffName}
          </p>
        </div>
      )}

      {/* End Time */}
      {appointment.endAt && (
        <div className="mt-4 text-xs text-gray-400">
          Ends at: {formatTime(appointment.endAt)}
        </div>
      )}

    </article>
  );
}