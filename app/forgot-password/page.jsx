export const dynamic = "force-dynamic";

"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function ForgotPasswordPage() {
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleReset(e) {
    e.preventDefault();

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError("Nie udało się wysłać linku resetującego");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleReset}
        className="bg-gray-900 p-10 rounded-xl w-96 space-y-6"
      >
        <h1 className="text-3xl font-bold">Reset hasła</h1>

        {sent ? (
          <p className="text-green-400">
            Link resetujący został wysłany na email.
          </p>
        ) : (
          <>
            {error && <p className="text-red-500">{error}</p>}

            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded bg-gray-800"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded"
            >
              Wyślij link resetujący
            </button>
          </>
        )}

        <a href="/login" className="block text-center text-blue-400 hover:underline">
          Powrót do logowania
        </a>
      </form>
    </div>
  );
}
