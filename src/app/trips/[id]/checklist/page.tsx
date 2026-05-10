import { AppShell } from "@/components/app-shell";
import { Icon, ProgressBar } from "@/components/ui";
import { checklistGroups, getTrip } from "@/lib/traveloop-data";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);

  const totalPacked = checklistGroups.reduce(
    (acc, group) => acc + group.items.filter((i) => i.packed).length,
    0,
  );
  const totalItems = checklistGroups.reduce(
    (acc, group) => acc + group.items.length,
    0,
  );
  const progressPercent = Math.round((totalPacked / totalItems) * 100);

  const categoryIcons: Record<string, string> = {
    Documents: "notes",
    Clothing: "trips",
    Electronics: "budget",
  };

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search checklist"
              placeholder="Search items..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          {["Group by", "Filter", "Sort by"].map((label) => (
            <button
              key={label}
              type="button"
              className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {label}
            </button>
          ))}
        </section>

        {/* Header card */}
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-950">
                  Packing Checklist
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Trip: {trip.name}
                </p>
              </div>
              <div className="hidden rounded-xl border border-sky-100 bg-white px-4 py-2 text-center md:block">
                <p className="text-2xl font-black text-sky-600">
                  {progressPercent}%
                </p>
                <p className="text-xs text-slate-500">packed</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">
                  Progress: {totalPacked}/{totalItems} items packed
                </span>
                <span className="font-bold text-sky-600">
                  {progressPercent}%
                </span>
              </div>
              <ProgressBar value={progressPercent} />
            </div>
          </div>

          {/* Checklist categories */}
          <div className="divide-y divide-sky-50 p-5">
            {checklistGroups.map((group) => {
              const packedInGroup = group.items.filter((i) => i.packed).length;
              const iconName = categoryIcons[group.category] || "check";

              return (
                <div key={group.category} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600">
                        <Icon
                          name={iconName as "notes" | "trips" | "budget"}
                          className="h-4 w-4"
                        />
                      </span>
                      <h2 className="text-lg font-black text-slate-950">
                        {group.category}
                      </h2>
                    </div>
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                      {packedInGroup}/{group.items.length}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 pl-12">
                    {group.items.map((item) => (
                      <label
                        key={item.name}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition hover:border-sky-200 ${
                          item.packed
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-sky-100 bg-white text-slate-700"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.packed}
                          readOnly
                          className="h-4 w-4 rounded accent-emerald-500"
                        />
                        <span
                          className={
                            item.packed ? "line-through opacity-70" : ""
                          }
                        >
                          {item.name}
                        </span>
                        {item.packed && (
                          <Icon
                            name="check"
                            className="ml-auto h-4 w-4 text-emerald-500"
                          />
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <section className="grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <Icon name="plus" className="h-4 w-4" />
            Add item
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Reset all
          </button>
          <button
            type="button"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
          >
            <Icon name="share" className="h-4 w-4" />
            Share Checklist
          </button>
        </section>
      </div>
    </AppShell>
  );
}
