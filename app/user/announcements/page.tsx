import { getSupabaseServerClient } from "@/lib/supabaseServer";

export default async function UserAnnouncementsPage() {
  const supabase = getSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-white p-6">Musisz być zalogowany.</div>;
  }

  const { data: announcements, error } = await supabase
    .from("announcements")
    .select("id, title, content, created_at, pinned")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return <div className="text-white p-6">Błąd pobierania ogłoszeń.</div>;
  }

  return (
    <div className="text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Ogłoszenia</h1>

      {announcements.length === 0 && (
        <p className="text-gray-400">Brak ogłoszeń dla Twojej wspólnoty.</p>
      )}

      <div className="space-y-4">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`p-4 rounded border ${
              a.pinned
                ? "border-yellow-400 bg-yellow-900/20"
                : "border-gray-700 bg-gray-900"
            }`}
          >
            {a.pinned && (
              <span className="text-yellow-400 font-bold text-sm">WAŻNE</span>
            )}
            <h2 className="text-xl font-semibold">{a.title}</h2>
            <p className="text-gray-300 mt-2">{a.content}</p>
            <p className="text-gray-500 text-sm mt-2">
              {new Date(a.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
