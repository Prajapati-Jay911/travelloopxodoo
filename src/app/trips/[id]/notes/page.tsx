import { AppShell } from "@/components/app-shell";
import { Icon, PageHeader } from "@/components/ui";
import { getTrip, notes } from "@/lib/traveloop-data";

export default async function NotesPage({
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
          eyebrow="Trip journal"
          title="Capture decisions, memories, and stop-specific reminders."
          description="Two-panel notes keep context close to the itinerary while supporting quick edits and auto-save states."
        />
        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="surface-panel rounded-3xl p-4">
            <div className="mb-4 flex items-center justify-between px-2">
              <h2 className="text-lg font-semibold text-white">{trip.name}</h2>
              <button type="button" aria-label="Add note" className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-500 text-white">
                <Icon name="plus" className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              {notes.map((note, index) => (
                <article key={note.title} className={`rounded-2xl border p-4 ${index === 0 ? "border-indigo-400 bg-indigo-400/10" : "border-slate-800 bg-slate-950/60"}`}>
                  <p className="font-semibold text-white">{note.title}</p>
                  <p className="mt-1 text-sm text-slate-400">{note.updated} / {note.stop}</p>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{note.body}</p>
                </article>
              ))}
            </div>
          </aside>
          <form className="glass-panel rounded-3xl p-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200">
                Saved
              </span>
              <select aria-label="Stop selector" className="h-10 rounded-xl border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200">
                <option>Lisbon</option>
                <option>Barcelona</option>
                <option>Paris</option>
              </select>
            </div>
            <input
              aria-label="Note title"
              value={notes[0].title}
              readOnly
              className="w-full bg-transparent text-3xl font-semibold text-white focus:outline-none"
            />
            <textarea
              aria-label="Note content"
              rows={16}
              value={`${notes[0].body}\n\nDecision log:\n- Keep arrival evening flexible.\n- Confirm restaurant reservation once train time is locked.\n- Add neighborhood walk if weather is clear.`}
              readOnly
              className="mt-6 w-full resize-none rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4 leading-7 text-slate-300"
            />
          </form>
        </section>
      </div>
    </AppShell>
  );
}
