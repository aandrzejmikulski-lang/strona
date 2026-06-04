"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  function validatePassword(pwd: string) {
    if (pwd.length < 8) return "Hasło musi mieć minimum 8 znaków";
    if (!/[A-Z]/.test(pwd)) return "Hasło musi zawierać wielką literę";
    if (!/[a-z]/.test(pwd)) return "Hasło musi zawierać małą literę";
    if (!/[0-9]/.test(pwd)) return "Hasło musi zawierać cyfrę";
    return null;
  }

  async function register(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) return alert("Podaj imię i nazwisko");
    if (!phone.trim()) return alert("Podaj numer telefonu");

    const pwdError = validatePassword(password);
    if (pwdError) return alert(pwdError);

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert("Błąd rejestracji: " + error.message);
      return;
    }

    // ZAPAMIĘTAJ DANE DO UZUPEŁNIENIA PROFILU
    localStorage.setItem("pending_full_name", fullName);
    localStorage.setItem("pending_phone", phone);

    alert("Rejestracja udana! Sprawdź maila i potwierdź adres email.");
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
          type="tel"
          placeholder="Telefon"
          className="w-full p-2 bg-gray-800 border border-gray-700"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
