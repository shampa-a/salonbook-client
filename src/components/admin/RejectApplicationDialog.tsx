"use client";

import { useState } from "react";

interface RejectApplicationDialogProps {
  open: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function RejectApplicationDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: RejectApplicationDialogProps) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const normalizedReason = reason.trim();

  const isValid =
    normalizedReason.length >= 10 &&
    normalizedReason.length <= 1000;

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!isValid || loading) return;

    await onConfirm(normalizedReason);
    setReason("");
  }

  function handleClose() {
    if (loading) return;

    setReason("");
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-dialog-title"
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-xl text-red-600">
            !
          </div>

          <h2
            id="reject-dialog-title"
            className="mt-4 text-xl font-bold text-slate-900"
          >
            Reject Salon Application
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please provide a clear reason for rejecting this
            application. The reason will be recorded.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <label
            htmlFor="rejection-reason"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Rejection Reason <span className="text-red-600">*</span>
          </label>

          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(event) =>
              setReason(event.target.value)
            }
            rows={5}
            maxLength={1000}
            disabled={loading}
            placeholder="Explain why this salon application is being rejected..."
            className="w-full resize-none rounded-xl border border-slate-200 p-4 text-sm outline-none transition focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:bg-slate-50"
          />

          <div className="mt-2 flex justify-between text-xs">
            <span
              className={
                normalizedReason.length > 0 &&
                normalizedReason.length < 10
                  ? "text-red-600"
                  : "text-slate-400"
              }
            >
              Minimum 10 characters
            </span>

            <span className="text-slate-400">
              {normalizedReason.length}/1000
            </span>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!isValid || loading}
              className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Rejecting..." : "Confirm Rejection"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}