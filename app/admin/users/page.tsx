"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function UsersPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    users: 0,
    activeUsers: 0,
    communities: 0,
    pendingUsers: 0,
  });

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadStats() {
    const [{ count: usersCount }, { count: activeCount }, { count: pendingCount }, { count: communitiesCount }] =
      await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", false),
        supabase.from("communities").select("*", { count: "exact", head: true }),
      ]);

    setStats({
      users: usersCount ?? 0,
      activeUsers: activeCount ?? 0,
      pendingUsers: pendingCount ?? 0,
      communities: communitiesCount ?? 0,
    });
  }

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        id,
        email,
        full_name,
        role,
        is_active,
        community_id,
        communities:community_id ( name )
      `)
      .order("created_at", { ascending: true });

    if (!error) setUsers(data);
  }

  async function activateUser(id: string) {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: true })
      .eq("id", id);

    if (error) {
      console.error("❌ Błąd aktywacji:", error);
      alert("Błąd aktywacji użytkownika");
      return;
    }

    loadUsers();
    loadStats();
  }

  async function deleteUser(id: string) {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("❌ Błąd usuwania:", error);
      alert("Błąd usuwania użytkownika");
      return;
    }

    loadUsers();
    loadStats();
  }

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      await loadStats();
      await loadUsers();
      setLoading(false);
    }

    checkAccess();
  }, []);

  if (loading) return <div className="p-6">Ładowanie...</div>;

  return (
    <div className="p-6 space-y-10">
      <h1 className="text-2xl font-bold mb-6">Użytkownicy</h1>

      {/* STATYSTYKI */}
      <div className="grid grid-cols-4 gap-6">
        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <div className="text-gray-400">Wszyscy użytkownicy</div>
          <div className="text-3xl font-bold">{stats.users}</div>
        </div>

        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <div className="text-gray-400">Aktywni</div>
          <div className="text-3xl font-bold text-green-400">{stats.activeUsers}</div>
        </div>

        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <div className="text-gray-400">Oczekujący</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.pendingUsers}</div>
        </div>

        <div className="p-4 bg-gray-800 rounded border border-gray-700">
          <div className="text-gray-400">Wspólnoty</div>
          <div className="text-3xl font-bold">{stats.communities}</div>
        </div>
      </div>

      {/* TABELA UŻYTKOWNIKÓW */}
      <table className="w-full border border-gray-700">
        <thead>
          <tr className="bg-gray-800">
            <th className="p-2 border border-gray-700">Imię i nazwisko</th>
            <th className="p-2 border border-gray-700">Email</th>
            <th className="p-2 border border-gray-700">Rola</th>
            <th className="p-2 border border-gray-700">Wspólnota</th>
            <th className="p-2 border border-gray-700">Status</th>
            <th className="p-2 border border-gray-700">Akcje</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u: any) => (
            <tr key={u.id} className="border border-gray-700">
              <td className="p-2 border border-gray-700">{u.full_name ?? "—"}</td>
              <td className="p-2 border border-gray-700">{u.email}</td>
              <td className="p-2 border border-gray-700">{u.role}</td>
              <td className="p-2 border border-gray-700">
                {u.communities?.name ?? "—"}
              </td>
              <td className="p-2 border border-gray-700">
                {u.is_active === true ? (
                  <span className="text-green-400">Aktywny</span>
                ) : (
                  <span className="text-yellow-400">Oczekuje</span>
                )}
              </td>
              <td className="p-2 border border-gray-700 space-x-2">
                {u.is_active !== true && (
                  <button
                    onClick={() => activateUser(u.id)}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    Aktywuj
                  </button>
                )}

                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
                >
                  Usuń
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
