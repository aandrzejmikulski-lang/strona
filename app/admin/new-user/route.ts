import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, email } = body;

    const html = `
      <div style="font-family:Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background:#f3f4f6;">
        <div style="background:#1e293b; padding:20px; color:white; border-radius:8px 8px 0 0;">
          <h2 style="margin:0; font-size:22px;">Nowy użytkownik oczekuje na akceptację</h2>
        </div>

        <div style="background:white; padding:24px; border:1px solid #e5e7eb; border-top:none;">
          <p style="font-size:16px; color:#111827;">
            W systemie pojawił się nowy użytkownik, który wymaga akceptacji przez administratora.
          </p>

          <div style="margin-top:20px; padding:16px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px;">
            <p style="margin:0; font-size:15px;"><strong>Email:</strong> ${email}</p>
            <p style="margin:4px 0 0 0; font-size:15px;"><strong>User ID:</strong> ${user_id}</p>
          </div>

          <a href="https://twojadomena.pl/admin/users"
            style="display:inline-block; margin-top:24px; padding:12px 20px; background:#2563eb; color:white; text-decoration:none; border-radius:6px; font-size:15px;">
            Przejdź do panelu admina
          </a>

          <p style="margin-top:24px; font-size:13px; color:#6b7280;">
            Jeśli to nie Ty inicjowałeś tę akcję, możesz zignorować tę wiadomość.
          </p>
        </div>

        <div style="text-align:center; padding:12px; font-size:12px; color:#6b7280;">
          System powiadomień • Twoja aplikacja
        </div>
      </div>
    `;

    await resend.emails.send({
      from: "System <no-reply@twojadomena.pl>",
      to: "admin@twojadomena.pl",
      subject: "Nowy użytkownik czeka na akceptację",
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Mail error" }, { status: 500 });
  }
}
