"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function NewTicketPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [files, setFiles] = useState<FileList | null>(null);

  // 🔥 POPRAWKA — dodany typ parametru
  async function createTicket(e: React.FormEvent) {
    e.preventDefault();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      router.push("/login");
      return;
    }

    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        title,
        description,
        status: "open",
        user_id: auth.user.id,
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Błąd tworzenia zgłoszenia");
      return;
    }

    // Upload plików
    if (files) {
      await Promise.all(
        Array.from(files).map(async (f: File) => {
          await supabase.storage
            .from("ticket_attachments")
            .upload(`${ticket.id}/${f.name}`, f, { upsert: true });
        })
      );
    }

    router.push(`/user/tickets/${ticket.id}`);
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nowe zgłoszenie</h1>

      <form onSubmit={createTicket} className="space-y-4">
        <input
          type="text"
          placeholder="Tytuł"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Opis"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="file"
          multiple
          onChange={(e) => setFiles(e.target.files)}
          className="w-full"
        />

        <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold">
          Utwórz zgłoszenie
        </button>
      </form>
    </div>
  );
}
