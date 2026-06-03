"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function PendingApprovalPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    async function checkStatus() {
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

      if (profile.is_active) {
        if (String(profile.role).trim().toLowerCase() === "admin") {
          router.push("/admin");
        } else if (!profile.community_id) {
          router.push("/select-community");
        } else {
          router.push("/dashboard");
        }
      }
    }

    checkStatus();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="bg-gray-900 p-8 rounded-xl w-full max-w-lg border border-gray-700 text-center">
        <h1 className="text-3xl font-bold mb-4">Konto oczekuje na akceptację</h1>
        <p className="text-gray-300 mb-4">
          Twoje konto zostało utworzone, ale jeszcze nie zostało aktywowane przez
          administratora.
        </p>
        <p className="text-gray-500 text-sm">
          Gdy tylko administrator zatwierdzi dostęp, będziesz mógł się zalogować
          i korzystać z systemu.
        </p>

        <button
          className="mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          onClick={() => router.push("/login")}
        >
          Wróć do logowania
        </button>
      </div>
    </div>
  );
}
