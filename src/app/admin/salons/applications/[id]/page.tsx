"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  approveApplication,
  rejectApplication,
  getApplicationDetails,
  type SalonApplication,
  type AdminOwner,
} from "@/lib/admin-api";

import RejectApplicationDialog from "@/components/admin/RejectApplicationDialog";

/* =====================================================
   TYPES
===================================================== */

interface InfoItemProps {
  label: string;
  value?: string | number | null;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

/* =====================================================
   REUSABLE COMPONENTS
   Keep these OUTSIDE the page component.
===================================================== */

function InfoItem({ label, value }: InfoItemProps) {
  const displayValue =
    value === null || value === undefined || value === ""
      ? "Not provided"
      : String(value);

  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-gray-900">
        {displayValue}
      </p>
    </div>
  );
}

function Section({ title, children }: SectionProps) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-gray-900">
        {title}
      </h2>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

/* =====================================================
   HELPERS
===================================================== */

function formatDate(date?: string | null): string {
  if (!date) return "Not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function getStatusClass(status: SalonApplication["status"]): string {
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

/* =====================================================
   MAIN PAGE
===================================================== */

export default function AdminApplicationDetailsPage() {
  const params = useParams<{ id: string }>();

  const applicationId = params.id;

  /* -----------------------------------------------
     STATES
  ------------------------------------------------ */

  const [application, setApplication] =
    useState<SalonApplication | null>(null);

  const [owner, setOwner] =
    useState<AdminOwner | null>(null);

  const [loading, setLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [rejectDialogOpen, setRejectDialogOpen] =
    useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  /* -----------------------------------------------
     LOAD APPLICATION

     Fetch directly inside the effect.
     No synchronous state updates at effect start.
  ------------------------------------------------ */

  useEffect(() => {
    let active = true;

    async function fetchApplication() {
      if (!applicationId) {
        if (active) {
          setApplication(null);
          setOwner(null);
          setError("Invalid application ID.");
          setLoading(false);
        }

        return;
      }

      try {
        const result = await getApplicationDetails(applicationId);

        if (!active) return;

        if (!result?.success || !result.data?.application) {
          throw new Error(
            "Invalid application response from server."
          );
        }

        setApplication(result.data.application);
        setOwner(result.data.owner ?? null);
        setError("");
      } catch (err: unknown) {
        if (!active) return;

        setApplication(null);
        setOwner(null);
        setError(getErrorMessage(err));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchApplication();

    return () => {
      active = false;
    };
  }, [applicationId, reloadKey]);

  /* -----------------------------------------------
     REFRESH
  ------------------------------------------------ */

  function refreshApplication() {
    setLoading(true);
    setError("");
    setSuccessMessage("");

    setReloadKey((current) => current + 1);
  }

  /* -----------------------------------------------
     APPROVE APPLICATION
  ------------------------------------------------ */

  async function handleApprove() {
    if (!application || actionLoading) return;

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
        "Salon application approved successfully. The owner's account role has been updated if the backend transaction completed successfully."
      );

      refreshApplication();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setActionLoading(false);
    }
  }

  /* -----------------------------------------------
     OPEN REJECTION DIALOG
  ------------------------------------------------ */

  function handleOpenRejectDialog() {
    if (!application || actionLoading) return;

    setError("");
    setRejectDialogOpen(true);
  }

  /* -----------------------------------------------
     CLOSE REJECTION DIALOG
  ------------------------------------------------ */

  function handleCloseRejectDialog() {
    if (actionLoading) return;

    setRejectDialogOpen(false);
  }

  /* -----------------------------------------------
     REJECT APPLICATION

     IMPORTANT:
     Returns Promise<boolean>, as required by dialog.
  ------------------------------------------------ */

  async function handleReject(reason: string): Promise<boolean> {
    if (!application || actionLoading) {
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
        application._id,
        trimmedReason
      );

      setSuccessMessage(
        "Salon application rejected successfully."
      );

      setRejectDialogOpen(false);

      refreshApplication();

      return true;
    } catch (err: unknown) {
      setError(getErrorMessage(err));

      return false;
    } finally {
      setActionLoading(false);
    }
  }

  /* =====================================================
     LOADING STATE
  ===================================================== */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <p className="mt-4 text-sm text-gray-500">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     ERROR / NOT FOUND STATE
  ===================================================== */

  if (!application) {
    return (
      <div className="space-y-5">
        <Link
          href="/admin/salons/applications"
          className="inline-flex text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to applications
        </Link>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-lg font-semibold text-red-800">
            Unable to load salon application
          </h1>

          <p className="mt-2 text-sm text-red-700">
            {error || "Application not found."}
          </p>

          <button
            type="button"
            onClick={refreshApplication}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN CONTENT
  ===================================================== */

  const address = application.address;

  const isPending = application.status === "pending";

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <Link
            href="/admin/salons/applications"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to applications
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            Salon Application Details
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Review salon information and application status.
          </p>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusClass(application.status)}`}
        >
          {application.status}
        </span>

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
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* SALON INFORMATION */}

      <Section title="Salon Information">

        <div className="grid gap-6 sm:grid-cols-2">

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

      </Section>

      {/* ADDRESS INFORMATION */}

      <Section title="Business Address">

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

          <InfoItem
            label="Country"
            value={address?.country}
          />

          <InfoItem
            label="City"
            value={address?.city}
          />

          <InfoItem
            label="State"
            value={address?.state}
          />

          <InfoItem
            label="Area"
            value={address?.area}
          />

          <InfoItem
            label="Street"
            value={address?.street}
          />

          <InfoItem
            label="Postal Code"
            value={address?.postalCode}
          />

        </div>

      </Section>

      {/* OWNER INFORMATION */}

      <Section title="Salon Owner Information">

        {owner ? (
          <div className="grid gap-6 sm:grid-cols-2">

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
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Owner information is currently unavailable.
          </div>
        )}

      </Section>

      {/* APPLICATION HISTORY */}

      <Section title="Application History">

        <div className="grid gap-6 sm:grid-cols-2">

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
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <h3 className="text-sm font-semibold text-red-800">
                Rejection Reason
              </h3>

              <p className="mt-2 whitespace-pre-wrap text-sm text-red-700">
                {application.rejectionReason}
              </p>
            </div>
          )}

      </Section>

      {/* ADMIN ACTIONS */}

      {isPending && (
        <Section title="Application Review">

          <p className="text-sm leading-6 text-gray-600">
            Review the salon information and owner details carefully.
            Once approved, the salon owner account will be promoted
            according to the backend approval workflow.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => void handleApprove()}
              disabled={actionLoading}
              className="rounded-lg bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {actionLoading
                ? "Processing..."
                : "Approve Application"}
            </button>

            <button
              type="button"
              onClick={handleOpenRejectDialog}
              disabled={actionLoading}
              className="rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Reject Application
            </button>

          </div>

        </Section>
      )}

      {/* NON-PENDING STATUS */}

      {!isPending && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <h2 className="font-semibold text-gray-900">
            Application Review Completed
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            This application currently has the status{" "}
            <strong className="capitalize">
              {application.status}
            </strong>.
            No further approval or rejection action is available.
          </p>
        </div>
      )}

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