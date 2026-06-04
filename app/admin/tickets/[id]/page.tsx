"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";

export default function AdminTicketDetailsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const params = useParams();

  const [ticket, setTicket] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) {
        router.push("/login");
        return;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", auth.user.id)
        .single();

      if (!me || me.role !== "admin") {
        router.push("/403");
        return;
      }

      const id = params.id;

      const { data: ticketData } = await supabase
        .from("tickets")
        .select("*, profiles!tickets_user_id_fkey(full_name, email)")
        .eq("id", id)
        .single();

      setTicket(ticketData);

      const { data: files } = await supabase.storage
        .from("ticket_attachments")
        .list(`${id}/`);

      if (files) {
        const urls = await Promise.all(
          files.map(async (f) => {
            const { data } = await supabase.storage
              .from("ticket_attachments")
              .getPublicUrl(`${id}/${f.name}`);
            return data.publicUrl;
          })
        );
        setImages(urls);
      }

      setLoading(false);
    }

    load();
  }, []);

  async function changeStatus(newStatus) {
    if (!ticket) return;
    setUpdating(true);

    await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticket.id);

    setTicket({ ...ticket, status: newStatus });
    setUpdating(false);
  }

  if (loading || !ticket) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/admin/tickets")}
          className="mb-4 text-sm text-gray-400 hover:text-gray-200"
        >
          ← Wróć do listy
        </button>

        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
            <p className="text-gray-400 mb-2">
              Zgłaszający:{" "}
              {ticket.profiles
                ? ticket.profiles.full_name || ticket.profiles.email
                : "nieznany użytkownik"}
            </p>
            <p className="text-gray-500 text-sm">
              {new Date(ticket.created_at).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="mb-2">
              <span className="px-2 py-1 rounded bg-gray-800">
                {ticket.status}
              </span>
            </div>
            <div className="space-x-2">
              <button
                disabled={updating}
                onClick={() => changeStatus("open")}
                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 rounded"
              >
                Otwórz
              </button>
              <button
                disabled={updating}
                onClick={() => changeStatus("in_progress")}
                className="px-2 py-1 text-xs bg-blue-700 hover:bg-blue-800 rounded"
              >
                W realizacji
              </button>
              <button
                disabled={updating}
                onClick={() => changeStatus("closed")}
                className="px-2 py-1 text-xs bg-green-700 hover:bg-green-800 rounded"
              >
                Zamknij
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Opis zgłoszenia</h2>
          <p className="text-gray-200 whitespace-pre-line">
            {ticket.description}
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-2">Zdjęcia</h2>
          {images.length === 0 && (
            <div className="text-gray-400">Brak zdjęć</div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((url, i) => (
              <img
                key={i}
                src={url}
                className="w-full h-auto rounded border border-gray-700"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
