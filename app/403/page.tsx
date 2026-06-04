// /app/403/page.tsx
export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">403</h1>
        <p>Brak uprawnień do tej strony.</p>
      </div>
    </div>
  );
}
