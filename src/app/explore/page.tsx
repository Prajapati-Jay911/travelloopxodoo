import Image from "next/image";
import { AppShell } from "@/components/app-shell";
import {
  ButtonLink,
  DestinationCard,
  Icon,
  PageHeader,
  SearchToolbar,
} from "@/components/ui";
import { destinations } from "@/lib/traveloop-data";

const categories = ["Sightseeing", "Food", "Adventure", "Culture", "Shopping"];

export default function ExplorePage() {
  return (
    <AppShell active="Explore">
      <div className="mx-auto max-w-7xl space-y-8 pb-24 lg:pb-0">
        <PageHeader
          eyebrow="Destination intelligence"
          title="Discover cities and activities with planning context."
          description="Search by destination, compare cost indexes, and quick-start trip drafts from curated city data."
          action={
            <ButtonLink href="/trips/new">
              <Icon name="plus" className="h-4 w-4" />
              Quick start
            </ButtonLink>
          }
        />
        <SearchToolbar placeholder="Search Tokyo, Lisbon, food walks, museums..." />
        <div className="hide-scrollbar flex gap-3 overflow-x-auto">
          {categories.map((category, index) => (
            <button
              key={category}
              type="button"
              aria-label={`Filter ${category}`}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                index === 0
                  ? "border-indigo-400 bg-indigo-500 text-white"
                  : "border-slate-700 bg-slate-950/70 text-slate-300"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">
            Featured destinations
          </h2>
          <div className="hide-scrollbar flex gap-5 overflow-x-auto pb-3">
            {destinations.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </section>
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {destinations.slice(0, 6).map((destination) => (
            <article
              key={destination.id}
              className="lift-card rounded-2xl border border-slate-700/80 bg-slate-900/80 p-5"
            >
              <div className="relative mb-4 h-40 overflow-hidden rounded-2xl">
                <Image
                  src={destination.image}
                  alt={`${destination.city} activity`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 380px"
                />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                {destination.region}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">
                {destination.tag}
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Build a stop around vetted activity blocks, budget signals, and traveler demand.
              </p>
              <button
                type="button"
                aria-label={`Add ${destination.city} to trip`}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-indigo-300 transition hover:scale-[1.02]"
              >
                Add to trip <Icon name="plus" className="h-4 w-4" />
              </button>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
