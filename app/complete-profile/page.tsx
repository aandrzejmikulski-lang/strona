// /app/complete-profile/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function CompleteProfilePage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  useEffect(() => {
    async function createProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const full_name = localStorage.getItem("pending_full_name") || "";
      const phone = localStorage.getItem("pending_phone") || "";

      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        full_name,
        phone,
        role: "user",
        is_active: false,
        community_id: null,
      });

      localStorage.removeItem("pending_full_name");
      localStorage.removeItem("pending_phone");

      router.push("/pending-approval");
    }

    createProfile();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div>Tworzenie profilu...</div>
    </div>
  );
}
