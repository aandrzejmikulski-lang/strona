"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function DashboardPage() {
  const supabase = getSupabaseBrowserClient();

  const [stats, setStats] = useState({
    communities: 0,
    residents: 0,
    tickets: 0,
    announcements: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const communities = await supabase.from("communities").select("id");
      const residents = await supabase.from("profiles").select("id");
      const tickets = await supabase.from("tickets").select("id, status");
      const announcements = await supabase
        .from("announcements")
        .select("id, active");

      setStats({
        communities: communities.data?.length || 0,
        residents: residents.data?.length || 0,

        // 🔥 POPRAWKA — dodany typ parametru
        tickets:
          tickets.data?.filter((t: any) => t.status === "open").length || 0,

        announcements:
          announcements.data?.filter((a: any) => a.active).length || 0,
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-900 p-4 rounded">
          <p className="text-gray-400 text-sm">Wspólnoty</p>
          <p className="text-3xl font-bold">{stats.communities}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <p className="text-gray-400 text-sm">Mieszkańcy</p>
          <p className="text-3xl font-bold">{stats.residents}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <p className="text-gray-400 text-sm">Otwarte zgłoszenia</p>
          <p className="text-3xl font-bold">{stats.tickets}</p>
        </div>

        <div className="bg-gray-900 p-4 rounded">
          <p className="text-gray-400 text-sm">Aktywne ogłoszenia</p>
          <p className="text-3xl font-bold">{stats.announcements}</p>
        </div>
      </div>
    </div>
  );
}
