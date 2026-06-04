"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

export default function TicketsListPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.push("/login");
        return;
      }

      const { data: ticketsData } = await supabase
        .from("tickets")
        .select("*")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false });

      setTickets(ticketsData || []);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return <div className="text-white p-6">Ładowanie...</div>;
  }

  return (
    <div className="text-white p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Twoje zgłoszenia</h1>
        <button
          onClick={() => router.push("/user/tickets/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          + Nowe zgłoszenie
        </button>
      </div>

      {tickets.length === 0 && (
        <div className="text-gray-400">Nie masz jeszcze żadnych zgłoszeń.</div>
      )}

      <div className="space-y-4">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="p-4 bg-gray-900 border border-gray-700 rounded cursor-pointer"
            onClick={() => router.push(`/user/tickets/${t.id}`)}
          >
            <div className="flex justify-between">
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <span className="text-sm text-gray-400">{t.status}</span>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              {new Date(t.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
