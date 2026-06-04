"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";

export default function TicketDetailsPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const params = useParams();

  const [ticket, setTicket] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    async function load() {
      const id = params.id;

      const { data: ticketData } = await supabase
        .from("tickets")
        .select("*")
        .eq("id", id)
        .single();

      setTicket(ticketData);

      // Pobieramy zdjęcia z bucketu ticket_attachments
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
    }

    load();
  }, []);

  if (!ticket) {
    return <div className="text-white p-6">Ładowanie...</div>;
  }

  return (
    <div className="text-white p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">{ticket.title}</h1>
      <p className="text-gray-400 mb-4">{ticket.description}</p>

      <div className="mb-4">
        <span className="font-semibold">Status:</span> {ticket.status}
      </div>

      <div className="mb-4">
        <span className="font-semibold">Priorytet:</span> {ticket.priority}
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2">Zdjęcia</h2>

      {images.length === 0 && (
        <div className="text-gray-400">Brak zdjęć</div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {images.map((url, i) => (
          <img
            key={i}
            src={url}
            className="w-full h-auto rounded border border-gray-700"
          />
        ))}
      </div>
    </div>
  );
}
