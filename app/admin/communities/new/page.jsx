"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "../../../../lib/supabaseBrowser";
import { Button } from "../../../../components/ui/Button";

export default function NewCommunityPage() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    city: "",
    address: "",
    postal_code: "",
    nip: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("communities").insert([
      {
        name: form.name,
        city: form.city,
        address: form.address,
        postal_code: form.postal_code,
        nip: form.nip,
      },
    ]);

    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }

    // 🔥 RESET FORMULARZA
    setForm({
      name: "",
      city: "",
      address: "",
      postal_code: "",
      nip: "",
    });

    setLoading(false);

    // 🔥 PRZEJŚCIE DO LISTY
    router.push("/admin/communities");
  }

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <h1 className="text-3xl font-bold mb-6">Dodaj wspólnotę</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md bg-gray-950 p-6 rounded-xl border border-gray-800"
      >
        {[
          { key: "name", label: "Nazwa wspólnoty", placeholder: "np. Wspólnota Zielone Wzgórze" },
          { key: "city", label: "Miasto", placeholder: "np. Gostyń" },
          { key: "address", label: "Adres", placeholder: "np. Pl. K. Marcinkowskiego 7 7a" },
          { key: "postal_code", label: "Kod pocztowy", placeholder: "np. 63-800" },
          { key: "nip", label: "NIP", placeholder: "np. 6961595173" },
        ].map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="block text-sm text-gray-400 mb-1">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => updateField(key, e.target.value)}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white"
              placeholder={placeholder}
              required={key === "name"}
            />
          </div>
        ))}

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 p-2 rounded">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
        >
          {loading ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </form>
    </div>
  );
}
