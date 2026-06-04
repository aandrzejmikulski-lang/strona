"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";

export default function NewTicketPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [files, setFiles] = useState([]);

  async function createTicket(e) {
    e.preventDefault();

    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (!profile) {
      alert("Brak profilu użytkownika");
      return;
    }

    const { data: ticket, error } = await supabase
      .from("tickets")
      .insert({
        user_id: auth.user.id,
        community_id: profile.community_id,
        title,
        description,
        priority,
        status: "open",
      })
      .select()
      .single();

    if (error) {
  console.error("SUPABASE ERROR:", error);
  alert(error.message);
  return;
}


    // Upload zdjęć do bucketu ticket_attachments
    for (const file of files) {
      const filePath = `${ticket.id}/${Date.now()}-${file.name}`;
      await supabase.storage.from("ticket_attachments").upload(filePath, file);
    }

    router.push("/user/tickets");
  }

  return (
    <div className="text-white p-6 max-w-xl mx-auto">
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
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Niski</option>
          <option value="medium">Średni</option>
          <option value="high">Wysoki</option>
        </select>

        <input
          type="file"
          multiple
          onChange={(e) => setFiles([...e.target.files])}
          className="w-full"
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Zapisz zgłoszenie
        </button>
      </form>
    </div>
  );
}
