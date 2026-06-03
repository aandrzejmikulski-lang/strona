"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function check() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("email", session.user.email)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setAllowed(true);
      setLoading(false);
    }

    check();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Ładowanie panelu admina…
      </div>
    );

  if (!allowed) return null;

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 border-r border-gray-800 p-6">
        <h1 className="text-xl font-bold mb-6">Panel administratora</h1>
        <nav className="space-y-3 text-sm">
          <a href="/admin/dashboard" className="block hover:text-blue-400">Dashboard</a>
          <a href="/admin/users" className="block hover:text-blue-400">Użytkownicy</a>
          <a href="/admin/communities" className="block hover:text-blue-400">Wspólnoty</a>
          <a href="/admin/tickets" className="block hover:text-blue-400">Zgłoszenia</a>
          <a href="/admin/announcements" className="block hover:text-blue-400">Ogłoszenia</a>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-10">{children}</main>
    </div>
  );
}
