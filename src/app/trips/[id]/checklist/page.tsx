import { AppShell } from "@/components/app-shell";
import { Icon, PageHeader, ProgressBar } from "@/components/ui";
import { checklistGroups, getTrip } from "@/lib/traveloop-data";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-5xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Packing checklist"
          title="Reduce departure-day risk with categorized packing."
          description="Track progress by category, add items inline, and keep packed items visually distinct."
        />
        <section className="glass-panel rounded-3xl p-6">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">{trip.name}</h2>
              <p className="text-sm text-slate-400">
                {trip.checklistPacked} of {trip.checklistTotal} items packed
              </p>
            </div>
            <button type="button" aria-label="Add checklist item" className="inline-flex h-11 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white">
              <Icon name="plus" className="h-4 w-4" />
              Add item
            </button>
          </div>
          <ProgressBar value={(trip.checklistPacked / trip.checklistTotal) * 100} />
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {checklistGroups.map((group) => (
              <div key={group.category} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <h3 className="font-semibold text-white">{group.category}</h3>
                <div className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <label key={item.name} className={`flex items-start gap-3 rounded-xl border border-slate-800 p-3 text-sm ${item.packed ? "bg-emerald-400/10 text-slate-500 line-through" : "bg-slate-900 text-slate-200"}`}>
                      <input type="checkbox" checked={item.packed} readOnly className="mt-0.5 h-4 w-4 accent-emerald-400" />
                      {item.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
