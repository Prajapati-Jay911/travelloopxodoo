"use client";

import { FormEvent, use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import { apiFetch, type NoteDto, type TripDto } from "@/lib/client-api";

export default function NotesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [notes, setNotes] = useState<NoteDto[]>([]);
  const [form, setForm] = useState({ title: "", content: "" });
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
    const timer = window.setTimeout(() => {
      loadNotes().catch((err) => setError(err instanceof Error ? err.message : "Unable to load notes")).finally(() => setIsLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotes]);

  async function createNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch<NoteDto>(`/api/trips/${id}/notes`, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ title: "", content: "" });
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create note");
    }
  }

  async function deleteNote(noteId: string) {
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/notes/${noteId}`, { method: "DELETE" });
      await loadNotes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete note");
    }
  }

  if (isLoading) {
    return <AppShell active="My Trips"><div className="mx-auto h-80 max-w-4xl animate-pulse rounded-2xl bg-sky-50" /></AppShell>;
  }

  if (!trip) {
    return <AppShell active="My Trips"><EmptyState title="Notes unavailable" body={error || "Notes could not be loaded."} action={<Link className="font-bold text-sky-600" href="/trips">Back to trips</Link>} /></AppShell>;
  }

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
          <Link href={`/trips/${trip.id}`} className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-500">← Back to {trip.name}</Link>
          <div className="flex items-center justify-between"><div><h1 className="text-2xl font-black text-slate-950">Trip Notes</h1><p className="mt-1 text-sm text-slate-500">{notes.length} notes</p></div></div>
        </div>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <form onSubmit={createNote} className="space-y-3 rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
          <input aria-label="Note title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required placeholder="Note title" className="h-12 w-full rounded-xl border border-sky-100 px-4" />
          <textarea aria-label="Note content" value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} required rows={5} placeholder="Write a reminder, journal entry, or planning detail..." className="w-full rounded-xl border border-sky-100 px-4 py-3" />
          <button type="submit" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"><Icon name="plus" className="h-4 w-4" />New Note</button>
        </form>

        <section className="space-y-4">
          {notes.length === 0 ? <EmptyState title="No notes yet" body="Add reminders, journal entries, and trip decisions here." action={<span className="font-bold text-sky-600">Use the form above</span>} /> : notes.map((note) => (
            <article key={note.id} className="lift-card rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
              <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-4"><span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600"><Icon name="notes" className="h-5 w-5" /></span><div><h2 className="text-lg font-black text-slate-950">{note.title}</h2><div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-600">{note.stop?.city?.name ?? "Trip"}</span><span>·</span><span>{new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(note.updatedAt))}</span></div><p className="mt-3 text-sm leading-6 text-slate-600">{note.content}</p></div></div><button type="button" onClick={() => void deleteNote(note.id)} className="shrink-0 rounded-lg border border-rose-100 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50">Delete</button></div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
