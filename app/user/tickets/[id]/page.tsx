"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

export default function TicketDetailsPage({ params }) {
  const router = useRouter();
  const ticketId = params.id;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      db: { schema: "public" },
    }
  );

  const [ticket, setTicket] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    // 🔥 KLUCZOWE — wymusza załadowanie JWT, inaczej RLS blokuje SELECT
    await supabase.auth.getSession();

    // 🔥 Pobranie zgłoszenia
    const { data: ticketData, error: ticketError } = await supabase
      .from("tickets")
      .select("*")
      .eq("id", ticketId)
      .single();

    console.log("TICKET:", ticketData, ticketError);

    if (!ticketData) {
      setLoading(false);
      return;
    }

    setTicket(ticketData);

    // 🔥 Pobranie listy plików
    const { data: fileList } = await supabase.storage
      .from("ticket_attachments")
      .list(ticketId);

    if (fileList) {
      const urls = fileList.map((file) => {
        const { data: urlData } = supabase.storage
          .from("ticket_attachments")
          .getPublicUrl(`${ticketId}/${file.name}`);

        return {
          name: file.name,
          url: urlData.publicUrl,
        };
      });

      setFiles(urls);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 text-white">
        <p>Ładowanie zgłoszenia...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-6 text-white">
        <p>Nie znaleziono zgłoszenia.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <Link
        href="/user/tickets"
        className="mb-6 inline-block px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
      >
        ← Powrót
      </Link>

      <h1 className="text-3xl font-bold mb-4">{ticket.title}</h1>

      <p className="opacity-80 mb-6">{ticket.description}</p>

      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Załączniki</h2>

        {files.length === 0 && (
          <p className="opacity-60">Brak załączników.</p>
        )}

        <ul className="space-y-2">
          {files.map((file) => (
            <li key={file.name}>
              <a
                href={file.url}
                target="_blank"
                className="text-blue-400 underline hover:text-blue-300"
              >
                {file.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="opacity-60 text-sm">
        Utworzone: {new Date(ticket.created_at).toLocaleString()}
      </div>
    </div>
  );
}
