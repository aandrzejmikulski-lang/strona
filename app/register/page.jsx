"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function RegisterPage() {
  const supabase = createClientComponentClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  async function register(e: any) {
    e.preventDefault();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      alert("Błąd rejestracji: " + authError.message);
      return;
    }

    const user = authData.user;

    if (!user) {
      alert("Błąd: brak użytkownika po rejestracji");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      email,
      full_name: fullName,
      role: "user",
      is_active: false,
      community_id: null,
    });

    if (profileError) {
      alert("Błąd tworzenia profilu: " + profileError.message);
      return;
    }

    alert("Rejestracja udana!");
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rejestracja</h1>

      <form onSubmit={register} className="space-y-4">
        <input
          type="text"
          placeholder="Imię i nazwisko"
          className="w-full p-2 bg-gray-800 border border-gray-700"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 bg-gray-800 border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          className="w-full p-2 bg-gray-800 border border-gray-700"
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
