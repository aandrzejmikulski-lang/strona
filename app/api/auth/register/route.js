import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const body = await req.json();
  const { email, password } = body;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  // 1. Tworzymy użytkownika
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "user", // 🔥 USTAWIAMY ROLĘ
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
