"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseBrowser";

type UploadAttachmentProps = {
  ticketId: string;
  userId: string;
  onUploaded?: (path: string) => void;
};

export default function UploadAttachment({
  ticketId,
  userId,
  onUploaded,
}: UploadAttachmentProps) {
  const supabase = getSupabaseBrowserClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      // 🔥 pełna ścieżka: userId + nazwa pliku
      const filePath = `${userId}/${file.name}`;

      // upload do prywatnego bucketu
      const { data, error: uploadError } = await supabase.storage
        .from("ticket_attachments")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        setError("Nie udało się przesłać pliku.");
        return;
      }

      // zapis ścieżki do tabeli tickets
      const { error: dbError } = await supabase
        .from("tickets")
        .update({ attachment: filePath })
        .eq("id", ticketId);

      if (dbError) {
        console.error("DB update error:", dbError);
        setError("Nie udało się zapisać ścieżki w bazie.");
        return;
      }

      setSuccess("Załącznik przesłany pomyślnie.");
      if (onUploaded) onUploaded(filePath);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError("Wystąpił nieoczekiwany błąd.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 text-sm text-white">
      <label className="font-semibold">Dodaj załącznik:</label>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        className="bg-gray-900 border border-gray-700 rounded px-2 py-1"
      />
      {uploading && <span className="text-gray-400">Przesyłanie...</span>}
      {error && <span className="text-red-500">{error}</span>}
      {success && <span className="text-green-500">{success}</span>}
    </div>
  );
}
