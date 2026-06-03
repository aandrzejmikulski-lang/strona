"use client";

export const runtime = "nodejs";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Ticket = {
  status: string;
};

type Announcement = {
  active: boolean;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0,
    communities: 0,
    tickets: 0,
    announcements: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const users = await supabase.from("profiles").select("*");
      const communities = await supabase.from("communities").select("*");
      const tickets = await supabase.from("tickets").select("*");
      const announcements = await supabase.from("announcements").select("*");

      setStats({
        users: users.data?.length || 0,
        communities: communities.data?.length || 0,
        tickets:
          tickets.data?.filter((t: Ticket) => t.status === "open").length || 0,
        announcements:
          announcements.data?.filter((a: Announcement) => a.active).length || 0,
      });

      setLoading(false);
    }

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Ładowanie…</h1>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Panel Administratora</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Użytkownicy</h2>
          <p className="text-4xl font-bold mt-2">{stats.users}</p>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Społeczności</h2>
          <p className="text-4xl font-bold mt-2">{stats.communities}</p>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Otwarte zgłoszenia</h2>
          <p className="text-4xl font-bold mt-2">{stats.tickets}</p>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Aktywne ogłoszenia</h2>
          <p className="text-4xl font-bold mt-2">{stats.announcements}</p>
        </div>
      </div>
    </div>
  );
}
