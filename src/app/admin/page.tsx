import { AppShell } from "@/components/app-shell";
import { PageHeader, StatCard } from "@/components/ui";

const rows = [
  ["Priya Rao", "18 trips", "Active", "USER"],
  ["Nisha Rao", "11 trips", "Active", "USER"],
  ["Aarav Mehta", "7 trips", "Review", "USER"],
  ["Admin Lead", "42 trips", "Active", "ADMIN"],
];

export default function AdminPage() {
  return (
    <AppShell active="Admin">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Admin console"
          title="Monitor platform health and travel demand."
          description="Operational KPIs, user management, top cities, and activity trends for Traveloop administrators."
        />
        <section className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total users" value="12,840" tone="indigo" />
          <StatCard label="Total trips" value="31,406" tone="amber" />
          <StatCard label="Active today" value="1,284" tone="emerald" />
        </section>
        <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="surface-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Trips created over 30 days</h2>
            <div className="mt-8 flex h-64 items-end gap-3">
              {[48, 64, 52, 78, 70, 92, 86, 104, 96, 128, 116, 140].map((value, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-xl bg-gradient-to-t from-indigo-500 to-amber-300"
                    style={{ height: `${value}px` }}
                  />
                  <span className="text-[10px] text-slate-500">{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="surface-panel rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white">Top cities</h2>
            <div className="mt-6 space-y-4">
              {["Tokyo", "Lisbon", "Bali", "Paris", "Seoul"].map((city, index) => (
                <div key={city}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-slate-300">{city}</span>
                    <span className="text-white">{94 - index * 7}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-indigo-400" style={{ width: `${94 - index * 7}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="surface-panel overflow-hidden rounded-3xl">
          <div className="border-b border-slate-800 p-5">
            <h2 className="text-xl font-semibold text-white">User management</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-slate-950/70 text-slate-400">
                <tr>
                  {["User", "Trips", "Status", "Role", "Action"].map((head) => (
                    <th key={head} className="px-5 py-4 font-medium">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row[0]} className="border-t border-slate-800">
                    {row.map((cell) => (
                      <td key={cell} className="px-5 py-4 text-slate-300">{cell}</td>
                    ))}
                    <td className="px-5 py-4">
                      <button type="button" aria-label={`Review ${row[0]}`} className="rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-indigo-300">
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
