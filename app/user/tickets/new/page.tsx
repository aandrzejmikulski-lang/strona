"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function NewTicketPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 Pobranie użytkownika
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    // 🔥 Pobranie community_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("community_id")
      .eq("id", user.id)
      .single();

    if (!profile?.community_id) {
      alert("Brak przypisanej wspólnoty.");
      setLoading(false);
      return;
    }

    const communityId = profile.community_id;

    // 🔥 Insert zgłoszenia
    const { data, error } = await supabase
      .from("tickets")
      .insert({
        title,
        description,
        status: "open",
        user_id: user.id,
        community_id: communityId,
      })
      .select();

    if (error || !data || data.length === 0) {
      alert("Nie udało się utworzyć zgłoszenia.");
      setLoading(false);
      return;
    }

    const newTicketId = data[0].id;

    // 🔥 Upload załącznika
    if (file) {
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}.${ext}`;
      const filePath = `${newTicketId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("ticket_attachments")
        .upload(filePath, file, {
          upsert: true,
        });

      if (uploadError) {
        console.error(uploadError);
        alert("Zgłoszenie utworzone, ale załącznik się nie zapisał.");
      }
    }

    router.push(`/user/tickets/${newTicketId}`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <button
        onClick={() => router.push("/user/tickets")}
        className="mb-6 px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-sm"
      >
        ← Powrót
      </button>

      <h1 className="text-2xl font-bold mb-6">Nowe zgłoszenie</h1>

      <form onSubmit={handleCreate} className="space-y-4 max-w-lg">
        <input
          type="text"
          placeholder="Tytuł"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Opis"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        {/* 🔥 Załącznik */}
        <input
          type="file"
          className="w-full p-3 bg-gray-800 border border-gray-700 rounded"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {loading ? "Tworzenie..." : "Utwórz zgłoszenie"}
        </button>
      </form>
    </div>
  );
}
