"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function TicketPage({ params }: { params: { id: string } }) {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const { id } = params;

  const [ticket, setTicket] = useState<any>(null);
  const [files, setFiles] = useState<FileList | null>(null);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: ticketData } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", id)
      .single();

    const { data: attachmentsData } = await supabase.storage
      .from("ticket_attachments")
      .list(id);

    setTicket(ticketData || null);

    if (attachmentsData) {
      const urls = attachmentsData.map((file: any) => {
        const { data } = supabase.storage
          .from("ticket_attachments")
          .getPublicUrl(`${id}/${file.name}`);
        return data.publicUrl;
      });

      setAttachments(urls);
    }

    setLoading(false);
  }

  async function uploadFiles() {
    if (!files) return;

    const uploads = await Promise.all(
      Array.from(files).map(async (f: File) => {
        await supabase.storage
          .from("ticket_attachments")
          .upload(`${id}/${f.name}`, f, { upsert: true });

        const { data } = await supabase.storage
          .from("ticket_attachments")
          .getPublicUrl(`${id}/${f.name}`);

        return data.publicUrl;
      })
    );

    setAttachments((prev) => [...prev, ...uploads]);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Zgłoszenie</h1>

      <div className="bg-gray-900 p-4 rounded mb-6">
        <p><strong>Tytuł:</strong> {ticket.title}</p>
        <p><strong>Opis:</strong> {ticket.description}</p>
        <p><strong>Status:</strong> {ticket.status}</p>
      </div>

      <h2 className="text-xl font-semibold mb-2">Załączniki</h2>

      <div className="space-y-2 mb-4">
        {attachments.map((url, i) => (
          <div key={i}>
            <a href={url} target="_blank" className="text-blue-400 underline">
              {url}
            </a>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="text-gray-400">Brak załączników</p>
        )}
      </div>

      <input
        type="file"
        multiple
        onChange={(e) => setFiles(e.target.files)}
        className="mb-4"
      />

      <button
        onClick={uploadFiles}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
      >
        Dodaj załączniki
      </button>
    </div>
  );
}
