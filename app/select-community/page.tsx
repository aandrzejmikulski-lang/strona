// /app/select-community/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

// 🔥 ZAMIANA: zamiast importu z nieistniejącego pliku — lokalny typ
type Community = {
  id: string;
  name: string;
};

export default function SelectCommunityPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selected, setSelected] = useState<string>("");

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("communities").select("*");
      setCommunities((data || []) as Community[]);
    }
    load();
  }, []);

  async function save() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    if (!selected) {
      alert("Wybierz wspólnotę");
      return;
    }

    await supabase
      .from("profiles")
      .update({ community_id: selected })
      .eq("id", user.id);

    router.push("/user/dashboard");
  }

  return (
    <div className="p-6 text-white max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Wybierz wspólnotę</h1>

      <select
        className="w-full p-2 bg-gray-800 border border-gray-700 rounded"
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
      >
        <option value="">-- wybierz --</option>
        {communities.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button
        onClick={save}
        className="w-full mt-4 p-2 bg-blue-600 hover:bg-blue-700 rounded font-semibold"
      >
        Zapisz
      </button>
    </div>
  );
}
