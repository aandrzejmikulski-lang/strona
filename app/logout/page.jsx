"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

export default function LogoutPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    async function logout() {
      await supabase.auth.signOut();
      router.push("/login");
    }
    logout();
  }, []);

  return <p className="p-10">Wylogowywanie…</p>;
}
