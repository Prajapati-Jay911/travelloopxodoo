"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import {
  apiList,
  cityImage,
  formatMoney,
  type ActivityDto,
  type CityDto,
} from "@/lib/client-api";

const activityTypes = ["", "SIGHTSEEING", "FOOD", "ADVENTURE", "CULTURE", "SHOPPING"];

export default function ExplorePage() {
  const [cities, setCities] = useState<CityDto[]>([]);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadExplore = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const cityParams = new URLSearchParams({ limit: "24" });
    const activityParams = new URLSearchParams({ limit: "24" });

    if (query.trim()) {
      cityParams.set("q", query.trim());
      activityParams.set("q", query.trim());
    }

    if (type) {
      activityParams.set("type", type);
    }

    try {
      const [cityResult, activityResult] = await Promise.all([
        apiList<CityDto>(`/api/cities?${cityParams.toString()}`),
        apiList<ActivityDto>(`/api/activities/catalog?${activityParams.toString()}`),
      ]);
      setCities(cityResult.data);
      setActivities(activityResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load explore data");
    } finally {
      setIsLoading(false);
    }
  }, [query, type]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadExplore();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadExplore]);

  return (
    <AppShell active="Explore">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search destinations"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search destinations, activities..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          <select
            aria-label="Activity type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600"
          >
            {activityTypes.map((item) => (
              <option key={item || "all"} value={item}>{item || "All activities"}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void loadExplore()}
            className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
          >
            Search
          </button>
        </section>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}

        <div className="flex items-center gap-3">
          <h1 className="shrink-0 text-xl font-black text-slate-950">Destinations</h1>
          <span className="text-sm text-slate-500">{cities.length} cities found</span>
          <span className="h-px flex-1 bg-sky-100" />
        </div>

        {isLoading ? (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-72 animate-pulse rounded-2xl bg-sky-50" />)}
          </section>
        ) : cities.length === 0 ? (
          <EmptyState title="No destinations found" body="Try a different search term or remove filters." action={<button className="font-bold text-sky-600" onClick={() => setQuery("")}>Clear search</button>} />
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cities.map((city) => {
              const imageUrl = cityImage(city);

              return (
              <Link key={city.id} href="/trips/new" className="lift-card overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
                <div className="relative h-44 bg-sky-100">
                  {imageUrl && <Image src={imageUrl} alt={`${city.name}, ${city.country}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 backdrop-blur">{city.region}</span>
                    <h3 className="mt-1.5 text-lg font-black text-white">{city.name}</h3>
                    <p className="text-sm text-sky-100">{city.flag} {city.country}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-sky-100 p-4 text-center text-sm">
                  <div><p className="text-slate-500">Region</p><p className="mt-0.5 font-bold text-slate-950">{city.region}</p></div>
                  <div><p className="text-slate-500">Cost</p><p className="mt-0.5 font-bold text-slate-950">{city.costIndex}/100</p></div>
                  <div><p className="text-slate-500">Popularity</p><p className="mt-0.5 font-bold text-slate-950">{city.popularity}</p></div>
                </div>
              </Link>
              );
            })}
          </section>
        )}

        <div className="flex items-center gap-3 pt-4">
          <h2 className="shrink-0 text-xl font-black text-slate-950">Activities</h2>
          <span className="text-sm text-slate-500">{activities.length} catalog matches</span>
          <span className="h-px flex-1 bg-sky-100" />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <article key={activity.id} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600">{activity.type}</p>
                  <h3 className="mt-2 text-lg font-black text-slate-950">{activity.name}</h3>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-600">{formatMoney(activity.cost)}</span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-500">{activity.description}</p>
              <p className="mt-4 text-xs font-bold text-slate-500">{activity.city?.flag} {activity.city?.name}, {activity.city?.country} · {activity.duration} min</p>
            </article>
          ))}
        </section>
      </div>
    </AppShell>
  );
}
