"use client";

import { FormEvent, use, useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon, ProgressBar } from "@/components/ui";
import { apiFetch, type ChecklistItemDto, type TripDto } from "@/lib/client-api";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Globe, Copy, Check, X, Link as LinkIcon } from "lucide-react";

const defaultCategories = [
  "DOCUMENTS",
  "CLOTHING",
  "ELECTRONICS",
  "TOILETRIES",
  "MEDICATIONS",
  "EQUIPMENT",
  "SHOES",
  "FOOD",
  "MISC",
];

export default function ChecklistPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [groups, setGroups] = useState<Record<string, ChecklistItemDto[]> | null>(null);
  const [name, setName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("DOCUMENTS");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadChecklist = useCallback(async () => {
    const [tripResult, groupsResult] = await Promise.all([
      apiFetch<TripDto>(`/api/trips/${id}`),
      apiFetch<Record<string, ChecklistItemDto[]>>(`/api/trips/${id}/checklist`),
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
    const finalCategory = showCustomInput ? customCategory.trim() : selectedCategory;
    if (!finalCategory) {
      setError("Category name is required");
      return;
    }

    try {
      await apiFetch<ChecklistItemDto>(`/api/trips/${id}/checklist`, {
        method: "POST",
        body: JSON.stringify({ name, category: finalCategory }),
      });
      setName("");
      setCustomCategory("");
      setShowCustomInput(false);
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
      setGroups(await apiFetch<Record<string, ChecklistItemDto[]>>(`/api/trips/${id}/checklist`, { method: "DELETE" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reset checklist");
    }
  }

  async function toggleShare() {
    setError("");
    try {
      if (trip?.isPublic) {
        await apiFetch(`/api/trips/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ isPublic: false }),
        });
      } else {
        await apiFetch(`/api/trips/${id}/share`, { method: "POST" });
      }
      await loadChecklist();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update sharing status");
    }
  }

  const copyToClipboard = async () => {
    if (!trip?.shareToken) return;
    const url = `${window.location.origin}/share/checklist/${trip.shareToken}`;
    await navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return <AppShell active="My Trips"><div className="mx-auto h-96 max-w-4xl animate-pulse rounded-2xl bg-sky-50" /></AppShell>;
  }

  if (!trip || !groups) {
    return <AppShell active="My Trips"><EmptyState title="Checklist unavailable" body={error || "Checklist could not be loaded."} action={<span className="font-bold text-sky-600">Try again later</span>} /></AppShell>;
  }

  const activeCategories = groups ? Object.keys(groups).sort((a, b) => {
    // Keep defaults first
    const aIdx = defaultCategories.indexOf(a);
    const bIdx = defaultCategories.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  }) : [];

  const items = groups ? Object.values(groups).flat() : [];
  const totalPacked = items.filter((item) => item.isPacked).length;
  const totalItems = items.length;
  const progressPercent = totalItems ? Math.round((totalPacked / totalItems) * 100) : 0;

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-950">Packing Checklist</h1>
                <p className="mt-1 text-sm text-slate-500 font-medium">Trip: <span className="text-sky-600 font-bold">{trip.name}</span></p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsShareModalOpen(true)}
                  className={`flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-bold transition-all ${
                    trip.isPublic 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100" 
                      : "bg-white text-slate-600 border border-sky-100 hover:bg-sky-50"
                  }`}
                >
                  <Share2 className="h-4 w-4" /> 
                  {trip.isPublic ? "Shared" : "Share"}
                </button>
                <div className="hidden rounded-xl border border-sky-100 bg-white px-4 py-2 text-center md:block">
                  <p className="text-2xl font-black text-sky-600">{progressPercent}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">packed</p>
                </div>
              </div>
            </div>
            <div className="mt-4"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-slate-600">Progress: {totalPacked}/{totalItems} items packed</span><span className="font-bold text-sky-600">{progressPercent}%</span></div><ProgressBar value={progressPercent} /></div>
          </div>
          <div className="divide-y divide-sky-50 p-5">
            {activeCategories.map((group) => {
              const groupItems = groups?.[group] ?? [];
              const packedInGroup = groupItems.filter((item) => item.isPacked).length;
              if (groupItems.length === 0 && !defaultCategories.includes(group)) return null;
              return (
                <div key={group} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600"><Icon name="check" className="h-4 w-4" /></span><h2 className="text-lg font-black text-slate-950 tracking-tight uppercase">{group}</h2></div><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">{packedInGroup}/{groupItems.length}</span></div>
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

        <div className="space-y-3">
          <form onSubmit={addItem} className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100 sm:grid-cols-[1fr_auto_auto]">
            <input aria-label="Checklist item" value={name} onChange={(event) => setName(event.target.value)} required placeholder="Add item (e.g. Passport, Jacket)" className="h-12 rounded-xl border border-sky-100 px-4 focus:border-sky-300 focus:outline-none" />
            <select 
              aria-label="Checklist category" 
              value={showCustomInput ? "OTHER" : selectedCategory} 
              onChange={(event) => {
                if (event.target.value === "OTHER") {
                  setShowCustomInput(true);
                } else {
                  setShowCustomInput(false);
                  setSelectedCategory(event.target.value);
                }
              }} 
              className="h-12 rounded-xl border border-sky-100 px-4 font-bold text-slate-700 focus:border-sky-300 focus:outline-none"
            >
              {defaultCategories.map((item) => <option key={item} value={item}>{item}</option>)}
              <option value="OTHER">OTHER...</option>
            </select>
            <button type="submit" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition-transform active:scale-95"><Icon name="plus" className="h-4 w-4" />Add</button>
          </form>

          {showCustomInput && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-cyan-100 bg-cyan-50/30 p-4 flex gap-3 items-center"
            >
              <div className="flex-1">
                <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest mb-1.5 ml-1">New Category Name</p>
                <input 
                  autoFocus
                  placeholder="Enter category name..." 
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value.toUpperCase())}
                  className="w-full h-10 rounded-lg border border-cyan-100 px-3 text-sm font-bold text-slate-700 focus:border-cyan-300 focus:outline-none"
                />
              </div>
              <button 
                type="button" 
                onClick={() => setShowCustomInput(false)}
                className="mt-5 h-10 px-4 rounded-lg bg-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-300"
              >
                Cancel
              </button>
            </motion.div>
          )}
        </div>

        <button type="button" onClick={() => void resetAll()} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">Reset all packed states</button>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsShareModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl shadow-slate-900/20 border border-sky-100"
            >
              <button 
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="mb-8">
                <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-6">
                  <Share2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Share Checklist</h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Generate a public link so anyone can view your packing progress. No account required for viewing.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-sky-100">
                  <div className="flex items-center gap-3">
                    <div className={`grid place-items-center h-5 w-5 rounded-full ${trip.isPublic ? "bg-emerald-500" : "bg-slate-300"}`}>
                      {trip.isPublic ? <Check className="h-3 w-3 text-white" /> : <Lock className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-700">Public Sharing</span>
                  </div>
                  <button 
                    onClick={toggleShare}
                    className={`h-8 px-4 rounded-lg text-xs font-black transition-all ${
                      trip.isPublic 
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100" 
                        : "bg-cyan-500 text-white shadow-md shadow-cyan-200"
                    }`}
                  >
                    {trip.isPublic ? "Revoke Access" : "Enable"}
                  </button>
                </div>

                {trip.isPublic && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3"
                  >
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shareable Link</label>
                    <div className="flex gap-2">
                      <div className="flex-1 h-12 bg-sky-50 rounded-xl border border-sky-100 px-4 flex items-center overflow-hidden">
                        <span className="text-xs font-bold text-sky-700 truncate">
                          {window.location.origin}/share/checklist/{trip.shareToken}
                        </span>
                      </div>
                      <button 
                        onClick={copyToClipboard}
                        className={`grid place-items-center w-12 h-12 rounded-xl transition-all ${
                          isCopied ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        }`}
                      >
                        {isCopied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1 mt-2 px-1">
                      <Globe className="h-3 w-3" /> Link is live and accessible by anyone.
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="mt-10">
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-full h-12 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 hover:bg-sky-50"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}
