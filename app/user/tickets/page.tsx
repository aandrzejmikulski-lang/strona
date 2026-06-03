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
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  community?: {
    id: string;
    name: string;
  };
};

const STATUS_OPTIONS = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In progress" },
  { value: "closed", label: "Closed" },
];

export default function AdminTicketsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {}
  );

  // -----------------------------
  // FETCH TICKETS
  // -----------------------------
  const fetchTickets = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("tickets")
      .select(
        `
        id,
        title,
        description,
        status,
        attachment,
        created_at,
        user:profiles!tickets_user_id_fkey (
          id,
          full_name,
          email
        ),
        community:communities (
          id,
          name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    } else {
      setTickets(data || []);
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // -----------------------------
  // SIGNED URL FOR PRIVATE BUCKET
  // -----------------------------
  const loadAttachmentUrl = async (ticket: Ticket) => {
    if (!ticket.attachment) return;

    const { data, error } = await supabase.storage
      .from("ticket_attachments")
      .createSignedUrl(ticket.attachment, 3600);

    if (error) {
      console.error("Signed URL error:", error);
      return;
    }

    setAttachmentUrls((prev) => ({
      ...prev,
      [ticket.id]: data.signedUrl,
    }));
  };

  useEffect(() => {
    tickets.forEach((t) => loadAttachmentUrl(t));
  }, [tickets]);

  // -----------------------------
  // UPDATE STATUS
  // -----------------------------
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    try {
      setUpdatingId(ticketId);

      const { error } = await supabase
        .from("tickets")
        .update({ status: newStatus })
        .eq("id", ticketId);

      if (error) {
        console.error("Error updating status:", error);
        alert("Nie udało się zmienić statusu");
        return;
      }

      setTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId ? { ...t, status: newStatus } : t
        )
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenTicket = (ticketId: string) => {
    router.push(`/admin/tickets/${ticketId}`);
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Zgłoszenia</h1>
        <button
          onClick={fetchTickets}
          className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
        >
          Odśwież
        </button>
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
                <th className="px-4 py-2 text-left">Użytkownik</th>
                <th className="px-4 py-2 text-left">Wspólnota</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Załącznik</th>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Akcje</th>
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
                      <div>{ticket.user?.full_name || "—"}</div>
                      <div className="text-xs text-gray-400">
                        {ticket.user?.email || "—"}
                      </div>
                    </td>

                    <td className="px-4 py-2 align-top">
                      {ticket.community?.name || "—"}
                    </td>

                    <td className="px-4 py-2 align-top">
                      <select
                        value={ticket.status}
                        onChange={(e) =>
                          handleStatusChange(ticket.id, e.target.value)
                        }
                        disabled={updatingId === ticket.id}
                        className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
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
                      {ticket.created_at
                        ? new Date(ticket.created_at).toLocaleString("pl-PL")
                        : "—"}
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
