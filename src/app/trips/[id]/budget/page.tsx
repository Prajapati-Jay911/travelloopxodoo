"use client";

import { FormEvent, use, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon, ProgressBar } from "@/components/ui";
import { apiFetch, formatMoney, type BudgetDto, type TripDto } from "@/lib/client-api";

const categories = ["transport", "stay", "meals", "activities", "misc"] as const;

export default function BudgetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [budget, setBudget] = useState<BudgetDto | null>(null);
  const [form, setForm] = useState<Record<(typeof categories)[number], string>>({ transport: "0", stay: "0", meals: "0", activities: "0", misc: "0" });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      Promise.all([apiFetch<TripDto>(`/api/trips/${id}`), apiFetch<BudgetDto>(`/api/trips/${id}/budget`)])
        .then(([tripResult, budgetResult]) => {
          setTrip(tripResult);
          setBudget(budgetResult);
          setForm({
            transport: String(budgetResult.transport),
            stay: String(budgetResult.stay),
            meals: String(budgetResult.meals),
            activities: String(budgetResult.activities),
            misc: String(budgetResult.misc),
          });
        })
        .catch((err) => setError(err instanceof Error ? err.message : "Unable to load budget"))
        .finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [id]);

  async function saveBudget(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");

    const values = Object.fromEntries(categories.map((category) => [category, Number(form[category])])) as Record<(typeof categories)[number], number>;
    const totalAllocated = Object.values(values).reduce((sum, value) => sum + value, 0);

    try {
      const nextBudget = await apiFetch<BudgetDto>(`/api/trips/${id}/budget`, {
        method: "PUT",
        body: JSON.stringify({ ...values, totalAllocated }),
      });
      setBudget(nextBudget);
      setNotice("Budget saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save budget");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <AppShell active="My Trips"><div className="mx-auto h-96 max-w-5xl animate-pulse rounded-2xl bg-sky-50" /></AppShell>;
  }

  if (!trip || !budget) {
    return <AppShell active="My Trips"><EmptyState title="Budget unavailable" body={error || "Budget could not be loaded."} action={<Link className="font-bold text-sky-600" href="/trips">Back to trips</Link>} /></AppShell>;
  }

  const totalSpent = budget.totalSpent ?? 0;
  const totalAllocated = budget.totalAllocated || categories.reduce((sum, category) => sum + Number(form[category] || 0), 0) || 1;
  const budgetProgress = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
            <Link href={`/trips/${trip.id}`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-500">← Back to {trip.name}</Link>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black text-slate-950">Budget Breakdown</h1>
                <p className="mt-1 text-sm text-slate-500">Allocated vs itinerary activity spend</p>
              </div>
              <div className="hidden text-right md:block">
                <p className="text-3xl font-black text-slate-950">{formatMoney(totalSpent)}</p>
                <p className="mt-1 text-sm text-slate-500">of {formatMoney(totalAllocated)} budget</p>
              </div>
            </div>
            <div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-600">Budget utilization</span><span className="font-bold text-sky-600">{budgetProgress}%</span></div><ProgressBar value={budgetProgress} /></div>
          </div>
        </div>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>}

        <form onSubmit={saveBudget} className="grid gap-4 rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <label key={category} className="block text-sm font-bold capitalize text-slate-700">
              {category}
              <input type="number" min="0" value={form[category]} onChange={(event) => setForm((current) => ({ ...current, [category]: event.target.value }))} placeholder="0" className="mt-2 h-11 w-full rounded-xl border border-sky-100 px-3 text-slate-900" />
            </label>
          ))}
          <button disabled={isSaving} type="submit" className="h-11 self-end rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 disabled:opacity-60">{isSaving ? "Saving..." : "Save budget"}</button>
        </form>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100"><p className="text-sm text-slate-500">Total Spent</p><p className="mt-1 text-3xl font-black text-slate-950">{formatMoney(totalSpent)}</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100"><p className="text-sm text-slate-500">Total Allocated</p><p className="mt-1 text-3xl font-black text-slate-950">{formatMoney(totalAllocated)}</p></div>
          <div className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm shadow-sky-100"><p className="text-sm text-slate-500">Remaining</p><p className="mt-1 text-3xl font-black text-emerald-600">{formatMoney(totalAllocated - totalSpent)}</p></div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const value = Number(form[category] || 0);
            const pct = Math.round((value / totalAllocated) * 100);
            return <article key={category} className="lift-card rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600"><Icon name="budget" className="h-5 w-5" /></span><h3 className="font-black capitalize text-slate-950">{category}</h3></div><p className="mt-4 text-2xl font-black text-slate-950">{formatMoney(value)}</p><p className="mt-1 text-xs font-bold text-sky-600">{pct}% allocation</p></article>;
          })}
        </section>
      </div>
    </AppShell>
  );
}
