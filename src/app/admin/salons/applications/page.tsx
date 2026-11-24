"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

import {
  getApplications,
  type SalonApplication,
  type Pagination,
} from "@/lib/admin-api";

type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "suspended";

const tabs: {
  label: string;
  value: ApplicationStatus;
}[] = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Suspended", value: "suspended" },
];

const emptyPagination: Pagination = {
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function ApplicationsPage() {
  const [status, setStatus] =
    useState<ApplicationStatus>("pending");

  const [applications, setApplications] = useState<
    SalonApplication[]
  >([]);

  const [pagination, setPagination] =
    useState(emptyPagination);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadApplications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");

        const result = await getApplications(
          status,
          page,
          20
        );

        setApplications(result.data.applications);
        setPagination(result.data.pagination);
      } catch (err) {
        setApplications([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load applications"
        );
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    loadApplications(1);
  }, [loadApplications]);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const requestedStatus = params.get("status");

    if (
      requestedStatus &&
      tabs.some((tab) => tab.value === requestedStatus)
    ) {
      setStatus(requestedStatus as ApplicationStatus);
    }
  }, []);

  function changeStatus(nextStatus: ApplicationStatus) {
    setStatus(nextStatus);

    window.history.replaceState(
      null,
      "",
      `/admin/salons/applications?status=${nextStatus}`
    );
  }

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-indigo-600">
            SALON MANAGEMENT
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Salon Applications
          </h1>

          <p className="mt-2 text-slate-500">
            Review and manage salon registration applications.
          </p>
        </div>

        {/* Status tabs */}

        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => changeStatus(tab.value)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                status === tab.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Results information */}

        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Total applications:{" "}
            <strong className="text-slate-900">
              {pagination.total}
            </strong>
          </p>

          <button
            onClick={() => loadApplications(pagination.page)}
            disabled={loading}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Refresh
          </button>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Salon</th>
                  <th className="px-6 py-4">Owner</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-slate-500"
                    >
                      Loading applications...
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <p className="font-semibold text-slate-700">
                        No applications found
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        There are no {status} applications.
                      </p>
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr
                      key={application._id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-semibold text-slate-900">
                          {application.name}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {application.email}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-800">
                          {application.owner?.name ?? "Unknown"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {application.owner?.email ?? "No owner data"}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-slate-600">
                        {application.address.city},{" "}
                        {application.address.country}
                      </td>

                      <td className="px-6 py-5 text-slate-500">
                        {formatDate(application.createdAt)}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                            application.status === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : application.status === "approved"
                                ? "bg-emerald-100 text-emerald-700"
                                : application.status === "rejected"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {application.status}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <Link
                          href={`/admin/salons/applications/${application._id}`}
                          className="font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}

          {!loading && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <button
                  disabled={!pagination.hasPreviousPage}
                  onClick={() =>
                    loadApplications(pagination.page - 1)
                  }
                  className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

                <button
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    loadApplications(pagination.page + 1)
                  }
                  className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}