"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: string;
  attachment: string | null;
  created_at: string;
  community?: {
    id: string;
    name: string;
  };
};

// 🔥 POLSKIE STATUSY
const STATUS_LABELS: Record<string, string> = {
  open: "Otwarte",
  in_progress: "W trakcie",
  closed: "Zamknięte",
};

export default function UserTicketsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {}
  );

  const fetchTickets = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("tickets")
      .select(`
        id,
        title,
        description,
        status,
        attachment,
        created_at,
        community:communities (id, name)
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setTickets(data || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const loadAttachmentUrl = async (ticket: Ticket) => {
    if (!ticket.attachment) return;

    const { data } = await supabase.storage
      .from("ticket_attachments")
      .createSignedUrl(ticket.attachment, 3600);

    if (data?.signedUrl) {
      setAttachmentUrls((prev) => ({
        ...prev,
        [ticket.id]: data.signedUrl,
      }));
    }
  };

  useEffect(() => {
    tickets.forEach((t) => loadAttachmentUrl(t));
  }, [tickets]);

  const handleOpenTicket = (ticketId: string) => {
    router.push(`/user/tickets/${ticketId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Twoje zgłoszenia</h1>

        <div className="flex gap-2">
          <button
            onClick={() => router.push("/user/tickets/new")}
            className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-sm font-semibold"
          >
            + Dodaj zgłoszenie
          </button>

          <button
            onClick={fetchTickets}
            className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
          >
            Odśwież
          </button>
        </div>
      </div>

      {loading ? (
        <div>Ładowanie zgłoszeń...</div>
      ) : tickets.length === 0 ? (
        <div>Brak zgłoszeń.</div>
      ) : (
        <div className="overflow-x-auto border border-gray-800 rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-4 py-2 text-left">Tytuł</th>
                <th className="px-4 py-2 text-left">Wspólnota</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Załącznik</th>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Akcja</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => {
                const attachmentUrl = attachmentUrls[ticket.id];

                return (
                  <tr
                    key={ticket.id}
                    className="border-t border-gray-800 hover:bg-gray-900/40"
                  >
                    <td className="px-4 py-2 align-top">
                      <div className="font-semibold">{ticket.title}</div>
                      <div className="text-xs text-gray-400 line-clamp-2">
                        {ticket.description}
                      </div>
                    </td>

                    <td className="px-4 py-2 align-top">
                      {ticket.community?.name || "—"}
                    </td>

                    <td className="px-4 py-2 align-top">
                      {STATUS_LABELS[ticket.status] || ticket.status}
                    </td>

                    <td className="px-4 py-2 align-top">
                      {attachmentUrl ? (
                        <a
                          href={attachmentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-400 hover:underline text-xs"
                        >
                          Otwórz załącznik
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500">Brak</span>
                      )}
                    </td>

                    <td className="px-4 py-2 align-top text-xs text-gray-400">
                      {new Date(ticket.created_at).toLocaleString("pl-PL")}
                    </td>

                    <td className="px-4 py-2 align-top">
                      <button
                        onClick={() => handleOpenTicket(ticket.id)}
                        className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-xs font-semibold"
                      >
                        Open
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
