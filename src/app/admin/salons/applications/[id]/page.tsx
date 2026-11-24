"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import {
  approveApplication,
  getApplicationDetails,
  type SalonApplication,
  type AdminOwner,
} from "@/lib/admin-api";

import RejectApplicationDialog from "@/components/admin/RejectApplicationDialog";

export default function ApplicationDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const applicationId = params.id;

  const [application, setApplication] =
    useState<SalonApplication | null>(null);

  const [owner, setOwner] =
    useState<AdminOwner | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] =
    useState(false);

  const loadApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result =
        await getApplicationDetails(applicationId);

      setApplication(result.data.application);
      setOwner(result.data.owner);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load application"
      );
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  async function handleApprove() {
    if (!application || actionLoading) return;

    const confirmed = window.confirm(
      `Are you sure you want to approve ${application.name}? The owner's account will be promoted to salonOwner.`
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      await approveApplication(application._id);

      setSuccess(
        "Salon application approved successfully. Owner role has been updated."
      );

      await loadApplication();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to approve application"
      );
    } finally {
      setActionLoading(false);
    }
  }

  async function handleReject(reason: string) {
    if (!application || actionLoading) return;

    try {
      setActionLoading(true);
      setError("");
      setSuccess("");

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL ||
        "http://localhost:5000";

      const response = await fetch(
        `${API_URL}/api/v1/admin/salons/applications/${encodeURIComponent(application._id)}/reject`,
        {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to reject application"
        );
      }

      setRejectDialogOpen(false);

      setSuccess(
        "Salon application rejected successfully."
      );

      await loadApplication();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reject application"
      );

      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  function formatDate(date?: string | null) {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleString("en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function InfoItem({
    label,
    value,
  }: {
    label: string;
    value?: string | null;
  }) {
    return (
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-2 break-words text-sm font-medium text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-slate-500">
          Loading application details...
        </p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-8">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-8">
          <h2 className="text-xl font-bold text-slate-900">
            Application unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || "Application not found."}
          </p>

          <Link
            href="/admin/salons/applications"
            className="mt-6 inline-block text-sm font-semibold text-indigo-600"
          >
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const isPending = application.status === "pending";

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8">
          <Link
            href="/admin/salons/applications"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Applications
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-600">
                APPLICATION REVIEW
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {application.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Application ID: {application._id}
              </p>
            </div>

            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
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
          </div>
        </div>

        {/* Alerts */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        )}

        <div className="space-y-6">

          {/* Salon Information */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              Salon Information
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <InfoItem
                label="Salon Name"
                value={application.name}
              />

              <InfoItem
                label="Business Email"
                value={application.email}
              />

              <InfoItem
                label="Phone Number"
                value={application.phone}
              />

              <InfoItem
                label="Website"
                value={application.website}
              />

              <div className="sm:col-span-2">
                <InfoItem
                  label="Description"
                  value={application.description}
                />
              </div>
            </div>
          </section>

          {/* Address */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              Business Address
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem
                label="Country"
                value={application.address.country}
              />

              <InfoItem
                label="City"
                value={application.address.city}
              />

              <InfoItem
                label="State"
                value={application.address.state}
              />

              <InfoItem
                label="Area"
                value={application.address.area}
              />

              <InfoItem
                label="Street"
                value={application.address.street}
              />

              <InfoItem
                label="Postal Code"
                value={application.address.postalCode}
              />
            </div>
          </section>

          {/* Owner Information */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              Application Owner
            </h2>

            {owner ? (
              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <InfoItem
                  label="Owner Name"
                  value={owner.name}
                />

                <InfoItem
                  label="Owner Email"
                  value={owner.email}
                />

                <InfoItem
                  label="Account Role"
                  value={owner.role}
                />

                <InfoItem
                  label="Email Verification"
                  value={
                    owner.emailVerified
                      ? "Verified"
                      : "Not verified"
                  }
                />

                <InfoItem
                  label="Account Status"
                  value={
                    owner.blocked
                      ? "Blocked"
                      : "Active"
                  }
                />

                <InfoItem
                  label="Account Created"
                  value={formatDate(owner.createdAt)}
                />
              </div>
            ) : (
              <p className="mt-4 text-sm text-amber-600">
                Owner information is unavailable.
              </p>
            )}
          </section>

          {/* Application History */}

          <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
            <h2 className="text-lg font-bold text-slate-900">
              Application Information
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <InfoItem
                label="Submitted At"
                value={formatDate(application.createdAt)}
              />

              <InfoItem
                label="Last Updated"
                value={formatDate(application.updatedAt)}
              />

              <InfoItem
                label="Approved At"
                value={formatDate(application.approvedAt)}
              />

              <InfoItem
                label="Approved By"
                value={application.approvedBy}
              />
            </div>

            {application.status === "rejected" &&
              application.rejectionReason && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
                  <h3 className="text-sm font-bold text-red-800">
                    Rejection Reason
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-red-700">
                    {application.rejectionReason}
                  </p>
                </div>
              )}
          </section>

          {/* Actions */}

          {isPending && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6 lg:p-8">
              <h2 className="text-lg font-bold text-slate-900">
                Review Decision
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Carefully review all submitted information before
                making a decision.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading
                    ? "Processing..."
                    : "Approve Application"}
                </button>

                <button
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                  className="rounded-lg border border-red-200 bg-white px-6 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                >
                  Reject Application
                </button>
              </div>
            </section>
          )}
        </div>

        <RejectApplicationDialog
          open={rejectDialogOpen}
          loading={actionLoading}
          onClose={() => setRejectDialogOpen(false)}
          onConfirm={handleReject}
        />
      </div>
    </div>
  );
}