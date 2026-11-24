"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const navigation = [
  {
    label: "Overview",
    href: "/admin/dashboard",
    icon: "▦",
  },
  {
    label: "Pending Applications",
    href: "/admin/salons/applications?status=pending",
    icon: "◷",
  },
  {
    label: "Approved Salons",
    href: "/admin/salons/applications?status=approved",
    icon: "✓",
  },
  {
    label: "Rejected Applications",
    href: "/admin/salons/applications?status=rejected",
    icon: "✕",
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    try {
      await authClient.signOut();
      router.replace("/login");
    } catch {
      alert("Unable to sign out. Please try again.");
    }
  }

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-6">
        <Link
          href="/admin/dashboard"
          className="text-2xl font-bold tracking-tight text-indigo-700"
        >
          SalonBook
        </Link>

        <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
          Administration
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        {navigation.map((item) => {
          const active = pathname === item.href.split("?")[0];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}