"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const login = async (e) => {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setError("Niepoprawny email lub hasło")
      return
    }

    // Middleware zdecyduje gdzie user trafi
    router.push("/user/dashboard")
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Logowanie</h2>

      <form onSubmit={login}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Zaloguj</button>
      </form>
    </div>
  )
}
