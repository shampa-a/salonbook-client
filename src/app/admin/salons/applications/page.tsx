"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  approveApplication,
  getApplications,
  rejectApplication,
  type SalonApplication,
  type Pagination,
} from "@/lib/admin-api";

import RejectApplicationDialog from "@/components/admin/RejectApplicationDialog";

/* =====================================================
   TYPES
===================================================== */

type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

const PAGE_LIMIT = 10;

const STATUS_TABS: {
  label: string;
  value: ApplicationStatus;
}[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

/* =====================================================
   HELPERS
===================================================== */

function formatDate(date?: string | null): string {
  if (!date) return "N/A";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "N/A";
  }

  return parsedDate.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getStatusClass(status: ApplicationStatus): string {
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

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

/* =====================================================
   PAGE COMPONENT
===================================================== */

export default function AdminApplicationsPage() {
  /* -----------------------------------------------
     STATES
  ------------------------------------------------ */

  const [applications, setApplications] = useState<
    SalonApplication[]
  >([]);

  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const [status, setStatus] =
    useState<ApplicationStatus>("pending");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [selectedApplication, setSelectedApplication] =
    useState<SalonApplication | null>(null);

  const [rejectDialogOpen, setRejectDialogOpen] =
    useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  /* -----------------------------------------------
     FETCH APPLICATIONS

     No synchronous setState at effect start.
     Handles stale requests and component unmount.
  ------------------------------------------------ */

  useEffect(() => {
    let active = true;

    async function fetchApplications() {
      try {
        const result = await getApplications(
          status,
          page,
          PAGE_LIMIT
        );

        if (!active) return;

        if (!result?.success || !result.data) {
          throw new Error(
            "Invalid application list response from server."
          );
        }

        setApplications(result.data.applications ?? []);

        setPagination(result.data.pagination);

        setError("");
      } catch (err: unknown) {
        if (!active) return;

        setApplications([]);

        setError(getErrorMessage(err));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchApplications();

    return () => {
      active = false;
    };
  }, [status, page, reloadKey]);

  /* -----------------------------------------------
     STATUS FILTER
  ------------------------------------------------ */

  const handleStatusChange = useCallback(
    (newStatus: ApplicationStatus) => {
      if (newStatus === status) return;

      setLoading(true);
      setError("");
      setSuccessMessage("");

      setStatus(newStatus);
      setPage(1);
    },
    [status]
  );

  /* -----------------------------------------------
     PAGINATION
  ------------------------------------------------ */

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (
        newPage < 1 ||
        newPage > pagination.totalPages ||
        newPage === page
      ) {
        return;
      }

      setLoading(true);
      setError("");

      setPage(newPage);
    },
    [page, pagination.totalPages]
  );

  /* -----------------------------------------------
     REFRESH
  ------------------------------------------------ */

  const refreshApplications = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadKey((current) => current + 1);
  }, []);

  /* -----------------------------------------------
     APPROVE APPLICATION
  ------------------------------------------------ */

  const handleApprove = async (
    application: SalonApplication
  ) => {
    if (actionLoading) return;

    const confirmed = window.confirm(
      `Are you sure you want to approve "${application.name}"?`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      await approveApplication(application._id);

      setSuccessMessage(
        `${application.name} has been approved successfully.`
      );

      refreshApplications();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  };

  /* -----------------------------------------------
     OPEN REJECTION DIALOG
  ------------------------------------------------ */

  const handleOpenRejectDialog = (
    application: SalonApplication
  ) => {
    if (actionLoading) return;

    setSelectedApplication(application);
    setRejectDialogOpen(true);
    setError("");
  };

  /* -----------------------------------------------
     CLOSE REJECTION DIALOG
  ------------------------------------------------ */

  const handleCloseRejectDialog = () => {
    if (actionLoading) return;

    setRejectDialogOpen(false);
    setSelectedApplication(null);
  };

  /* -----------------------------------------------
     REJECT APPLICATION

     Promise<boolean> is required by dialog.
  ------------------------------------------------ */

  const handleReject = async (
    reason: string
  ): Promise<boolean> => {
    if (!selectedApplication || actionLoading) {
      return false;
    }

    const trimmedReason = reason.trim();

    if (trimmedReason.length < 10) {
      setError(
        "Rejection reason must be at least 10 characters."
      );

      return false;
    }

    if (trimmedReason.length > 1000) {
      setError(
        "Rejection reason cannot exceed 1000 characters."
      );

      return false;
    }

    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      await rejectApplication(
        selectedApplication._id,
        trimmedReason
      );

      setSuccessMessage(
        `${selectedApplication.name} has been rejected.`
      );

      setRejectDialogOpen(false);
      setSelectedApplication(null);

      refreshApplications();

      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));

      return false;
    } finally {
      setActionLoading(false);
    }
  };

  /* -----------------------------------------------
     EMPTY STATE
  ------------------------------------------------ */

  const isEmpty =
    !loading && !error && applications.length === 0;

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Salon Applications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review and manage salon registration applications.
          </p>
        </div>

        <button
          type="button"
          onClick={refreshApplications}
          disabled={loading || actionLoading}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>

      </div>

      {/* SUCCESS MESSAGE */}

      {successMessage && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
        >
          {successMessage}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={refreshApplications}
            className="font-semibold underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* STATUS FILTER TABS */}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">

        <div className="flex min-w-max border-b border-gray-200">

          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => handleStatusChange(tab.value)}
              className={`border-b-2 px-5 py-4 text-sm font-medium transition ${
                status === tab.value
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab.label}

              {status === tab.value && (
                <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                  {pagination.total}
                </span>
              )}
            </button>
          ))}

        </div>

      </div>

      {/* APPLICATION TABLE */}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

          <div>
            <h2 className="font-semibold text-gray-900">
              {status.charAt(0).toUpperCase() + status.slice(1)} Applications
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Total applications: {pagination.total}
            </p>
          </div>

          <span className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages || 1}
          </span>

        </div>

        {/* LOADING */}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="mt-3 text-sm text-gray-500">
                Loading applications...
              </p>
            </div>
          </div>
        ) : isEmpty ? (

          /* EMPTY STATE */

          <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">

            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl">
              📋
            </div>

            <h3 className="font-semibold text-gray-900">
              No {status} applications
            </h3>

            <p className="mt-1 max-w-sm text-sm text-gray-500">
              There are currently no salon applications in this category.
            </p>

          </div>

        ) : (

          /* TABLE */

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left text-sm">

              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">

                <tr>
                  <th className="px-5 py-4 font-semibold">
                    Salon
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Owner
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Location
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Submitted
                  </th>

                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-4 text-right font-semibold">
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

                      <div className="mt-1 text-xs text-gray-500">
                        {application.email}
                      </div>

                      {application.phone && (
                        <div className="mt-1 text-xs text-gray-500">
                          {application.phone}
                        </div>
                      )}

                    </td>

                    {/* OWNER */}

                    <td className="px-5 py-4">

                      {application.owner ? (
                        <>
                          <div className="font-medium text-gray-800">
                            {application.owner.name}
                          </div>

                          <div className="mt-1 text-xs text-gray-500">
                            {application.owner.email}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-400">
                          Owner unavailable
                        </span>
                      )}

                    </td>

                    {/* LOCATION */}

                    <td className="px-5 py-4">

                      <div className="text-gray-800">
                        {application.address?.city || "N/A"}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {application.address?.country || ""}
                      </div>

                    </td>

                    {/* SUBMITTED */}

                    <td className="px-5 py-4 text-gray-600">
                      {formatDate(application.createdAt)}
                    </td>

                    {/* STATUS */}

                    <td className="px-5 py-4">

                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(application.status)}`}
                      >
                        {application.status}
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td className="px-5 py-4">

                      <div className="flex items-center justify-end gap-2">

                        <Link
                          href={`/admin/salons/applications/${encodeURIComponent(application._id)}`}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                          View
                        </Link>

                        {application.status === "pending" && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                void handleApprove(application)
                              }
                              disabled={actionLoading}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Approve
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenRejectDialog(application)
                              }
                              disabled={actionLoading}
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

        {/* PAGINATION */}

        {!loading && applications.length > 0 && (

          <div className="flex flex-col gap-3 border-t border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-gray-500">
              Showing{" "}
              {(pagination.page - 1) * pagination.limit + 1}
              {" "}to{" "}
              {Math.min(
                pagination.page * pagination.limit,
                pagination.total
              )}
              {" "}of {pagination.total} applications
            </p>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  handlePageChange(pagination.page - 1)
                }
                disabled={
                  !pagination.hasPreviousPage ||
                  loading
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-2 text-sm text-gray-600">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  handlePageChange(pagination.page + 1)
                }
                disabled={
                  !pagination.hasNextPage ||
                  loading
                }
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

            </div>

          </div>

        )}

      </div>

      {/* REJECTION DIALOG */}

      <RejectApplicationDialog
        open={rejectDialogOpen}
        loading={actionLoading}
        onClose={handleCloseRejectDialog}
        onConfirm={handleReject}
      />

    </div>
  );
}