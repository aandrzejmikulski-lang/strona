"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserLayout({ children }) {
  const pathname = usePathname();

  const linkClass = (path) =>
    `block px-4 py-2 rounded ${
      pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-300 hover:bg-gray-800"
    }`;

  return (
    <div className="flex min-h-screen text-white">
      <aside className="w-64 bg-gray-900 p-4 space-y-2 border-r border-gray-700">
        <h2 className="text-xl font-bold mb-4">Panel mieszkańca</h2>

        <Link href="/user/dashboard" className={linkClass("/user/dashboard")}>
          Dashboard
        </Link>

        <Link href="/user/tickets" className={linkClass("/user/tickets")}>
          Zgłoszenia
        </Link>

        <Link
          href="/user/announcements"
          className={linkClass("/user/announcements")}
        >
          Ogłoszenia
        </Link>
      </aside>

      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
