"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function SelectCommunityPage() {
  const router = useRouter()
  const [communities, setCommunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadCommunities = async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("name", { ascending: true })

      if (error) {
        setError("Błąd podczas pobierania wspólnot")
      } else {
        setCommunities(data)
      }

      setLoading(false)
    }

    loadCommunities()
  }, [])

  const selectCommunity = async (communityId) => {
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setError("Brak użytkownika")
      return
    }

    const { error } = await supabase
      .from("profiles")
      .update({ wspolnota_id: communityId })
      .eq("id", user.id)

    if (error) {
      setError("Nie udało się zapisać wspólnoty")
      return
    }

    router.push("/user/dashboard")
  }

  if (loading) return <p>Ładowanie...</p>

  return (
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Wybierz wspólnotę</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {communities.length === 0 && (
        <p>Brak dostępnych wspólnot. Skontaktuj się z administratorem.</p>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {communities.map((c) => (
          <li key={c.id} style={{ marginBottom: 12 }}>
            <button
              style={{
                width: "100%",
                padding: "10px 15px",
                borderRadius: 6,
                border: "1px solid #ccc",
                cursor: "pointer"
              }}
              onClick={() => selectCommunity(c.id)}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
