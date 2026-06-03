"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function LoginPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("Błędne dane logowania");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!profile) {
      alert("Brak profilu użytkownika");
      setLoading(false);
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

    if (!profile.community_id) {
      router.push("/select-community");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-8 rounded-xl w-full max-w-md border border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-6">Logowanie</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-4 bg-gray-800 border border-gray-700 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          {loading ? "Logowanie..." : "Zaloguj się"}
        </button>

        <div className="flex justify-between mt-4 text-sm text-gray-400">
          <button
            type="button"
            onClick={() => router.push("/register")}
            className="hover:text-white"
          >
            Rejestracja
          </button>

          <button
            type="button"
            onClick={() => router.push("/reset-password")}
            className="hover:text-white"
          >
            Odzyskaj hasło
          </button>
        </div>
      </form>
    </div>
  );
}
