"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function NewAnnouncementPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [pinned, setPinned] = useState<boolean>(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);

  useEffect(() => {
    loadCommunities();
  }, []);

  async function loadCommunities() {
    const { data } = await supabase.from("communities").select("id, name");
    setCommunities(data || []);
  }

  // 🔥 POPRAWIONA FUNKCJA — jedyny błąd
  function toggleCommunity(id: string) {
    setSelectedCommunities((prev) =>
      prev.includes(id)
        ? prev.filter((c) => c !== id)
        : [...prev, id]
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const { data: announcement, error } = await supabase
      .from("announcements")
      .insert({ title, content, pinned })
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Błąd dodawania ogłoszenia");
      return;
    }

    const rows = selectedCommunities.map((cid) => ({
      announcement_id: announcement.id,
      community_id: cid,
    }));

    await supabase.from("announcement_communities").insert(rows);

    router.push("/admin/announcements");
  }

  return (
    <div className="text-white p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nowe ogłoszenie</h1>

      <form onSubmit={submit} className="space-y-4">
        <input
          type="text"
          placeholder="Tytuł"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Treść"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
          />
          Ważne ogłoszenie (pinned)
        </label>

        <div>
          <h2 className="font-semibold mb-2">Przypisz do wspólnot:</h2>
          <div className="space-y-2">
            {communities.map((c) => (
              <label key={c.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedCommunities.includes(c.id)}
                  onChange={() => toggleCommunity(c.id)}
                />
                {c.name}
              </label>
            ))}
          </div>
        </div>

        <button className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded">
          Dodaj ogłoszenie
        </button>
      </form>
    </div>
  );
}
