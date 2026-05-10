"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import {
  apiFetch,
  apiList,
  formatDateRange,
  formatMoney,
  type InvoiceDto,
  type TripDto,
} from "@/lib/client-api";
import { motion } from "framer-motion";

export default function GlobalBillingPage() {
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [invoice, setInvoice] = useState<InvoiceDto | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceLoading, setIsInvoiceLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTrips = useCallback(async () => {
    setError("");
    try {
      const result = await apiList<TripDto>("/api/trips?limit=20&sortBy=newest");
      setTrips(result.data);
      if (result.data.length > 0 && !selectedTripId) {
        setSelectedTripId(result.data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trips");
    } finally {
      setIsLoading(false);
    }
  }, [selectedTripId]);

  const loadInvoice = useCallback(async (tripId: string) => {
    setIsInvoiceLoading(true);
    try {
      const data = await apiFetch<InvoiceDto>(`/api/trips/${tripId}/invoice`);
      setInvoice(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load billing details");
    } finally {
      setIsInvoiceLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted) {
        await loadTrips();
      }
    };
    void init();
    return () => { isMounted = false; };
  }, [loadTrips]);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      if (isMounted && selectedTripId) {
        await loadInvoice(selectedTripId);
      }
    };
    void init();
    return () => { isMounted = false; };
  }, [selectedTripId, loadInvoice]);

  async function markAsPaid() {
    if (!invoice || !selectedTripId || invoice.status === "paid") return;
    setIsProcessing(true);
    try {
      await apiFetch(`/api/trips/${selectedTripId}/invoice`, {
        method: "PATCH",
        body: JSON.stringify({ action: "pay" }),
      });
      await loadInvoice(selectedTripId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to process payment");
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell active="Billing">
        <div className="mx-auto max-w-6xl animate-pulse space-y-6">
          <div className="h-12 w-48 rounded-xl bg-sky-50" />
          <div className="h-64 rounded-2xl bg-sky-50" />
          <div className="h-96 rounded-2xl bg-sky-50" />
        </div>
      </AppShell>
    );
  }

  if (trips.length === 0) {
    return (
      <AppShell active="Billing">
        <EmptyState
          title="No trips found"
          body="Create a trip first to generate billing and budget insights."
          action={<Link className="font-bold text-sky-600" href="/trips/new">Plan a trip</Link>}
        />
      </AppShell>
    );
  }

  const filteredActivities = invoice?.activities.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.type.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const budget = invoice?.budget;
  const totalAllocated = budget?.totalAllocated || 0;
  const totalSpent = invoice?.grandTotal ?? 0;
  const hasBudget = totalAllocated > 0;
  const budgetUtilization = hasBudget ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const isOverBudget = hasBudget ? totalSpent > totalAllocated : totalSpent > 0;

  return (
    <AppShell active="Billing">
      <div className="mx-auto max-w-6xl space-y-8 pb-20">
        {/* Header Section */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-950">Billing & Invoices</h1>
            <p className="text-sm text-slate-500 mt-1">Manage expenses and generated invoices for your travels.</p>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="relative">
                <select 
                  value={selectedTripId ?? ""} 
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="h-11 rounded-xl border border-sky-100 bg-white pl-4 pr-10 text-sm font-bold text-slate-700 shadow-sm focus:border-[#ff5a3d] focus:outline-none focus:ring-1 focus:ring-[#ff5a3d] appearance-none min-w-[200px]"
                >
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.name}</option>
                  ))}
                </select>
                <Icon name="chevron-down" className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
             </div>
             <button 
                onClick={() => selectedTripId && loadInvoice(selectedTripId)}
                className="flex h-11 items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-sky-50 shadow-sm"
              >
                Refresh
              </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-2">
            <Icon name="alert" className="h-4 w-4" />
            {error}
          </div>
        )}

        {isInvoiceLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="h-64 rounded-2xl bg-sky-50" />
            <div className="h-96 rounded-2xl bg-sky-50" />
          </div>
        ) : !invoice ? (
          <div className="p-12 text-center text-slate-400">Select a trip to view its invoice.</div>
        ) : (
          <div className="space-y-8">
            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1 max-w-md">
                <Icon name="search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search invoice items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-10 w-full rounded-xl border border-sky-100 bg-white pl-10 pr-4 text-sm focus:border-[#ff5a3d] focus:outline-none focus:ring-1 focus:ring-[#ff5a3d]"
                />
              </div>
              <button className="flex h-10 items-center gap-2 rounded-xl border border-sky-100 bg-white px-4 text-sm font-bold text-slate-600 transition hover:bg-sky-50">
                <Icon name="filter" className="h-4 w-4" /> Filter
              </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
              {/* Main Invoice Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-sky-900/5 relative"
              >
                {/* Decorative header line */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-[#ff5a3d]" />
                
                <div className="grid gap-8 p-8 md:grid-cols-[1fr_auto]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                       <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-100">
                          <Icon name="trips" className="h-7 w-7" />
                       </div>
                       <div>
                         <h2 className="text-2xl font-black text-slate-950">{invoice.trip.name}</h2>
                         <p className="text-sm font-bold text-slate-500 mt-1">
                           {formatDateRange(invoice.trip.startDate, invoice.trip.endDate)}
                         </p>
                       </div>
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Traveler Details</h3>
                      <div className="flex flex-wrap gap-2">
                        {invoice.trip.travelers.length > 0 ? (
                          invoice.trip.travelers.map((t, i) => (
                            <span key={i} className="inline-flex items-center rounded-full bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 ring-1 ring-inset ring-slate-200 shadow-sm">{t}</span>
                          ))
                        ) : (
                          <span className="text-sm italic text-slate-400">No travelers added</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 text-right md:text-right min-w-[220px] rounded-2xl bg-slate-50 p-6 border border-slate-100 shadow-inner">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Number</span>
                      <span className="text-lg font-black text-slate-900">{invoice.invoiceNumber}</span>
                    </div>
                    
                    <div className="flex flex-col gap-1 mt-5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</span>
                      <span className="text-sm font-bold text-slate-700">
                        {new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date(invoice.generatedDate))}
                      </span>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-slate-200">
                       <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-100 text-amber-700 ring-1 ring-amber-200'}`}>
                        {invoice.status}
                       </span>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border-t border-slate-200">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-left text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <th className="px-8 py-4">Item Details</th>
                        <th className="px-4 py-4 text-center">Qty</th>
                        <th className="px-4 py-4 text-right">Unit Price</th>
                        <th className="px-8 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredActivities.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-8 py-16 text-center text-sm text-slate-400 italic">
                            No items found in this invoice
                          </td>
                        </tr>
                      ) : (
                        filteredActivities.map((activity, index) => (
                          <tr key={activity.id} className="group transition-colors hover:bg-slate-50/50">
                            <td className="px-8 py-5">
                              <div className="flex items-start gap-4">
                                <span className="flex mt-0.5 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-100 text-[10px] font-bold text-sky-700">
                                  {index + 1}
                                </span>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-900">{activity.name}</p>
                                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                      {activity.type}
                                    </span>
                                  </div>
                                  {activity.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-sm">{activity.description}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-5 text-center text-sm font-bold text-slate-600">1</td>
                            <td className="px-4 py-5 text-right text-sm font-bold text-slate-600">
                              {formatMoney(activity.cost)}
                            </td>
                            <td className="px-8 py-5 text-right text-sm font-black text-slate-950">
                              {formatMoney(activity.cost)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Totals Section */}
                <div className="bg-slate-50 px-8 py-8 border-t border-slate-200">
                  <div className="ml-auto w-full max-w-[320px] space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-500">Subtotal</span>
                      <span className="font-bold text-slate-900">{formatMoney(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-500">Tax ({invoice.taxRate}%)</span>
                      <span className="font-bold text-slate-900">{formatMoney(invoice.taxAmount)}</span>
                    </div>
                    {invoice.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="font-bold text-slate-500">Discount</span>
                        <span className="font-bold text-emerald-600">-{formatMoney(invoice.discount)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-dashed border-slate-300 flex justify-between items-center">
                      <span className="text-sm font-black text-slate-950 uppercase tracking-widest">Total Due</span>
                      <span className="text-3xl font-black text-[#ff5a3d]">{formatMoney(invoice.grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Sidebar: Budget Insights */}
              <aside className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-sky-900/5 relative overflow-hidden"
                >
                  <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-sky-50 opacity-50 blur-2xl" />
                  
                  <div className="relative">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-950">Budget Status</h3>
                    
                    <div className="mt-8 flex justify-center">
                      <div className="relative h-44 w-44">
                         {/* Circle math: r=18, circumference=113.097 */}
                         <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90 drop-shadow-sm">
                            <circle r="18" cx="20" cy="20" fill="transparent" stroke="#f8fafc" strokeWidth="4" />
                            <circle 
                             r="18" cx="20" cy="20" 
                             fill="transparent" 
                             stroke={!hasBudget ? "#cbd5e1" : isOverBudget ? "#ef4444" : "#0ea5e9"} 
                             strokeWidth="4" 
                             strokeDasharray={`${hasBudget ? Math.min(budgetUtilization, 100) * 1.13097 : 0} 113.1`} 
                             strokeLinecap="round"
                             className="transition-all duration-1000 ease-out"
                            />
                         </svg>
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className={`font-black ${!hasBudget ? 'text-slate-400 text-lg' : isOverBudget ? 'text-rose-600 text-3xl' : 'text-slate-950 text-3xl'}`}>
                              {hasBudget ? `${budgetUtilization}%` : "No Budget"}
                            </span>
                            {hasBudget && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">used</span>}
                         </div>
                      </div>
                    </div>

                    <div className="mt-10 space-y-3">
                       <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Budget</span>
                          <span className="text-sm font-black text-slate-900">{hasBudget ? formatMoney(totalAllocated) : "Not Set"}</span>
                       </div>
                       <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Spent</span>
                          <span className="text-sm font-black text-slate-900">{formatMoney(totalSpent)}</span>
                       </div>
                       <div className={`flex items-center justify-between rounded-2xl p-4 border ${!hasBudget ? 'border-slate-200 bg-slate-50' : isOverBudget ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${!hasBudget ? 'text-slate-500' : isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>Remaining</span>
                          <span className={`text-sm font-black ${!hasBudget ? 'text-slate-500' : isOverBudget ? 'text-rose-700' : 'text-emerald-700'}`}>
                           {hasBudget ? formatMoney(totalAllocated - totalSpent) : "N/A"}
                          </span>
                       </div>
                    </div>

                    <Link 
                     href={`/trips/${selectedTripId}/budget`}
                     className="mt-6 flex h-12 w-full items-center justify-center rounded-xl border-2 border-slate-100 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 shadow-sm"
                    >
                       View Full Budget
                    </Link>
                  </div>
                </motion.div>

                <div className="flex flex-col gap-3">
                  <button className="h-14 w-full rounded-2xl border-2 border-slate-200 bg-white px-4 text-[11px] font-black uppercase tracking-widest text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 shadow-sm flex justify-center items-center gap-2">
                    <Icon name="share" className="h-4 w-4" /> Download PDF
                  </button>
                  <button 
                    onClick={markAsPaid}
                    disabled={isProcessing || invoice.status === "paid"}
                    className={`h-14 w-full rounded-2xl px-4 text-[11px] font-black uppercase tracking-widest text-white shadow-lg transition active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2 ${
                      invoice.status === "paid" ? "bg-emerald-500 shadow-emerald-200/50" : "bg-[#ff5a3d] shadow-orange-200 hover:bg-[#e04a30]"
                    }`}
                  >
                    {isProcessing ? "Processing..." : invoice.status === "paid" ? "PAID" : "Mark as Paid"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
