import { AppShell } from "@/components/app-shell";
import { BudgetPill, PageHeader, ProgressBar } from "@/components/ui";
import { budgetCategories, formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Budget control"
          title="Track category spend before it becomes a surprise."
          description="Allocated budgets, live spend, daily cost curves, and stop-level costs sit together for fast decisions."
        />
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-5">
            <BudgetPill trip={trip} />
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-amber-100">
              Current plan is within budget with {formatCurrency(trip.budget - trip.spent)} remaining.
            </div>
            <div className="surface-panel rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Category budgets</h2>
              <div className="mt-5 space-y-4">
                {budgetCategories.map((category) => (
                  <label key={category.label} className="block text-sm font-medium text-slate-200">
                    {category.label}
                    <input
                      aria-label={`${category.label} budget`}
                      value={category.value}
                      readOnly
                      className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100"
                    />
                  </label>
                ))}
              </div>
            </div>
          </section>
          <section className="space-y-5">
            <div className="surface-panel rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Cost per day</h2>
              <div className="mt-8 flex h-64 items-end gap-3">
                {[180, 240, 320, 220, 390, 280, 460, 340, 260, 410].map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-2">
                    <div className="w-full rounded-t-xl bg-indigo-400" style={{ height: `${value / 2}px` }} />
                    <span className="text-[10px] text-slate-500">D{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface-panel rounded-3xl p-6">
              <h2 className="text-xl font-semibold text-white">Category split</h2>
              <div className="mt-6 space-y-4">
                {budgetCategories.map((category) => (
                  <div key={category.label}>
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-300">{category.label}</span>
                      <span className="text-white">{formatCurrency(category.value)}</span>
                    </div>
                    <ProgressBar value={(category.value / trip.budget) * 100} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
