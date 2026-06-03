"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function UserDashboard() {
  const supabase = getSupabaseBrowserClient();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, closed: 0 });
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // PROFIL
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile(profileData);

    // STATYSTYKI
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, status")
      .eq("user_id", user.id);

    const total = tickets?.length || 0;
    const pending = tickets?.filter(
      (t) => t.status === "new" || t.status === "in_progress"
    ).length || 0;
    const closed = tickets?.filter((t) => t.status === "done").length || 0;

    setStats({ total, pending, closed });

    // OSTATNIE ZGŁOSZENIA
    const { data: recent } = await supabase
      .from("tickets")
      .select("id, title, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentTickets(recent || []);

    // OSTATNIE KOMENTARZE
    const { data: comments } = await supabase
      .from("ticket_comments")
      .select(`
        id,
        content,
        created_at,
        ticket_id,
        tickets(title)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    setRecentComments(comments || []);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-10">
        Ładowanie dashboardu…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 space-y-10">
      <h1 className="text-3xl font-bold tracking-tight">
        Witaj, {profile?.full_name || "użytkowniku"}
      </h1>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Twoje zgłoszenia" value={stats.total} color="text-blue-400" />
        <StatCard title="Oczekujące" value={stats.pending} color="text-yellow-400" />
        <StatCard title="Zamknięte" value={stats.closed} color="text-green-400" />
      </div>

      {/* OSTATNIE ZGŁOSZENIA */}
      <section className="bg-gray-950 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Ostatnie zgłoszenia</h2>

        {recentTickets.length === 0 && (
          <p className="text-gray-500 text-sm">Brak zgłoszeń.</p>
        )}

        <div className="space-y-3">
          {recentTickets.map((t) => (
            <div
              key={t.id}
              className="border border-gray-800 bg-gray-900 rounded-lg p-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">{t.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(t.created_at).toLocaleString("pl-PL")}
                </p>
              </div>
              <span className="text-sm text-gray-300">{t.status}</span>
            </div>
          ))}
        </div>
      </section>

      {/* OSTATNIE KOMENTARZE */}
      <section className="bg-gray-950 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold">Twoje ostatnie komentarze</h2>

        {recentComments.length === 0 && (
          <p className="text-gray-500 text-sm">Brak komentarzy.</p>
        )}

        <div className="space-y-3">
          {recentComments.map((c) => (
            <div
              key={c.id}
              className="border border-gray-800 bg-gray-900 rounded-lg p-4"
            >
              <p className="text-gray-200 text-sm">{c.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                W zgłoszeniu: {c.tickets?.title}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(c.created_at).toLocaleString("pl-PL")}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl p-6">
      <p className="text-gray-400 text-sm">{title}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );
}
