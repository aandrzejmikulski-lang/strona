"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import DashboardCharts from "../../../components/ui/DashboardCharts";

export default function AdminDashboard() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [stats, setStats] = useState({
    communities: 0,
    residents: 0,
    tickets: 0,
    announcements: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/login");
        return;
      }

      const role = String(profile.role).trim().toLowerCase();

      // 🔥 ADMIN → pełny dostęp, bez wspólnoty, bez ograniczeń
      if (role === "admin") {
        setLoading(false);
        return;
      }

      // 🔥 USER NIEAKTYWNY
      if (!profile.is_active) {
        router.push("/pending-approval");
        return;
      }

      // 🔥 USER AKTYWNY, ALE BEZ WSPÓLNOTY
      if (!profile.community_id) {
        router.push("/select-community");
        return;
      }

      // 🔥 USER → dashboard usera
      router.push("/dashboard");
    }

    checkAccess();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadData();
      const interval = setInterval(loadData, 10000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  async function loadData() {
    const [communities, residents, tickets, announcements] = await Promise.all([
      supabase.from("communities").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("tickets").select("*"),
      supabase.from("announcements").select("*"),
    ]);

    setStats({
      communities: communities.data?.length || 0,
      residents: residents.data?.length || 0,
      tickets: tickets.data?.filter((t: { status: string }) => t.status === "open").length || 0,
      announcements: announcements.data?.filter((a) => a.active).length || 0,
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* GÓRNY PASEK */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel administracyjny</h1>
          <p className="text-gray-400">Dane odświeżane co 10 sekund • Live view</p>
        </div>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
        >
          Wyloguj
        </button>
      </div>

      {/* KAFELKI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard title="Wspólnoty" value={stats.communities} color="text-blue-400" icon="🏢" />
        <DashboardCard title="Mieszkańcy" value={stats.residents} color="text-green-400" icon="👤" />
        <DashboardCard title="Otwarte zgłoszenia" value={stats.tickets} color="text-yellow-400" icon="⚠️" />
        <DashboardCard title="Aktywne ogłoszenia" value={stats.announcements} color="text-purple-400" icon="📢" />
      </div>

      {/* WYKRESY */}
      <div className="mt-10">
        <DashboardCharts />
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  value,
  color,
  icon,
}: {
  title: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 flex flex-col items-start justify-center">
      <div className={`text-3xl mb-2 ${color}`}>{icon}</div>
      <p className="text-gray-400 text-sm">{title}</p>
      <p className="text-4xl font-bold mt-1">{value}</p>
    </div>
  );
}
