"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Icon, ProgressBar } from "@/components/ui";
import { apiFetch, type ChecklistItemDto, type TripDto } from "@/lib/client-api";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Globe, Share2, Check, Lock, ArrowLeft } from "lucide-react";

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

export default function SharedChecklistPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItemDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSharedData = useCallback(async () => {
    try {
      const tripData = await apiFetch<TripDto>(`/api/share/${token}`);
      setTrip(tripData);
      // For shared trip, checklist is included in tripData.checklist if updated service
      // But let's check if it's there
      if (tripData.checklist) {
        setChecklist(tripData.checklist);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Shared checklist not found");
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSharedData();
  }, [loadSharedData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-bold text-slate-500">Loading shared checklist...</p>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-sky-100 shadow-xl shadow-sky-900/5 text-center">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-6">
            <Lock className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h1>
          <p className="text-slate-500 mb-8">{error || "This checklist is private or the link has expired."}</p>
          <Link href="/" className="inline-flex h-12 items-center justify-center px-8 rounded-xl bg-cyan-500 text-sm font-bold text-white transition-transform hover:scale-105">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Group items by category
  const groups: Record<string, ChecklistItemDto[]> = {};
  checklist.forEach(item => {
    if (!groups[item.category]) groups[item.category] = [];
    groups[item.category].push(item);
  });

  const activeCategories = Object.keys(groups).sort((a, b) => {
    const aIdx = defaultCategories.indexOf(a);
    const bIdx = defaultCategories.indexOf(b);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return a.localeCompare(b);
  });

  const totalPacked = checklist.filter((item) => item.isPacked).length;
  const totalItems = checklist.length;
  const progressPercent = totalItems ? Math.round((totalPacked / totalItems) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-sky-100 sticky top-0 z-30">
        <div className="mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-sky-100 ring-offset-2 transition-all duration-300 group-hover:ring-sky-300 group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Traveloop Logo"
                fill
                className="object-cover"
              />
            </div>
            <span className="text-cyan-600 font-black text-xl group-hover:text-cyan-500 transition-colors">Traveloop</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
            <Share2 className="h-3 w-3" /> Shared View
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 mt-8 space-y-6">
        <div className="overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="border-b border-sky-100 bg-gradient-to-r from-sky-50 to-white p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-black text-slate-950 tracking-tight">Packing Checklist</h1>
                <p className="mt-1 text-slate-500 font-medium">Shared for trip: <span className="text-cyan-600 font-bold">{trip.name}</span></p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-white px-5 py-3 text-center shadow-sm">
                <p className="text-3xl font-black text-cyan-600 leading-none">{progressPercent}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">packed</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-slate-600">Progress: {totalPacked}/{totalItems} items packed</span>
                <span className="font-black text-cyan-600">{progressPercent}%</span>
              </div>
              <ProgressBar value={progressPercent} />
            </div>
          </div>

          <div className="divide-y divide-sky-50 p-6 sm:p-8">
            {activeCategories.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-slate-400 font-medium italic">No items have been added to this checklist yet.</p>
              </div>
            ) : activeCategories.map((group) => (
              <div key={group} className="py-8 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-50 text-sky-600">
                      <Check className="h-5 w-5" />
                    </span>
                    <h2 className="text-xl font-black text-slate-950 tracking-tight uppercase">{group}</h2>
                  </div>
                  <span className="rounded-full bg-sky-50 px-4 py-1.5 text-xs font-black text-sky-600 border border-sky-100">
                    {groups[group].filter(i => i.isPacked).length}/{groups[group].length}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {groups[group].map((item) => (
                    <div 
                      key={item.id} 
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-sm font-bold transition-all ${
                        item.isPacked 
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700 opacity-80" 
                          : "border-sky-100 bg-white text-slate-700 shadow-sm"
                      }`}
                    >
                      <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 ${
                        item.isPacked ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-200"
                      }`}>
                        {item.isPacked && <Check className="h-4 w-4 stroke-[3px]" />}
                      </div>
                      <span className={item.isPacked ? "line-through" : ""}>{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-cyan-50 rounded-3xl p-8 border border-cyan-100 text-center space-y-4">
          <h3 className="text-lg font-black text-cyan-900">Want to plan your own trip?</h3>
          <p className="text-cyan-700 text-sm font-medium">Join Traveloop to create your own smart itineraries, budgets, and checklists.</p>
          <Link href="/signup" className="inline-flex h-12 items-center justify-center px-10 rounded-xl bg-cyan-600 text-sm font-bold text-white shadow-lg shadow-cyan-200 transition-transform hover:scale-105">
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
}
