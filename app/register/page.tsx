"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../lib/supabaseBrowser";

export default function RegisterPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register(e: React.FormEvent) {
    e.preventDefault();

    const { data: auth, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert(authError.message);
      return;
    }

    const user = auth.user;
    if (!user) {
      alert("Błąd: brak użytkownika po rejestracji");
      return;
    }

    // 🔥 KLUCZ: zamiast insert → UPSERT po id
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          phone: phone,
          // role pomijamy, bo masz default 'user' w bazie
        },
        { onConflict: "id" }
      );

    if (profileError) {
      console.error("PROFILE ERROR:", profileError);
      alert("Błąd zapisu profilu");
      return;
    }

    router.push("/login");
  }

  return (
    <div className="text-white p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rejestracja</h1>

      <form onSubmit={register} className="space-y-4">
        <input
          type="text"
          placeholder="Imię i nazwisko"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Telefon"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          className="w-full p-2 bg-gray-900 border border-gray-700 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Zarejestruj
        </button>
      </form>
    </div>
  );
}
