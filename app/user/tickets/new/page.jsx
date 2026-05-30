"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function NewTicketPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [error, setError] = useState("")

  const createTicket = async (e) => {
    e.preventDefault()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    const { error } = await supabase.from("tickets").insert({
      user_id: user.id,
      title,
      description,
      status: "new"
    })

    if (error) {
      setError("Nie udało się utworzyć zgłoszenia")
      return
    }

    router.push("/user/tickets")
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>Nowe zgłoszenie</h2>

      <form onSubmit={createTicket}>
        <input
          type="text"
          placeholder="Tytuł zgłoszenia"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <textarea
          placeholder="Opis zgłoszenia"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Utwórz zgłoszenie</button>
      </form>
    </div>
  )
}
