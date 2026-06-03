"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function UserLayout({ children }) {
  const pathname = usePathname();

  const nav = [
    { name: "Dashboard", href: "/user/dashboard" },
    { name: "Zgłoszenia", href: "/user/tickets" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0F172A] text-white p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 tracking-tight">Panel</h2>

        <nav className="flex-1 space-y-2">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 rounded-md transition-all duration-150 ${
                  active
                    ? "bg-[#1E293B] text-white shadow-sm"
                    : "text-gray-300 hover:bg-[#1E293B]/70 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/logout"
          className="mt-10 block px-3 py-2 rounded-md bg-red-600 text-center hover:bg-red-700 transition"
        >
          Wyloguj
        </Link>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
