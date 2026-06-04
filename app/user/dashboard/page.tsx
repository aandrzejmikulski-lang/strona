"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../lib/supabaseBrowser";
import type { Profile, Community } from "../../../types/supabase-types";

export default function UserDashboardPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profileData } = (await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()) as { data: Profile | null };

      if (!profileData) {
        router.push("/complete-profile");
        return;
      }

      setProfile(profileData);

      if (profileData.community_id) {
        const { data: communityData } = (await supabase
          .from("communities")
          .select("*")
          .eq("id", profileData.community_id)
          .single()) as { data: Community | null };

        if (communityData) setCommunity(communityData);
      }
    }

    load();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Panel mieszkańca</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Wyloguj
          </button>
        </div>

        {profile && (
          <div className="mb-6 bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Twoje dane</h2>
            <p>
              <span className="text-gray-400">Imię i nazwisko:</span>{" "}
              {profile.full_name || "brak"}
            </p>
            <p>
              <span className="text-gray-400">Email:</span> {profile.email}
            </p>
            <p>
              <span className="text-gray-400">Telefon:</span>{" "}
              {profile.phone || "brak"}
            </p>
          </div>
        )}

        {community && (
          <div className="mb-6 bg-gray-900 p-4 rounded border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Twoja wspólnota</h2>
            <p>
              <span className="text-gray-400">Nazwa:</span> {community.name}
            </p>
            {community.address && (
              <p>
                <span className="text-gray-400">Adres:</span>{" "}
                {community.address}
              </p>
            )}
          </div>
        )}

        {!community && (
          <div className="bg-yellow-900/40 border border-yellow-700 p-4 rounded">
            Nie masz przypisanej wspólnoty.{" "}
            <button
              onClick={() => router.push("/select-community")}
              className="underline text-yellow-300"
            >
              Wybierz wspólnotę
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
