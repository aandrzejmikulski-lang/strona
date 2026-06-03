"use client";

export default function AdminTable({ columns = [], data = [] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-800 rounded-lg bg-gray-950">
        <thead className="bg-gray-900">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-3 text-left font-semibold text-gray-300"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-t border-gray-800 hover:bg-gray-900/50 transition"
            >
              {columns.map((col) => (
                <td key={col.key} className="p-3 text-gray-200">
                  {typeof col.render === "function"
                    ? col.render(row)
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
