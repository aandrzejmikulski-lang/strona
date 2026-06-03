"use client";

export default function AdminContainer({ title, actions, children }) {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{title}</h1>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>

      <div className="bg-gray-950 rounded-xl border border-gray-800 p-6 shadow-lg">
        {children}
      </div>
    </div>
  );
}
