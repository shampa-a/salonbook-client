"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getApplications,
  approveApplication,
  rejectApplication,
} from "@/lib/admin-api";

import type {
  SalonApplication,
  Pagination,
} from "@/lib/admin-api";

// ======================================================
// CONSTANTS AND TYPES
// ======================================================

const PAGE_LIMIT = 20;

type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

const STATUS_FILTERS: {
  label: string;
  value: ApplicationStatus;
}[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const INITIAL_PAGINATION: Pagination = {
  total: 0,
  page: 1,
  limit: PAGE_LIMIT,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

// ======================================================
// HELPER FUNCTIONS
// ======================================================

function formatDate(date?: string | null): string {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getStatusClasses(status: string): string {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";

    case "approved":
      return "bg-green-100 text-green-800";

    case "rejected":
      return "bg-red-100 text-red-800";

    case "suspended":
      return "bg-gray-200 text-gray-800";

    default:
      return "bg-gray-100 text-gray-700";
  }
}

/**
 * Always returns a valid pagination object.
 * Protects the UI from incomplete backend responses.
 */
function normalizePagination(
  value: Partial<Pagination> | null | undefined,
  currentPage: number,
  itemCount: number
): Pagination {
  const total =
    typeof value?.total === "number" && Number.isFinite(value.total)
      ? Math.max(0, value.total)
      : itemCount;

  const limit =
    typeof value?.limit === "number" &&
    Number.isFinite(value.limit) &&
    value.limit > 0
      ? value.limit
      : PAGE_LIMIT;

  const calculatedTotalPages = Math.max(
    1,
    Math.ceil(total / limit)
  );

  const totalPages =
    typeof value?.totalPages === "number" &&
    Number.isFinite(value.totalPages) &&
    value.totalPages > 0
      ? Math.max(1, value.totalPages)
      : calculatedTotalPages;

  const page =
    typeof value?.page === "number" &&
    Number.isFinite(value.page) &&
    value.page > 0
      ? value.page
      : currentPage;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

// ======================================================
// MAIN COMPONENT
// ======================================================

export default function AdminApplicationsPage() {
  // Application data
  const [applications, setApplications] = useState<
    SalonApplication[]
  >([]);

  // Pagination is NEVER undefined.
  const [pagination, setPagination] = useState<Pagination>(
    INITIAL_PAGINATION
  );

  // Filters
  const [status, setStatus] =
    useState<ApplicationStatus>("pending");

  const [page, setPage] = useState(1);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Rejection dialog
  const [rejectingApplication, setRejectingApplication] =
    useState<SalonApplication | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");

  // Reload trigger
  const [reloadKey, setReloadKey] = useState(0);

  // ====================================================
  // FETCH APPLICATIONS
  // ====================================================

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      try {
        setLoading(true);
        setError("");

        const response = await getApplications(
          status,
          page,
          PAGE_LIMIT
        );

        if (!active) return;

        const data = response?.data;

        if (!data || !Array.isArray(data.applications)) {
          throw new Error(
            "Invalid application data received from the server."
          );
        }

        const receivedApplications = data.applications;

        setApplications(receivedApplications);

        // Normalize pagination instead of trusting
        // that the backend always returns valid pagination.
        const safePagination = normalizePagination(
          data.pagination,
          page,
          receivedApplications.length
        );

        setPagination(safePagination);
      } catch (err) {
        if (!active) return;

        console.error("Failed to load applications:", err);

        setApplications([]);
        setPagination(INITIAL_PAGINATION);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load salon applications."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadApplications();

    return () => {
      active = false;
    };
  }, [status, page, reloadKey]);

  // ====================================================
  // STATUS FILTER
  // ====================================================

  function handleStatusChange(newStatus: ApplicationStatus) {
    if (newStatus === status) return;

    setStatus(newStatus);
    setPage(1);
    setSuccess("");
    setError("");
  }

  // ====================================================
  // PAGINATION
  // ====================================================

  function handlePageChange(newPage: number) {
    // Safe even if the backend returns incomplete data.
    const totalPages = pagination?.totalPages ?? 1;

    if (
      !Number.isInteger(newPage) ||
      newPage < 1 ||
      newPage > totalPages ||
      newPage === page
    ) {
      return;
    }

    setPage(newPage);
    setSuccess("");
    setError("");
  }

  // ====================================================
  // APPROVE APPLICATION
  // ====================================================

  async function handleApprove(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this salon application?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await approveApplication(id);

      setSuccess(
        "Salon application approved successfully."
      );

      // Reload current list.
      setReloadKey((previous) => previous + 1);
    } catch (err) {
      console.error("Approval failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to approve salon application."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ====================================================
  // OPEN REJECTION DIALOG
  // ====================================================

  function openRejectDialog(application: SalonApplication) {
    setRejectingApplication(application);
    setRejectionReason("");
    setError("");
    setSuccess("");
  }

  // ====================================================
  // CLOSE REJECTION DIALOG
  // ====================================================

  function closeRejectDialog() {
    if (actionLoading) return;

    setRejectingApplication(null);
    setRejectionReason("");
  }

  // ====================================================
  // REJECT APPLICATION
  // ====================================================

  async function handleReject(): Promise<void> {
    if (!rejectingApplication) return;

    const reason = rejectionReason.trim();

    if (reason.length < 10) {
      setError(
        "Please provide a rejection reason of at least 10 characters."
      );
      return;
    }

    if (reason.length > 1000) {
      setError(
        "Rejection reason cannot exceed 1000 characters."
      );
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await rejectApplication(
        rejectingApplication._id,
        reason
      );

      setRejectingApplication(null);
      setRejectionReason("");

      setSuccess(
        "Salon application rejected successfully."
      );

      setReloadKey((previous) => previous + 1);
    } catch (err) {
      console.error("Rejection failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to reject salon application."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ====================================================
  // RETRY
  // ====================================================

  function handleRetry() {
    setError("");
    setLoading(true);
    setReloadKey((previous) => previous + 1);
  }

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">

        {/* ============================================
            PAGE HEADER
        ============================================ */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Salon Applications
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Review and manage salon registration applications.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRetry}
            disabled={loading}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ============================================
            SUCCESS MESSAGE
        ============================================ */}

        {success && (
          <div
            role="status"
            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {success}
          </div>
        )}

        {/* ============================================
            ERROR MESSAGE
        ============================================ */}

        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="self-start font-semibold hover:underline sm:self-auto"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* ============================================
            STATUS FILTERS
        ============================================ */}

        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((filter) => {
            const active = status === filter.value;

            return (
              <button
                key={filter.value}
                type="button"
                onClick={() => handleStatusChange(filter.value)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-gray-900 text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {/* ============================================
            APPLICATION SUMMARY
        ============================================ */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium capitalize text-gray-500">
                {status} applications
              </p>

              <p className="mt-1 text-3xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(status)}`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* ============================================
            APPLICATION TABLE
        ============================================ */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">
              Application List
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage submitted salon applications.
            </p>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />

                <p className="text-sm text-gray-500">
                  Loading applications...
                </p>
              </div>
            </div>
          ) : applications.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
              <div className="mb-3 text-4xl">📋</div>

              <h3 className="text-lg font-semibold text-gray-800">
                No applications found
              </h3>

              <p className="mt-2 max-w-md text-sm text-gray-500">
                There are currently no {status} salon applications.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">

                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Salon
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Owner
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Location
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Submitted
                    </th>

                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">

                  {applications.map((application) => (
                    <tr
                      key={application._id}
                      className="transition hover:bg-gray-50"
                    >
                      {/* SALON */}

                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {application.name}
                        </div>

                        <div className="mt-1 max-w-xs truncate text-sm text-gray-500">
                          {application.email}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {application.phone}
                        </div>
                      </td>

                      {/* OWNER */}

                      <td className="px-5 py-4">
                        {application.owner ? (
                          <>
                            <p className="font-medium text-gray-800">
                              {application.owner.name}
                            </p>

                            <p className="mt-1 text-sm text-gray-500">
                              {application.owner.email}
                            </p>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Owner information unavailable
                          </span>
                        )}
                      </td>

                      {/* LOCATION */}

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {application.address?.city || "N/A"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {application.address?.country || "N/A"}
                        </p>
                      </td>

                      {/* SUBMITTED DATE */}

                      <td className="px-5 py-4 text-sm text-gray-600">
                        {formatDate(application.createdAt)}
                      </td>

                      {/* STATUS */}

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClasses(application.status)}`}
                        >
                          {application.status}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">

                          <Link
                            href={`/admin/salons/applications/${application._id}`}
                            className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                          >
                            Details
                          </Link>

                          {application.status === "pending" && (
                            <>
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                  void handleApprove(application._id)
                                }
                                className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Approve
                              </button>

                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() =>
                                  openRejectDialog(application)
                                }
                                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}

                        </div>
                      </td>
                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}

          {/* ==========================================
              PAGINATION
          ========================================== */}

          {!loading && applications.length > 0 && (
            <div className="flex flex-col gap-4 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-gray-500">
                Showing{" "}
                {pagination.total === 0
                  ? 0
                  : (page - 1) * PAGE_LIMIT + 1}
                {" "}to{" "}
                {Math.min(
                  page * PAGE_LIMIT,
                  pagination.total
                )}
                {" "}of {pagination.total} applications
              </p>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  disabled={
                    loading ||
                    !pagination.hasPreviousPage ||
                    page <= 1
                  }
                  onClick={() => handlePageChange(page - 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-600">
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  disabled={
                    loading ||
                    !pagination.hasNextPage ||
                    page >= pagination.totalPages
                  }
                  onClick={() => handlePageChange(page + 1)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ================================================
          REJECTION MODAL
      ================================================ */}

      {rejectingApplication && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeRejectDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-dialog-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-5">
              <h2
                id="reject-dialog-title"
                className="text-xl font-bold text-gray-900"
              >
                Reject Salon Application
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                You are rejecting the application for{" "}
                <strong className="text-gray-800">
                  {rejectingApplication.name}
                </strong>
                .
              </p>
            </div>

            <label
              htmlFor="rejectionReason"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Rejection Reason
              <span className="ml-1 text-red-600">*</span>
            </label>

            <textarea
              id="rejectionReason"
              value={rejectionReason}
              onChange={(event) => {
                setRejectionReason(event.target.value);
                setError("");
              }}
              placeholder="Explain why this salon application is being rejected..."
              rows={5}
              maxLength={1000}
              disabled={actionLoading}
              className="w-full resize-y rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:bg-gray-100"
            />

            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>Minimum 10 characters</span>
              <span>{rejectionReason.length}/1000</span>
            </div>

            {error && (
              <p className="mt-3 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={closeRejectDialog}
                disabled={actionLoading}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleReject()}
                disabled={
                  actionLoading ||
                  rejectionReason.trim().length < 10 ||
                  rejectionReason.trim().length > 1000
                }
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading
                  ? "Processing..."
                  : "Confirm Rejection"}
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}