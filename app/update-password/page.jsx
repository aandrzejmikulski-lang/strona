"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function UpdatePasswordPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase po kliknięciu w link resetu ustawia session w przeglądarce
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        alert("Brak ważnej sesji resetu hasła.");
        router.push("/login");
        return;
      }

      setReady(true);
    }

    checkSession();
  }, []);

  async function handleUpdate(e) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      alert("Błąd zmiany hasła: " + error.message);
      setLoading(false);
      return;
    }

    alert("Hasło zostało zmienione. Zaloguj się ponownie.");
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Sprawdzam sesję resetu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <form
        onSubmit={handleUpdate}
        className="bg-gray-900 p-8 rounded-xl w-full max-w-md border border-gray-700"
      >
        <h1 className="text-3xl font-bold mb-6">Ustaw nowe hasło</h1>

        <input
          type="password"
          placeholder="Nowe hasło"
          className="w-full p-3 mb-6 bg-gray-800 border border-gray-700 rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold"
        >
          {loading ? "Zmieniam..." : "Zmień hasło"}
        </button>
      </form>
    </div>
  );
}
