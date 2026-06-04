"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Ticket = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
};

export default function UserTicketsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  // 🔥 POPRAWKA — dodany typ tablicy
  const [tickets, setTickets] = useState<Ticket[]>([]);
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

      setTickets((ticketsData as Ticket[]) || []);
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Twoje zgłoszenia</h1>

        {tickets.length === 0 && (
          <div className="text-gray-400">Nie masz jeszcze żadnych zgłoszeń.</div>
        )}

        <div className="space-y-3">
          {tickets.map((t: Ticket) => (
            <div
              key={t.id}
              className="p-4 bg-gray-900 border border-gray-700 rounded cursor-pointer hover:border-gray-500"
              onClick={() => router.push(`/user/tickets/${t.id}`)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold">{t.title}</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {t.description?.slice(0, 120)}
                    {t.description && t.description.length > 120 ? "..." : ""}
                  </p>
                </div>

                <div className="text-right text-sm">
                  <div className="mb-1">
                    <span className="px-2 py-1 rounded bg-gray-800">
                      {t.status}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {new Date(t.created_at).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
