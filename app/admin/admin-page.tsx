"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function AdminPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [profiles, setProfiles] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: me } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!me || me.role !== "admin") {
        router.push("/403");
        return;
      }

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: communitiesData } = await supabase
        .from("communities")
        .select("*");

      setProfiles(profilesData || []);
      setCommunities(communitiesData || []);
      setLoading(false);
    }

    load();
  }, []);

  async function setActive(id, active) {
    await supabase
      .from("profiles")
      .update({ is_active: active })
      .eq("id", id);

    setProfiles((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: active } : p))
    );
  }

  function communityName(id) {
    if (!id) return "brak";
    const c = communities.find((x) => x.id === id);
    return c ? c.name : "brak";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Panel administratora</h1>

        <table className="w-full text-sm border border-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="p-2 border-b border-gray-800 text-left">Email</th>
              <th className="p-2 border-b border-gray-800 text-left">
                Imię i nazwisko
              </th>
              <th className="p-2 border-b border-gray-800 text-left">
                Telefon
              </th>
              <th className="p-2 border-b border-gray-800 text-left">
                Wspólnota
              </th>
              <th className="p-2 border-b border-gray-800 text-left">
                Status
              </th>
              <th className="p-2 border-b border-gray-800 text-left">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => (
              <tr key={p.id} className="border-t border-gray-800">
                <td className="p-2">{p.email}</td>
                <td className="p-2">{p.full_name || "—"}</td>
                <td className="p-2">{p.phone || "—"}</td>
                <td className="p-2">{communityName(p.community_id)}</td>
                <td className="p-2">
                  {p.is_active ? (
                    <span className="text-green-400">aktywne</span>
                  ) : (
                    <span className="text-yellow-400">oczekuje</span>
                  )}
                </td>
                <td className="p-2 space-x-2">
                  {!p.is_active && (
                    <button
                      onClick={() => setActive(p.id, true)}
                      className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
                    >
                      Aktywuj
                    </button>
                  )}
                  {p.is_active && (
                    <button
                      onClick={() => setActive(p.id, false)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs"
                    >
                      Dezaktywuj
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td className="p-4 text-center text-gray-400" colSpan={6}>
                  Brak użytkowników
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
