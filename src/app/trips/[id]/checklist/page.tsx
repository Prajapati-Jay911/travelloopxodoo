"use client";

import { FormEvent, use, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon, ProgressBar } from "@/components/ui";
import { apiFetch, type ChecklistItemDto, type TripDto } from "@/lib/client-api";

const categories = ["DOCUMENTS", "CLOTHING", "ELECTRONICS", "TOILETRIES", "MISC"] as const;
type ChecklistGroups = Record<(typeof categories)[number], ChecklistItemDto[]>;

export default function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [groups, setGroups] = useState<ChecklistGroups | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("DOCUMENTS");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadChecklist = useCallback(async () => {
    const [tripResult, groupsResult] = await Promise.all([
      apiFetch<TripDto>(`/api/trips/${id}`),
      apiFetch<ChecklistGroups>(`/api/trips/${id}/checklist`),
    ]);
    setTrip(tripResult);
    setGroups(groupsResult);
  }, [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadChecklist().catch((err) => setError(err instanceof Error ? err.message : "Unable to load checklist")).finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadChecklist]);

  async function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch<ChecklistItemDto>(`/api/trips/${id}/checklist`, {
        method: "POST",
        body: JSON.stringify({ name, category }),
      });
      setName("");
      await loadChecklist();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add item");
    }
  }

  async function toggleItem(item: ChecklistItemDto) {
    setError("");

    try {
      await apiFetch<ChecklistItemDto>(`/api/checklist/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPacked: !item.isPacked }),
      });
      await loadChecklist();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update item");
    }
  }

  async function deleteItem(itemId: string) {
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/checklist/${itemId}`, { method: "DELETE" });
      await loadChecklist();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete item");
    }
  }

  async function resetAll() {
    setError("");

    try {
      setGroups(await apiFetch<ChecklistGroups>(`/api/trips/${id}/checklist`, { method: "DELETE" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset checklist");
    }
  }

  if (isLoading) {
    return <AppShell active="My Trips"><div className="mx-auto h-96 max-w-4xl animate-pulse rounded-2xl bg-sky-50" /></AppShell>;
  }

  if (!trip || !groups) {
    return <AppShell active="My Trips"><EmptyState title="Checklist unavailable" body={error || "Checklist could not be loaded."} action={<span className="font-bold text-sky-600">Try again later</span>} /></AppShell>;
  }

  const items = categories.flatMap((group) => groups[group] ?? []);
  const totalPacked = items.filter((item) => item.isPacked).length;
  const totalItems = items.length;
  const progressPercent = totalItems ? Math.round((totalPacked / totalItems) * 100) : 0;

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
            <div className="flex items-center justify-between"><div><h1 className="text-2xl font-black text-slate-950">Packing Checklist</h1><p className="mt-1 text-sm text-slate-500">Trip: {trip.name}</p></div><div className="hidden rounded-xl border border-sky-100 bg-white px-4 py-2 text-center md:block"><p className="text-2xl font-black text-sky-600">{progressPercent}%</p><p className="text-xs text-slate-500">packed</p></div></div>
            <div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-600">Progress: {totalPacked}/{totalItems} items packed</span><span className="font-bold text-sky-600">{progressPercent}%</span></div><ProgressBar value={progressPercent} /></div>
          </div>
          <div className="divide-y divide-sky-50 p-5">
            {categories.map((group) => {
              const groupItems = groups[group] ?? [];
              const packedInGroup = groupItems.filter((item) => item.isPacked).length;
              return (
                <div key={group} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600"><Icon name="check" className="h-4 w-4" /></span><h2 className="text-lg font-black text-slate-950">{group}</h2></div><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">{packedInGroup}/{groupItems.length}</span></div>
                  <div className="mt-4 space-y-2 pl-0 md:pl-12">
                    {groupItems.length === 0 ? <p className="rounded-xl bg-sky-50 p-3 text-sm text-slate-500">No items in this category.</p> : groupItems.map((item) => (
                      <div key={item.id} className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold ${item.isPacked ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-sky-100 bg-white text-slate-700"}`}>
                        <button type="button" onClick={() => void toggleItem(item)} className="flex flex-1 items-center gap-3 text-left"><input type="checkbox" checked={item.isPacked} readOnly className="h-4 w-4 rounded accent-emerald-500" /><span className={item.isPacked ? "line-through opacity-70" : ""}>{item.name}</span></button>
                        <button type="button" onClick={() => void deleteItem(item.id)} className="text-xs font-bold text-rose-600">Delete</button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <form onSubmit={addItem} className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100 sm:grid-cols-[1fr_auto_auto]">
          <input aria-label="Checklist item" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Add item" className="h-12 rounded-xl border border-sky-100 px-4" />
          <select aria-label="Checklist category" value={category} onChange={(event) => setCategory(event.target.value as (typeof categories)[number])} className="h-12 rounded-xl border border-sky-100 px-4 font-semibold text-slate-700">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-black text-white shadow-lg shadow-orange-200"><Icon name="plus" className="h-4 w-4" />Add</button>
        </form>

        <button type="button" onClick={() => void resetAll()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">Reset all packed states</button>
      </div>
    </AppShell>
  );
}
