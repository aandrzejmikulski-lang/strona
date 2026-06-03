"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function TicketDetailsPage() {
  const supabase = getSupabaseBrowserClient();
  const params = useParams();
  const id = params.id?.toString(); // 🔥 KLUCZOWA POPRAWKA

  const [ticket, setTicket] = useState(null);
  const [attachmentUrl, setAttachmentUrl] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  // ---- ŁADOWANIE TICKETA ----
  const loadTicket = async () => {
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
      .eq("id", id)
      .single();

    if (!error && data) {
      setTicket(data);

      if (data.attachment) {
        const { data: signed } = await supabase.storage
          .from("ticket_attachments")
          .createSignedUrl(data.attachment, 3600);

        setAttachmentUrl(signed?.signedUrl || null);
      }
    }
  };

  // ---- ŁADOWANIE KOMENTARZY ----
  const loadComments = async () => {
    const { data, error } = await supabase
      .from("ticket_comments")
      .select(
        `
        id,
        content,
        created_at,
        user:profiles(id, full_name)
      `
      )
      .eq("ticket_id", id)
      .order("created_at", { ascending: true });

    if (!error) {
      setComments(data || []);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadTicket();
      await loadComments();
      setLoading(false);
    };
    init();
  }, [id]);

  // ---- DODAWANIE KOMENTARZA ----
  const addComment = async () => {
    if (!newComment.trim()) return;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Brak użytkownika — nie można dodać komentarza.");
      return;
    }

    const { error } = await supabase.from("ticket_comments").insert({
      ticket_id: id, // 🔥 teraz id jest ZAWSZE stringiem
      content: newComment,
      user_id: user.id,
    });

    if (error) {
      console.error("Insert error:", error);
      alert("Nie udało się dodać komentarza.");
      return;
    }

    setNewComment("");
    await loadComments();
  };

  // ---- ZMIANA STATUSU ----
  const updateStatus = async (newStatus) => {
    const { error } = await supabase
      .from("tickets")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      await loadTicket();
    } else {
      console.error(error);
      alert("Nie udało się zmienić statusu.");
    }
  };

  if (loading || !ticket) {
    return <div className="text-white p-8">Ładowanie...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-8">

      {/* NAGŁÓWEK */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{ticket.title}</h1>

        <select
          value={ticket.status}
          onChange={(e) => updateStatus(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded px-3 py-2"
        >
          <option value="open">Nowe</option>
          <option value="in_progress">W trakcie</option>
          <option value="closed">Zamknięte</option>
        </select>
      </div>

      {/* META */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-2">
        <div>
          <span className="text-gray-400">Użytkownik:</span>{" "}
          {ticket.user?.full_name} ({ticket.user?.email})
        </div>

        <div>
          <span className="text-gray-400">Wspólnota:</span>{" "}
          {ticket.community?.name}
        </div>

        <div>
          <span className="text-gray-400">Data zgłoszenia:</span>{" "}
          {new Date(ticket.created_at).toLocaleString("pl-PL")}
        </div>
      </div>

      {/* TREŚĆ ZGŁOSZENIA */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-3">Treść zgłoszenia</h2>
        <p className="text-gray-200 whitespace-pre-line">{ticket.description}</p>
      </div>

      {/* ZAŁĄCZNIK */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-xl font-bold mb-3">Załącznik</h2>

        {attachmentUrl ? (
          <a
            href={attachmentUrl}
            target="_blank"
            className="text-blue-400 hover:underline"
          >
            Otwórz załącznik
          </a>
        ) : (
          <span className="text-gray-500">Brak załącznika</span>
        )}
      </div>

      {/* KOMENTARZE */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
        <h2 className="text-xl font-bold">Komentarze</h2>

        <div className="space-y-4">
          {comments.map((c) => (
            <div
              key={c.id}
              className="bg-black p-4 rounded border border-gray-800"
            >
              <div className="text-sm text-gray-400">
                {c.user?.full_name} •{" "}
                {new Date(c.created_at).toLocaleString("pl-PL")}
              </div>
              <div className="mt-2">{c.content}</div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-gray-500 text-sm">
              Brak komentarzy do tego zgłoszenia.
            </div>
          )}
        </div>

        {/* DODAJ KOMENTARZ */}
        <div className="flex gap-3">
          <input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Dodaj komentarz..."
            className="flex-1 bg-black border border-gray-700 rounded px-3 py-2"
          />
          <button
            onClick={addComment}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Wyślij
          </button>
        </div>
      </div>
    </div>
  );
}
