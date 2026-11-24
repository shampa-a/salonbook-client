"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getApplications } from "@/lib/admin-api";

interface DashboardStats {
  pending: number;
  approved: number;
  rejected: number;
  suspended: number;
}

const initialStats: DashboardStats = {
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");

        const statuses = [
          "pending",
          "approved",
          "rejected",
          "suspended",
        ] as const;

        const results = await Promise.all(
          statuses.map((status) =>
            getApplications(status, 1, 1)
          )
        );

        if (!active) return;

        setStats({
          pending: results[0].data.pagination.total,
          approved: results[1].data.pagination.total,
          rejected: results[2].data.pagination.total,
          suspended: results[3].data.pagination.total,
        });
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load dashboard"
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      title: "Pending Applications",
      value: stats.pending,
      description: "Require administrative review",
      href: "/admin/salons/applications?status=pending",
      color: "text-amber-600",
      background: "bg-amber-50",
      icon: "◷",
    },
    {
      title: "Approved Salons",
      value: stats.approved,
      description: "Approved salon applications",
      href: "/admin/salons/applications?status=approved",
      color: "text-emerald-600",
      background: "bg-emerald-50",
      icon: "✓",
    },
    {
      title: "Rejected Applications",
      value: stats.rejected,
      description: "Rejected applications",
      href: "/admin/salons/applications?status=rejected",
      color: "text-red-600",
      background: "bg-red-50",
      icon: "✕",
    },
    {
      title: "Suspended Salons",
      value: stats.suspended,
      description: "Currently suspended",
      href: "/admin/salons/applications?status=suspended",
      color: "text-slate-600",
      background: "bg-slate-100",
      icon: "!",
    },
  ];

  return (
    <div className="min-h-screen p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <p className="text-sm font-medium text-indigo-600">
            ADMINISTRATION
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            Dashboard Overview
          </h1>

          <p className="mt-2 text-slate-500">
            Monitor salon applications and manage platform approvals.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-bold ${card.background} ${card.color}`}
                >
                  {card.icon}
                </span>

                <span className="text-sm text-slate-400">
                  View details →
                </span>
              </div>

              <p className="mt-6 text-sm font-medium text-slate-500">
                {card.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900">
                {loading ? "..." : card.value}
              </h2>

              <p className="mt-2 text-xs text-slate-400">
                {card.description}
              </p>
            </Link>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Manage salon applications from one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/admin/salons/applications?status=pending"
              className="rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Review Pending Applications
            </Link>

            <Link
              href="/admin/salons/applications?status=approved"
              className="rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Approved Salons
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}