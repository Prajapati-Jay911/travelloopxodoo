import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Icon, ProgressBar } from "@/components/ui";
import { trips, formatCurrency } from "@/lib/traveloop-data";

export default function ProfilePage() {
  const completedTrips = trips.filter((t) => t.status === "Completed");
  const upcomingTrips = trips.filter((t) => t.status !== "Completed");
  const totalCities = trips.reduce((sum, t) => sum + t.cities.length, 0);

  return (
    <AppShell active="Profile">
      <div className="mx-auto max-w-5xl space-y-6 pb-24 lg:pb-0">
        {/* Profile header */}
        <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
          <div className="relative h-44 bg-gradient-to-r from-sky-600 via-sky-400 to-cyan-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_40%,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.15),transparent_50%)]" />
          </div>

          <div className="px-6 pb-6">
            {/* Avatar row — sits above text, pulled up into the banner */}
            <div className="-mt-16 mb-4">
              <div className="grid h-28 w-28 place-items-center rounded-2xl border-4 border-white bg-gradient-to-br from-sky-400 to-sky-600 text-3xl font-black text-white shadow-xl shadow-sky-200">
                PR
              </div>
            </div>

            {/* Name + button row — fully below the avatar */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-black text-slate-950">
                  Priya Rao
                </h1>
                <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-slate-500">
                  Mumbai based planner · Loves train routes, local food, and
                  budget-aware trips
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50"
              >
                <Icon name="profile" className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-4">
          {[
            { label: "Total Trips", value: trips.length.toString(), icon: "trips" as const },
            { label: "Cities Visited", value: totalCities.toString(), icon: "search" as const },
            { label: "Completed", value: completedTrips.length.toString(), icon: "check" as const },
            { label: "Upcoming", value: upcomingTrips.length.toString(), icon: "calendar" as const },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-sky-50 text-sky-600">
                  <Icon name={stat.icon} className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xl font-black text-slate-950">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.label}</p>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Upcoming Trips */}
        <div className="flex items-center gap-3">
          <h2 className="shrink-0 text-xl font-black text-slate-950">
            Upcoming Trips
          </h2>
          <span className="h-px flex-1 bg-sky-100" />
        </div>
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {upcomingTrips.map((trip) => {
            const progress = Math.round((trip.spent / trip.budget) * 100);
            return (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
              >
                <div className="relative h-36">
                  <Image
                    src={trip.image}
                    alt={trip.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-black text-white">{trip.name}</h3>
                    <p className="text-xs text-sky-100">{trip.dates}</p>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {trip.cities.map((city) => (
                      <span
                        key={city}
                        className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600"
                      >
                        {city}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{formatCurrency(trip.spent)} spent</span>
                    <span>{progress}%</span>
                  </div>
                  <ProgressBar value={progress} />
                </div>
              </Link>
            );
          })}
        </section>

        {/* Completed Trips */}
        {completedTrips.length > 0 && (
          <>
            <div className="flex items-center gap-3">
              <h2 className="shrink-0 text-xl font-black text-slate-950">
                Completed Trips
              </h2>
              <span className="h-px flex-1 bg-sky-100" />
            </div>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {completedTrips.map((trip) => (
                <Link
                  key={trip.id}
                  href={`/trips/${trip.id}`}
                  className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
                >
                  <div className="relative h-36">
                    <Image
                      src={trip.image}
                      alt={trip.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-slate-950/20" />
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-slate-900/60 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur">
                        Completed ✓
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="font-black text-white">{trip.name}</h3>
                      <p className="text-xs text-sky-100">{trip.dates}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-1.5">
                      {trip.cities.map((city) => (
                        <span
                          key={city}
                          className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-600"
                        >
                          {city}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}
