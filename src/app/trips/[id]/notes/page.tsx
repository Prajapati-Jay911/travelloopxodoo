import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
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
      <div className="mx-auto max-w-4xl space-y-6 pb-24 lg:pb-0">
        {/* Header */}
        <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
          <Link
            href={`/trips/${trip.id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold text-sky-600 transition hover:text-sky-500"
          >
            ← Back to {trip.name}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black text-slate-950">Trip Notes</h1>
              <p className="mt-1 text-sm text-slate-500">
                {notes.length} notes · {trip.dates}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
            >
              <Icon name="plus" className="h-4 w-4" />
              New Note
            </button>
          </div>
        </div>

        {/* Notes list */}
        <section className="space-y-4">
          {notes.map((note) => (
            <article
              key={note.title}
              className="lift-card rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
                    <Icon name="notes" className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      {note.title}
                    </h2>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 font-semibold text-sky-600">
                        {note.stop}
                      </span>
                      <span>·</span>
                      <span>{note.updated}</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {note.body}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-sky-100 p-2 text-slate-400 transition hover:border-sky-300 hover:text-sky-600"
                >
                  <Icon name="more" className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
