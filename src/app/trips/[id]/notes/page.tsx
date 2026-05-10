"use client";

import { FormEvent, use, useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import { apiFetch, type NoteDto, type TripDto } from "@/lib/client-api";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronDown,
  Calendar,
  MapPin,
  X,
  StickyNote,
  Clock
} from "lucide-react";

export default function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", stopId: "", day: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "day" | "stop">("all");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadNotes = useCallback(async () => {
    const [tripResult, notesResult] = await Promise.all([
      apiFetch<TripDto>(`/api/trips/${id}`),
      apiFetch<NoteDto[]>(`/api/trips/${id}/notes`),
    ]);
    setTrip(tripResult);
    setNotes(notesResult);
  }, [id]);

  useEffect(() => {
    loadNotes()
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load notes"))
      .finally(() => setIsLoading(false));
  }, [loadNotes]);

  const tripDays = useMemo(() => {
    if (!trip) return [];
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const count = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [trip]);

  const sortedAndFilteredNotes = useMemo(() => {
    let result = [...notes];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.content.toLowerCase().includes(q)
      );
    }

    if (filterType === "day") {
      return result.sort((a, b) => (a.day ?? 999) - (b.day ?? 999));
    } else if (filterType === "stop") {
      return result.sort((a, b) => (a.stopId ? 0 : 1) - (b.stopId ? 0 : 1));
    }

    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, searchQuery, filterType]);

  const groupedNotes = useMemo(() => {
    if (filterType === "all") return { "All Notes": sortedAndFilteredNotes };

    const groups: Record<string, NoteDto[]> = {};

    sortedAndFilteredNotes.forEach(note => {
      let key = "General";
      if (filterType === "day") {
        key = note.day ? `Day ${note.day}` : "General Trip Info";
      } else if (filterType === "stop") {
        key = note.stop?.city?.name ? `${note.stop.city.name} Stop` : "Trip-wide Details";
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(note);
    });

    return groups;
  }, [sortedAndFilteredNotes, filterType]);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch<NoteDto>(`/api/trips/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          stopId: form.stopId || undefined,
          day: form.day ? parseInt(form.day) : undefined
        }),
      });
      setForm({ title: "", content: "", stopId: "", day: "" });
      setIsFormOpen(false);
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create note");
    }
  }

  async function deleteNote(noteId: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/notes/${noteId}`, { method: "DELETE" });
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete note");
    }
  }

  if (isLoading) {
    return (
      <AppShell active="My Trips">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
          <div className="h-10 w-full rounded-xl bg-slate-100 animate-pulse" />
          <div className="h-64 w-full rounded-2xl bg-slate-50 animate-pulse" />
        </div>
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell active="My Trips">
        <EmptyState 
          title="Notes unavailable" 
          body={error || "Notes could not be loaded."} 
          action={<Link className="font-bold text-sky-600" href="/trips">Back to trips</Link>} 
        />
      </AppShell>
    );
  }

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Link href={`/trips/${trip.id}`} className="text-xs font-bold text-sky-500 uppercase tracking-widest hover:text-sky-600 flex items-center gap-1 mb-2">
                ← {trip.name}
              </Link>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Itinerary Notes</h1>
            </div>
            <button 
              onClick={() => setIsFormOpen(!isFormOpen)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#ff5a3d] text-white font-bold hover:bg-[#e84a2d] transition-all active:scale-95 shadow-lg shadow-orange-100"
            >
              <Plus className="h-5 w-5" /> New Entry
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Search notes, stops, or days..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl border border-sky-100 bg-white shadow-sm focus:ring-4 focus:ring-sky-500/5 focus:border-sky-300 outline-none transition-all font-medium"
              />
            </div>
            <div className="flex items-center gap-2 p-1.5 bg-sky-50/50 rounded-2xl border border-sky-100">
              {["all", "day", "stop"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    filterType === type 
                      ? "bg-white text-sky-600 shadow-sm border border-sky-100" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {type === "all" ? "All" : type === "day" ? "Day" : "Stop"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Note Form */}
        {isFormOpen && (
          <div className="rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-900/10 border-t-8 border-t-cyan-500">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-sky-50">
              <div>
                <h2 className="text-xl font-black text-slate-900">Add Itinerary Detail</h2>
                <p className="text-sm text-slate-400 font-medium">Link notes to specific days or stops in your trip</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="h-10 w-10 grid place-items-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={createNote} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note Title</label>
                  <input 
                    required
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Booking Confirmation"
                    className="w-full h-12 px-4 rounded-xl border border-sky-100 bg-slate-50 focus:bg-white focus:border-sky-300 outline-none transition-all font-bold text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Specific Day</label>
                    <select 
                      value={form.day}
                      onChange={(e) => setForm(f => ({ ...f, day: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-sky-100 bg-slate-50 focus:bg-white focus:border-sky-300 outline-none transition-all font-bold text-slate-600"
                    >
                      <option value="">Full Trip</option>
                      {tripDays.map(d => (
                        <option key={d} value={d}>Day {d}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Related Stop</label>
                    <select 
                      value={form.stopId}
                      onChange={(e) => setForm(f => ({ ...f, stopId: e.target.value }))}
                      className="w-full h-12 px-4 rounded-xl border border-sky-100 bg-slate-50 focus:bg-white focus:border-sky-300 outline-none transition-all font-bold text-slate-600"
                    >
                      <option value="">Trip Wide</option>
                      {trip.stops?.map(s => (
                        <option key={s.id} value={s.id}>{s.city.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Content</label>
                <textarea 
                  required
                  rows={5}
                  value={form.content}
                  onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Paste details, reservation IDs, or daily plans here..."
                  className="w-full p-5 rounded-xl border border-sky-100 bg-slate-50 focus:bg-white focus:border-sky-300 outline-none transition-all resize-none font-medium leading-relaxed"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-10 py-3 rounded-xl bg-cyan-600 text-white font-black text-xs uppercase tracking-[0.2em] hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100"
                >
                  Save to Itinerary
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3">
            <X className="h-5 w-5" /> {error}
          </div>
        )}

        {/* Grouped Notes List */}
        <div className="space-y-12">
          {Object.keys(groupedNotes).length === 0 ? (
            <EmptyState 
              title="Itinerary is quiet" 
              body={searchQuery ? "No notes match your search filters." : "Start adding notes to organize your daily plans and trip logistics."} 
            />
          ) : (
            Object.entries(groupedNotes).map(([groupName, groupNotes]) => (
              <div key={groupName} className="space-y-5">
                <div className="flex items-center gap-5">
                  <h2 className="text-sm font-black text-sky-500 uppercase tracking-[0.3em] pl-1">{groupName}</h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-sky-100 to-transparent" />
                </div>
                
                <div className="grid gap-5">
                  {groupNotes.map((note) => (
                    <article 
                      key={note.id} 
                      className="group relative overflow-hidden rounded-3xl border border-sky-100 bg-white p-7 transition-all hover:border-sky-300 hover:shadow-xl hover:shadow-sky-900/5"
                    >
                      <div className="flex items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                          <div className="flex items-center gap-4">
                            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-50 text-sky-500 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                              <StickyNote className="h-6 w-6" />
                            </div>
                            <div>
                              <h3 className="text-xl font-black text-slate-900 leading-tight">
                                {note.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                {note.day && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-orange-50 text-[10px] font-black text-orange-600 uppercase tracking-widest border border-orange-100">
                                    <Clock className="h-3 w-3" /> Day {note.day}
                                  </span>
                                )}
                                {note.stop && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-sky-50 text-[10px] font-black text-sky-600 uppercase tracking-widest border border-sky-100">
                                    <MapPin className="h-3 w-3" /> {note.stop.city?.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap pl-1">
                            {note.content}
                          </p>

                          <div className="flex items-center gap-4 pt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" /> 
                              {new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(note.updatedAt))}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          <button className="h-10 w-10 grid place-items-center rounded-xl bg-sky-50 text-sky-400 hover:text-sky-600 hover:bg-sky-100 transition-colors shadow-sm">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteNote(note.id)}
                            className="h-10 w-10 grid place-items-center rounded-xl bg-rose-50 text-rose-400 hover:text-rose-600 hover:bg-rose-100 transition-colors shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
