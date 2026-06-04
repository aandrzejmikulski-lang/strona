"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function AdminDashboard() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    communities: 0,
    residents: 0,
    tickets: 0,
    announcements: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 1. Pobierz użytkownika
      const { data: auth } = await supabase.auth.getUser();

      if (!auth?.user) {
        router.push("/login");
        return;
      }

      // 2. Pobierz profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/403");
        return;
      }

      // 3. Pobierz statystyki
      const [users, communities, residents, tickets, announcements] =
        await Promise.all([
          supabase.from("profiles").select("*"),
          supabase.from("communities").select("*"),
          supabase.from("residents").select("*"),
          supabase.from("tickets").select("*"),
          supabase.from("announcements").select("*"),
        ]);

      setStats({
        users: users.data?.length || 0,
        communities: communities.data?.length || 0,
        residents: residents.data?.length || 0,
        tickets: tickets.data?.filter((t) => t.status === "open").length || 0,
        announcements:
          announcements.data?.filter((a) => a.active).length || 0,
      });

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-6 text-white">
        <h1 className="text-2xl font-bold">Ładowanie…</h1>
      </div>
    );
  }

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Panel Administratora</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Użytkownicy</h2>
          <p className="text-4xl font-bold mt-2">{stats.users}</p>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Społeczności</h2>
          <p className="text-4xl font-bold mt-2">{stats.communities}</p>
        </div>

        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
          <h2 className="text-xl font-semibold">Mieszkańcy</h2>
          <p className="text-4xl font-bold mt-2">{stats.residents}</p>
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
