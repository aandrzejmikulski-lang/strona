"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function SelectCommunityPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        router.push("/login");
        return;
      }

      const role = String(profile.role).trim().toLowerCase();

      if (role === "admin") {
        router.push("/admin");
        return;
      }

      if (!profile.is_active) {
        router.push("/pending-approval");
        return;
      }

      if (profile.community_id) {
        router.push("/dashboard");
        return;
      }

      const { data } = await supabase.from("communities").select("*");
      setCommunities(data || []);
      setLoading(false);
    }

    checkAccess();
  }, []);

  async function selectCommunity(id) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase
      .from("profiles")
      .update({ community_id: id })
      .eq("id", user.id);

    router.push("/dashboard");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Wybierz wspólnotę</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {communities.map((c) => (
          <button
            key={c.id}
            onClick={() => selectCommunity(c.id)}
            className="bg-gray-900 border border-gray-700 p-6 rounded-xl hover:bg-gray-800 text-left"
          >
            <h2 className="text-xl font-bold">{c.name}</h2>
            <p className="text-gray-400">{c.address}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
