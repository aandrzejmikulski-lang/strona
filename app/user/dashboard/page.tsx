"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";

// 🔥 ZAMIANA: lokalne typy zamiast importu z nieistniejącego pliku
type Profile = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  community_id: string | null;
};

type Community = {
  id: string;
  name: string;
};

export default function UserDashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);
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

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profileData) {
        router.push("/select-community");
        return;
      }

      setProfile(profileData as Profile);

      if (profileData.community_id) {
        const { data: communityData } = await supabase
          .from("communities")
          .select("*")
          .eq("id", profileData.community_id)
          .single();

        setCommunity(communityData as Community);
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Ładowanie...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Panel użytkownika</h1>

      {profile && (
        <div className="bg-gray-900 p-4 rounded mb-4">
          <p><strong>Imię i nazwisko:</strong> {profile.full_name || "—"}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Telefon:</strong> {profile.phone || "—"}</p>
        </div>
      )}

      {community && (
        <div className="bg-gray-900 p-4 rounded">
          <p><strong>Wspólnota:</strong> {community.name}</p>
        </div>
      )}

      {!community && (
        <button
          onClick={() => router.push("/select-community")}
          className="mt-4 w-full p-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Wybierz wspólnotę
        </button>
      )}
    </div>
  );
}
