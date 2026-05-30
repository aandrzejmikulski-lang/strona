"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")

  const handleRegister = async (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Hasła nie są takie same")
      return
    }

    // 1. Tworzymy konto w Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) {
      setError(authError.message)
      return
    }

    const userId = authData.user.id

    // 2. Tworzymy profil w tabeli profiles
    const { error: profileError } = await supabase.from("profiles").insert({
      id: userId,
      full_name: fullName,
      email,
      phone,
      role: "user",
      is_active: false,
      wspolnota_id: null
    })

    if (profileError) {
      setError(profileError.message)
      return
    }

    // 3. Przekierowanie na stronę "oczekujesz na akceptację"
    router.push("/pending-approval")
  }

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Rejestracja</h2>

      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Imię i nazwisko"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Telefon"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="password"
          placeholder="Hasło"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Powtórz hasło"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Zarejestruj</button>
      </form>
    </div>
  )
}
