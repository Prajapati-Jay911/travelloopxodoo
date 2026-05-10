import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import { ButtonLink, Icon, PageHeader } from "@/components/ui";
import { destinations } from "@/lib/traveloop-data";

export default function NewTripPage() {
  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Create trip"
          title="Start with the right structure before the details grow."
          description="Capture the trip identity, visibility, dates, and cover media before moving into itinerary building."
        />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form className="glass-panel rounded-3xl p-6 md:p-8">
            <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-dashed border-slate-600 bg-slate-950">
              <Image
                src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80"
                alt="Trip cover preview"
                fill
                className="object-cover opacity-80"
                sizes="(max-width: 1024px) 100vw, 760px"
              />
              <div className="absolute inset-0 grid place-items-center bg-slate-950/35 text-center">
                <div className="rounded-2xl border border-white/20 bg-slate-950/60 px-5 py-4 backdrop-blur">
                  <p className="font-semibold text-white">Drop cover photo</p>
                  <p className="mt-1 text-sm text-slate-300">16:9 preview with upload state</p>
                </div>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {["Trip name", "Start date", "End date", "Primary destination"].map((field) => (
                <label key={field} className="text-sm font-medium text-slate-200">
                  {field}
                  <input
                    aria-label={field}
                    type={field.includes("date") ? "date" : "text"}
                    className="mt-2 h-12 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 text-slate-100"
                    placeholder={field}
                  />
                </label>
              ))}
              <label className="text-sm font-medium text-slate-200 md:col-span-2">
                Description
                <textarea
                  aria-label="Trip description"
                  rows={5}
                  className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                  placeholder="Trip goals, pace, people, booking notes..."
                />
              </label>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" className="h-5 w-5 accent-indigo-500" />
                Make this trip public after review
              </label>
              <ButtonLink href="/trips/europe-loop/build">
                Save and build <Icon name="arrow" className="h-4 w-4" />
              </ButtonLink>
            </div>
          </form>
          <aside className="surface-panel rounded-3xl p-5">
            <h2 className="text-lg font-semibold text-white">Suggested places</h2>
            <div className="mt-5 space-y-4">
              {destinations.slice(0, 4).map((destination) => (
                <div key={destination.id} className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-3">
                  <div className="relative h-16 w-20 overflow-hidden rounded-xl">
                    <Image src={destination.image} alt={destination.city} fill className="object-cover" sizes="80px" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{destination.city}</p>
                    <p className="text-sm text-slate-400">{destination.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
