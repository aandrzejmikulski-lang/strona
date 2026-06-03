import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { userId, newRole } = await req.json();

    if (!userId || !newRole) {
      return NextResponse.json(
        { error: "Brak wymaganych danych" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // 1. Aktualizacja roli w auth.users (user_metadata)
    const { error: metaError } = await supabase.auth.admin.updateUserById(
      userId,
      {
        user_metadata: { role: newRole },
      }
    );

    if (metaError) {
      return NextResponse.json(
        { error: metaError.message },
        { status: 400 }
      );
    }

    // 2. Aktualizacja roli w tabeli profiles
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId);

    if (profileError) {
      return NextResponse.json(
        { error: profileError.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Rola zaktualizowana" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Update role error:", err);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
