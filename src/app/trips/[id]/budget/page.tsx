import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon, ProgressBar } from "@/components/ui";
import { budgetCategories, formatCurrency, getTrip } from "@/lib/traveloop-data";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTrip(id);
  const totalSpent = budgetCategories.reduce((sum, c) => sum + c.value, 0);
  const budgetProgress = Math.round((trip.spent / trip.budget) * 100);

  const categoryColors: Record<string, { bg: string; text: string; bar: string }> = {
    Transport: { bg: "bg-sky-50", text: "text-sky-600", bar: "from-sky-400 to-sky-500" },
    Stay: { bg: "bg-amber-50", text: "text-amber-600", bar: "from-amber-400 to-amber-500" },
    Meals: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "from-emerald-400 to-emerald-500" },
    Activities: { bg: "bg-violet-50", text: "text-violet-600", bar: "from-violet-400 to-violet-500" },
    Misc: { bg: "bg-rose-50", text: "text-rose-600", bar: "from-rose-400 to-rose-500" },
  };

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        {/* Header */}
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <Link
                  href={`/trips/${trip.id}`}
                  className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-500"
                >
                  ← Back to {trip.name}
                </Link>
                <h1 className="text-2xl font-black text-slate-950">
                  Budget Breakdown
                </h1>
                <p className="mt-1 text-sm text-slate-500">{trip.dates}</p>
              </div>
              <div className="hidden text-right md:block">
                <p className="text-3xl font-black text-slate-950">
                  {formatCurrency(trip.spent)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  of {formatCurrency(trip.budget)} budget
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-600">
                  Budget utilization
                </span>
                <span className="font-bold text-sky-600">{budgetProgress}%</span>
              </div>
              <ProgressBar value={budgetProgress} />
            </div>
          </div>

          {/* Visual bar representation */}
          <div className="p-5">
            <h2 className="mb-4 text-sm font-black text-slate-950">
              Spending by Category
            </h2>
            <div className="flex h-8 w-full overflow-hidden rounded-full">
              {budgetCategories.map((cat) => {
                const pct = (cat.value / totalSpent) * 100;
                const colors = categoryColors[cat.label];
                return (
                  <div
                    key={cat.label}
                    className={`bg-gradient-to-r ${colors?.bar || "from-slate-400 to-slate-500"}`}
                    style={{ width: `${pct}%` }}
                    title={`${cat.label}: ${formatCurrency(cat.value)}`}
                  />
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-4">
              {budgetCategories.map((cat) => {
                const colors = categoryColors[cat.label];
                return (
                  <div key={cat.label} className="flex items-center gap-2 text-xs">
                    <span
                      className={`h-3 w-3 rounded-full bg-gradient-to-r ${colors?.bar || "from-slate-400 to-slate-500"}`}
                    />
                    <span className="font-semibold text-slate-600">
                      {cat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Category cards */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgetCategories.map((category) => {
            const pct = Math.round((category.value / totalSpent) * 100);
            const colors = categoryColors[category.label];

            return (
              <article
                key={category.label}
                className="lift-card rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`grid h-10 w-10 place-items-center rounded-xl ${colors?.bg || "bg-slate-50"} ${colors?.text || "text-slate-600"}`}
                    >
                      <Icon name="budget" className="h-5 w-5" />
                    </span>
                    <h3 className="font-black text-slate-950">
                      {category.label}
                    </h3>
                  </div>
                  <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-600">
                    {pct}%
                  </span>
                </div>
                <p className="mt-4 text-2xl font-black text-slate-950">
                  {formatCurrency(category.value)}
                </p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-sky-100">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colors?.bar || "from-slate-400 to-slate-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </article>
            );
          })}
        </section>

        {/* Summary */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <p className="text-sm text-slate-500">Total Spent</p>
            <p className="mt-1 text-3xl font-black text-slate-950">
              {formatCurrency(totalSpent)}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100">
            <p className="text-sm text-slate-500">Remaining Budget</p>
            <p className="mt-1 text-3xl font-black text-emerald-600">
              {formatCurrency(trip.budget - trip.spent)}
            </p>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
