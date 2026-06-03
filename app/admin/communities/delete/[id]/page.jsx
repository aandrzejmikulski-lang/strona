"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../../lib/supabaseBrowser";
import { Button } from "../../../../../components/ui/Button";

export default function DeleteCommunityPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Nie znaleziono wspólnoty");
      } else {
        setCommunity(data);
      }

      setLoading(false);
    }

    load();
  }, [id]);

  async function handleDelete() {
    setDeleting(true);

    const { error } = await supabase
      .from("communities")
      .delete()
      .eq("id", id);

    setDeleting(false);

    if (error) {
      setError(error.message);
    } else {
      router.push("/admin/communities");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        Ładowanie...
      </div>
    );
  }

  if (!community) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        Nie znaleziono wspólnoty
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Usuń wspólnotę</h1>

      <div className="bg-gray-950 border border-gray-800 p-6 rounded-xl max-w-md">
        <p className="text-lg mb-4">
          Czy na pewno chcesz usunąć wspólnotę:
        </p>

        <p className="text-xl font-semibold mb-6 text-red-400">
          {community.name}
        </p>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 p-2 rounded mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-4">
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
          >
            {deleting ? "Usuwanie..." : "Usuń"}
          </Button>

          <Button
            onClick={() => router.push("/admin/communities")}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            Anuluj
          </Button>
        </div>
      </div>
    </div>
  );
}
