"use client";

import { useEffect, useState, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";
import { useRouter } from "next/navigation";

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: string;
  attachment: string | null;
  created_at: string;
  user?: { id: string; full_name: string; email: string };
  community?: { id: string; name: string };
};

export default function AdminTicketsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {}
  );

  const [filterCommunity, setFilterCommunity] = useState<string>("all");
  const [filterUser, setFilterUser] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [communities, setCommunities] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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
        user:profiles(id, full_name, email),
        community:communities(id, name)
      `
      )
      .order("created_at", { ascending: false });

    if (!error) setTickets(data || []);
    setLoading(false);
  }, [supabase]);

  // -----------------------------
  // FETCH FILTER DATA
  // -----------------------------
  const fetchFilters = useCallback(async () => {
    const { data: comm } = await supabase.from("communities").select("id, name");
    const { data: prof } = await supabase
      .from("profiles")
      .select("id, full_name");

    setCommunities(comm || []);
    setUsers(prof || []);
  }, [supabase]);

  useEffect(() => {
    fetchTickets();
    fetchFilters();
  }, [fetchTickets, fetchFilters]);

  // -----------------------------
  // SIGNED URL FOR PRIVATE BUCKET
  // -----------------------------
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

  // -----------------------------
  // UPDATE STATUS
  // -----------------------------
  const handleStatusChange = async (ticketId: string, newStatus: string) => {
    setUpdatingId(ticketId);

    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", ticketId);

    if (error) {
      alert("Nie udało się zmienić statusu");
      setUpdatingId(null);
      return;
    }

    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
    );

    setUpdatingId(null);
  };

  // -----------------------------
  // FILTERING
  // -----------------------------
  const filteredTickets = tickets.filter((t) => {
    if (filterCommunity !== "all" && t.community?.id !== filterCommunity)
      return false;
    if (filterUser !== "all" && t.user?.id !== filterUser) return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    return true;
  });

  // -----------------------------
  // STATS
  // -----------------------------
  const stats = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-10">

      {/* ---------------- STATS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm">Wszystkie zgłoszenia</div>
          <div className="text-3xl font-bold">{stats.all}</div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm">Nowe</div>
          <div className="text-3xl font-bold">{stats.open}</div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm">W trakcie</div>
          <div className="text-3xl font-bold">{stats.in_progress}</div>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
          <div className="text-gray-400 text-sm">Zamknięte</div>
          <div className="text-3xl font-bold">{stats.closed}</div>
        </div>
      </div>

      {/* ---------------- FILTERS ---------------- */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
        <h2 className="text-xl font-bold">Filtry</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm text-gray-400">Wspólnota</label>
            <select
              value={filterCommunity}
              onChange={(e) => setFilterCommunity(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded px-3 py-2"
            >
              <option value="all">Wszystkie</option>
              {communities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Użytkownik</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded px-3 py-2"
            >
              <option value="all">Wszyscy</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded px-3 py-2"
            >
              <option value="all">Wszystkie</option>
              <option value="open">Nowe</option>
              <option value="in_progress">W trakcie</option>
              <option value="closed">Zamknięte</option>
            </select>
          </div>

        </div>
      </div>

      {/* ---------------- TABLE ---------------- */}
      <div className="overflow-x-auto border border-gray-800 rounded-xl">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left">Tytuł</th>
              <th className="px-4 py-3 text-left">Użytkownik</th>
              <th className="px-4 py-3 text-left">Wspólnota</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Załącznik</th>
              <th className="px-4 py-3 text-left">Data</th>
              <th className="px-4 py-3 text-left">Akcje</th>
            </tr>
          </thead>

          <tbody>
            {filteredTickets.map((t) => (
              <tr
                key={t.id}
                className="border-t border-gray-800 hover:bg-gray-900/40"
              >
                <td className="px-4 py-3">{t.title}</td>

                <td className="px-4 py-3">
                  {t.user?.full_name}
                  <div className="text-gray-500 text-xs">{t.user?.email}</div>
                </td>

                <td className="px-4 py-3">{t.community?.name}</td>

                <td className="px-4 py-3">
                  <select
                    value={t.status}
                    disabled={updatingId === t.id}
                    onChange={(e) =>
                      handleStatusChange(t.id, e.target.value)
                    }
                    className="bg-black border border-gray-700 rounded px-2 py-1 text-xs"
                  >
                    <option value="open">Nowe</option>
                    <option value="in_progress">W trakcie</option>
                    <option value="closed">Zamknięte</option>
                  </select>
                </td>

                <td className="px-4 py-3">
                  {attachmentUrls[t.id] ? (
                    <a
                      href={attachmentUrls[t.id]}
                      target="_blank"
                      className="text-blue-400 hover:underline"
                    >
                      Otwórz
                    </a>
                  ) : (
                    <span className="text-gray-500">Brak</span>
                  )}
                </td>

                <td className="px-4 py-3 text-gray-400 text-xs">
                  {new Date(t.created_at).toLocaleString("pl-PL")}
                </td>

                <td className="px-4 py-3">
                  <button
                    onClick={() => router.push(`/admin/tickets/${t.id}`)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                  >
                    Otwórz
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
