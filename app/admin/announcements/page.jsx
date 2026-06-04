"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function AdminAnnouncementsPage() {
  const supabase = getSupabaseBrowserClient();
  const [announcements, setAnnouncements] = useState([]);

  async function load() {
    const { data } = await supabase
      .from("announcements")
      .select(`
        id,
        title,
        pinned,
        created_at,
        announcement_communities (
          community_id,
          communities (name)
        )
      `)
      .order("created_at", { ascending: false });

    setAnnouncements(data || []);
  }

  async function togglePinned(id, current) {
    await supabase
      .from("announcements")
      .update({ pinned: !current })
      .eq("id", id);

    load();
  }

  async function removeAnnouncement(id) {
    if (!confirm("Na pewno usunąć ogłoszenie?")) return;

    await supabase.from("announcement_communities").delete().eq("announcement_id", id);
    await supabase.from("announcements").delete().eq("id", id);

    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Ogłoszenia</h1>

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className="p-4 bg-gray-900 border border-gray-700 rounded"
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">{a.title}</h2>
                <p className="text-gray-500 text-sm">
                  {new Date(a.created_at).toLocaleString()}
                </p>

                <div className="text-sm text-gray-400 mt-2">
                  Wspólnoty:{" "}
                  {a.announcement_communities
                    .map((ac) => ac.communities.name)
                    .join(", ") || "Brak"}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => togglePinned(a.id, a.pinned)}
                  className={`px-4 py-2 rounded ${
                    a.pinned
                      ? "bg-yellow-600 hover:bg-yellow-700"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {a.pinned ? "Odepnij" : "Przypnij"}
                </button>

                <button
                  onClick={() => removeAnnouncement(a.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
