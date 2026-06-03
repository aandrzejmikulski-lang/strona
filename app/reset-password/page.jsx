"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function ResetPasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      alert("Błąd resetu hasła: " + error.message);
      setLoading(false);
      return;
    }

    alert("Jeśli podany email istnieje, wysłaliśmy link do resetu hasła.");
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleReset}
        className="bg-gray-900 p-8 rounded-xl w-full max-w-md border border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-6">Reset hasła</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-lg"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
        >
          {loading ? "Wysyłam..." : "Wyślij link resetujący"}
        </button>

        <div className="mt-4 text-sm text-gray-400 text-center">
          Pamiętasz hasło?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="hover:text-white underline"
          >
            Wróć do logowania
          </button>
        </div>
      </form>
    </div>
  );
}
