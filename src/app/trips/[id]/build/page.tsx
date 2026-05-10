"use client";

import { FormEvent, use, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState, Icon } from "@/components/ui";
import {
  apiFetch,
  apiList,
  cityImage,
  formatDateRange,
  formatMoney,
  tripCover,
  type ActivityDto,
  type CityDto,
  type StopDto,
  type TripDto,
} from "@/lib/client-api";

const activityTypes = [
  "SIGHTSEEING",
  "FOOD",
  "ADVENTURE",
  "CULTURE",
  "SHOPPING",
  "TRANSPORT",
  "ACCOMMODATION",
  "OTHER",
] as const;

export default function ItineraryBuilderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDto | null>(null);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [catalog, setCatalog] = useState<ActivityDto[]>([]);
  const [activeStopId, setActiveStopId] = useState("");
  const [stopForm, setStopForm] = useState({ cityId: "", startDate: "", endDate: "" });
  const [activityForm, setActivityForm] = useState({
    name: "",
    type: "SIGHTSEEING",
    cost: "0",
    duration: "60",
    startTime: "09:00",
    description: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const stops = trip?.stops ?? [];
  const activeStop = stops.find((stop) => stop.id === activeStopId) ?? stops[0];
  const totalCost = stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((activitySum, activity) => activitySum + activity.cost, 0),
    0,
  );

  const catalogForActiveCity = useMemo(() => {
    if (!activeStop) {
      return catalog.slice(0, 6);
    }

    return catalog.filter((activity) => activity.city?.id === activeStop.cityId).slice(0, 6);
  }, [activeStop, catalog]);

  const loadTrip = useCallback(async () => {
    setError("");

    try {
      const nextTrip = await apiFetch<TripDto>(`/api/trips/${id}`);
      setTrip(nextTrip);
      setActiveStopId((current) => current || nextTrip.stops?.[0]?.id || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load trip");
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => {
      Promise.all([
        loadTrip(),
        apiList<CityDto>("/api/cities?limit=100").then((result) => mounted && setCities(result.data)),
        apiList<ActivityDto>("/api/activities/catalog?limit=100").then((result) => mounted && setCatalog(result.data)),
      ])
        .catch((err) => {
          if (mounted) {
            setError(err instanceof Error ? err.message : "Unable to load builder data");
          }
        })
        .finally(() => {
          if (mounted) {
            setIsLoading(false);
          }
        });
    }, 0);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [loadTrip]);

  function updateActivityField(field: keyof typeof activityForm, value: string) {
    setActivityForm((current) => ({ ...current, [field]: value }));
  }

  async function createStop(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const stop = await apiFetch<StopDto>(`/api/trips/${id}/stops`, {
        method: "POST",
        body: JSON.stringify(stopForm),
      });
      setActiveStopId(stop.id);
      setStopForm({ cityId: "", startDate: "", endDate: "" });
      setNotice("Stop added");
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add stop");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteStop(stopId: string) {
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/trips/${id}/stops/${stopId}`, { method: "DELETE" });
      setActiveStopId("");
      setNotice("Stop deleted");
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete stop");
    } finally {
      setIsSaving(false);
    }
  }

  async function createActivity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeStop) {
      setError("Add a stop before adding activities");
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch<ActivityDto>(`/api/stops/${activeStop.id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          name: activityForm.name,
          type: activityForm.type,
          cost: Number(activityForm.cost),
          duration: Number(activityForm.duration),
          startTime: activityForm.startTime,
          description: activityForm.description,
        }),
      });
      setActivityForm({ name: "", type: "SIGHTSEEING", cost: "0", duration: "60", startTime: "09:00", description: "" });
      setNotice("Activity added");
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add activity");
    } finally {
      setIsSaving(false);
    }
  }

  async function addCatalogActivity(activity: ActivityDto) {
    if (!activeStop) {
      setError("Add a stop before adding activities");
      return;
    }

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch<ActivityDto>(`/api/stops/${activeStop.id}/activities`, {
        method: "POST",
        body: JSON.stringify({
          name: activity.name,
          type: activity.type,
          cost: activity.cost,
          duration: activity.duration,
          startTime: "09:00",
          description: activity.description ?? "",
          imageUrl: activity.imageUrl ?? "",
        }),
      });
      setNotice("Catalog activity added");
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add catalog activity");
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteActivity(activityId: string) {
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/activities/${activityId}`, { method: "DELETE" });
      setNotice("Activity deleted");
      await loadTrip();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete activity");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <AppShell active="My Trips">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="h-56 animate-pulse rounded-2xl bg-sky-50" />
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <div className="h-96 animate-pulse rounded-2xl bg-sky-50" />
            <div className="h-96 animate-pulse rounded-2xl bg-sky-50" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!trip) {
    return (
      <AppShell active="My Trips">
        <EmptyState
          title="Builder unavailable"
          body={error || "This itinerary could not be loaded."}
          action={<Link className="font-bold text-sky-600" href="/trips">Back to trips</Link>}
        />
      </AppShell>
    );
  }

  const coverUrl = tripCover(trip);
  const activeStopImageUrl = activeStop ? cityImage(activeStop.city) : null;

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-6xl space-y-6 pb-24 lg:pb-0">
        <section className="relative min-h-[220px] overflow-hidden rounded-2xl border border-sky-100 bg-sky-100 shadow-xl shadow-sky-900/8">
          {coverUrl && <Image src={coverUrl} alt={trip.name} fill className="object-cover" sizes="100vw" />}
          <div className="absolute inset-0 bg-slate-950/45" />
          <div className="absolute inset-0 flex items-center justify-between p-6 md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-200">Itinerary Builder</p>
              <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">{trip.name}</h1>
              <p className="mt-2 text-sm text-sky-100">{formatDateRange(trip.startDate, trip.endDate)}</p>
            </div>
            <div className="hidden rounded-2xl border border-white/20 bg-white/15 p-4 text-center text-white backdrop-blur md:block">
              <p className="text-2xl font-black">{formatMoney(totalCost)}</p>
              <p className="mt-1 text-xs text-sky-100">Total estimated</p>
            </div>
          </div>
        </section>

        {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>}
        {notice && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</p>}

        <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <aside className="space-y-4">
            <form onSubmit={createStop} className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
              <h2 className="text-lg font-black text-slate-950">Add stop</h2>
              <div className="mt-4 space-y-3">
                <select
                  aria-label="City"
                  value={stopForm.cityId}
                  onChange={(event) => setStopForm((current) => ({ ...current, cityId: event.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-sky-100 bg-white px-3 text-sm font-semibold text-slate-700"
                >
                  <option value="">Choose city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.flag} {city.name}, {city.country}</option>
                  ))}
                </select>
                <input
                  aria-label="Stop start date"
                  type="date"
                  value={stopForm.startDate}
                  onChange={(event) => setStopForm((current) => ({ ...current, startDate: event.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-sky-100 px-3 text-sm text-slate-700"
                />
                <input
                  aria-label="Stop end date"
                  type="date"
                  value={stopForm.endDate}
                  onChange={(event) => setStopForm((current) => ({ ...current, endDate: event.target.value }))}
                  required
                  className="h-11 w-full rounded-xl border border-sky-100 px-3 text-sm text-slate-700"
                />
                <button disabled={isSaving} type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 disabled:opacity-60">
                  <Icon name="plus" className="h-4 w-4" /> Add stop
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-xl shadow-sky-900/5">
              <h2 className="px-1 text-lg font-black text-slate-950">Stops</h2>
              <div className="mt-3 space-y-2">
                {stops.length === 0 ? (
                  <p className="rounded-xl bg-sky-50 p-4 text-sm text-slate-500">No stops yet.</p>
                ) : stops.map((stop, index) => (
                  <button
                    key={stop.id}
                    type="button"
                    onClick={() => setActiveStopId(stop.id)}
                    className={`w-full rounded-xl border p-3 text-left transition ${activeStop?.id === stop.id ? "border-sky-300 bg-sky-50" : "border-sky-100 bg-white hover:bg-sky-50"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-slate-950">{index + 1}. {stop.city.name}</span>
                      <span className="text-xs font-bold text-sky-600">{stop.activities.length} acts</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatDateRange(stop.startDate, stop.endDate)}</p>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-5">
            {!activeStop ? (
              <EmptyState
                title="Start with a destination"
                body="Add the first stop to unlock activity planning for this itinerary."
                action={<span className="font-bold text-sky-600">Use the add stop form</span>}
              />
            ) : (
              <>
                <div className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
                  <div className="relative h-56 bg-sky-100">
                    {activeStopImageUrl && <Image src={activeStopImageUrl} alt={activeStop.city.name} fill className="object-cover" sizes="100vw" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sky-100">Active stop</p>
                        <h2 className="mt-1 text-3xl font-black text-white">{activeStop.city.name}, {activeStop.city.country}</h2>
                        <p className="mt-1 text-sm text-sky-100">{formatDateRange(activeStop.startDate, activeStop.endDate)}</p>
                      </div>
                      <button type="button" onClick={() => void deleteStop(activeStop.id)} className="rounded-xl border border-white/30 bg-white/15 px-4 py-2 text-sm font-bold text-white backdrop-blur hover:bg-white/25">
                        Delete stop
                      </button>
                    </div>
                  </div>

                  <div className="p-5">
                    <form onSubmit={createActivity} className="grid gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 md:grid-cols-2">
                      <input aria-label="Activity name" value={activityForm.name} onChange={(event) => updateActivityField("name", event.target.value)} required placeholder="Activity name" className="h-11 rounded-xl border border-sky-100 px-3 text-sm" />
                      <select aria-label="Activity type" value={activityForm.type} onChange={(event) => updateActivityField("type", event.target.value)} className="h-11 rounded-xl border border-sky-100 px-3 text-sm">
                        {activityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                      </select>
                      <input aria-label="Activity cost" type="number" min="0" value={activityForm.cost} onChange={(event) => updateActivityField("cost", event.target.value)} className="h-11 rounded-xl border border-sky-100 px-3 text-sm" />
                      <input aria-label="Activity duration" type="number" min="1" value={activityForm.duration} onChange={(event) => updateActivityField("duration", event.target.value)} className="h-11 rounded-xl border border-sky-100 px-3 text-sm" />
                      <input aria-label="Activity start time" type="time" value={activityForm.startTime} onChange={(event) => updateActivityField("startTime", event.target.value)} className="h-11 rounded-xl border border-sky-100 px-3 text-sm" />
                      <button disabled={isSaving} type="submit" className="h-11 rounded-xl bg-[#ff5a3d] text-sm font-black text-white shadow-lg shadow-orange-200 disabled:opacity-60">Add activity</button>
                      <textarea aria-label="Activity description" value={activityForm.description} onChange={(event) => updateActivityField("description", event.target.value)} placeholder="Description" rows={3} className="rounded-xl border border-sky-100 px-3 py-2 text-sm md:col-span-2" />
                    </form>

                    <div className="mt-5 space-y-3">
                      {activeStop.activities.length === 0 ? (
                        <p className="rounded-xl border border-sky-100 bg-white p-4 text-sm text-slate-500">No activities yet. Add one manually or use a catalog suggestion below.</p>
                      ) : activeStop.activities.map((activity) => (
                        <article key={activity.id} className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm shadow-sky-100">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex flex-wrap gap-2">
                                <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-600">{activity.startTime ?? "Flexible"}</span>
                                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-600">{activity.type}</span>
                                <span className="text-xs text-slate-400">{activity.duration} min</span>
                              </div>
                              <h3 className="mt-2 font-bold text-slate-950">{activity.name}</h3>
                              <p className="mt-1 text-sm leading-relaxed text-slate-500">{activity.description}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-lg font-black text-slate-950">{formatMoney(activity.cost)}</p>
                              <button type="button" onClick={() => void deleteActivity(activity.id)} className="mt-2 text-xs font-bold text-rose-600">Delete</button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-xl shadow-sky-900/5">
                  <h2 className="text-lg font-black text-slate-950">Catalog suggestions</h2>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {catalogForActiveCity.length === 0 ? (
                      <p className="text-sm text-slate-500">No catalog suggestions for this city yet.</p>
                    ) : catalogForActiveCity.map((activity) => (
                      <button key={activity.id} type="button" onClick={() => void addCatalogActivity(activity)} className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-left hover:border-sky-300">
                        <p className="font-black text-slate-950">{activity.name}</p>
                        <p className="mt-1 text-xs font-bold text-sky-600">{activity.type} · {formatMoney(activity.cost)} · {activity.duration} min</p>
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">{activity.description}</p>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}
          </section>
        </section>

        <section className="surface-panel grid gap-4 rounded-2xl p-5 md:grid-cols-3">
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stops.length}</p>
            <p className="mt-1 text-sm text-slate-500">Cities</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{stops.reduce((sum, stop) => sum + stop.activities.length, 0)}</p>
            <p className="mt-1 text-sm text-slate-500">Activities planned</p>
          </div>
          <div className="rounded-xl border border-sky-100 bg-white p-4 text-center">
            <p className="text-2xl font-black text-slate-950">{formatMoney(totalCost)}</p>
            <p className="mt-1 text-sm text-slate-500">Total estimated</p>
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <Link href={`/trips/${trip.id}`} className="inline-flex h-12 items-center gap-2 rounded-xl border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition hover:border-sky-300 hover:bg-sky-50">
            View trip
          </Link>
          <Link href={`/trips/${trip.id}/budget`} className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]">
            <Icon name="budget" className="h-4 w-4" /> View Budget
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
