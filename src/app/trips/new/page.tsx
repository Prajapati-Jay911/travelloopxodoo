"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import {
  apiFetch,
  apiList,
  cityImage,
  getAuthToken,
  type CityDto,
  type StopDto,
  type TripDto,
} from "@/lib/client-api";

export default function NewTripPage() {
  const router = useRouter();
  const [cities, setCities] = useState<CityDto[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    isPublic: false,
  });
  const [error, setError] = useState("");
  const [isLoadingCities, setIsLoadingCities] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId),
    [cities, selectedCityId],
  );

  useEffect(() => {
    let mounted = true;

    apiList<CityDto>("/api/cities?featured=true&limit=18")
      .then((result) => {
        if (mounted) {
          setCities(result.data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unable to load cities");
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoadingCities(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(field: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!getAuthToken()) {
      router.push("/login");
      return;
    }

    if (!form.startDate || !form.endDate) {
      setError("Start and end date are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const trip = await apiFetch<TripDto>("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          coverPhoto: selectedCity ? (cityImage(selectedCity) ?? "") : "",
          startDate: form.startDate,
          endDate: form.endDate,
          isPublic: form.isPublic,
        }),
      });

      if (selectedCityId) {
        await apiFetch<StopDto>(`/api/trips/${trip.id}/stops`, {
          method: "POST",
          body: JSON.stringify({
            cityId: selectedCityId,
            startDate: form.startDate,
            endDate: form.endDate,
          }),
        });
      }

      router.push(`/trips/${trip.id}/build`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create trip");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell active="My Trips">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-sky-900/10">
        <section className="border-b border-sky-100 p-5">
          <h1 className="text-2xl font-black text-slate-950">Plan a new trip</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create the trip, choose the first destination, then continue into the itinerary builder
          </p>
        </section>

        <form className="space-y-4 border-b border-sky-100 p-5 md:max-w-3xl" onSubmit={handleSubmit}>
          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Trip Name:</span>
            <input
              aria-label="Trip Name"
              type="text"
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g. Europe Design Loop"
              required
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-400"
            />
          </label>

          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Select a Place:</span>
            <select
              aria-label="Select a Place"
              value={selectedCityId}
              onChange={(event) => setSelectedCityId(event.target.value)}
              className="h-11 appearance-none rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100"
            >
              <option value="">Choose a destination...</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.flag ? `${city.flag} ` : ""}{city.name}, {city.country} — {city.region}
                </option>
              ))}
            </select>
          </label>

          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Start Date:</span>
            <input
              aria-label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(event) => updateField("startDate", event.target.value)}
              required
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100"
            />
          </label>

          <label className="grid items-center gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>End Date:</span>
            <input
              aria-label="End Date"
              type="date"
              value={form.endDate}
              onChange={(event) => updateField("endDate", event.target.value)}
              required
              className="h-11 rounded-xl border border-sky-100 bg-white px-4 text-slate-900 shadow-sm shadow-sky-100"
            />
          </label>

          <label className="grid items-start gap-3 text-sm font-bold text-slate-700 md:grid-cols-[140px_1fr]">
            <span>Description:</span>
            <textarea
              aria-label="Trip Description"
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={4}
              placeholder="Purpose, travel style, must-see places..."
              className="rounded-xl border border-sky-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-sky-100 placeholder:text-slate-400"
            />
          </label>

          <label className="flex items-center gap-3 text-sm font-bold text-slate-700 md:pl-[152px]">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(event) => updateField("isPublic", event.target.checked)}
              className="h-4 w-4 accent-sky-500"
            />
            Make this itinerary public and shareable
          </label>

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 md:ml-[152px]">
              {error}
            </p>
          )}

          <div className="pt-2 md:pl-[152px]">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-8 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:scale-[1.02] hover:bg-[#f04a2d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Icon name="plus" className="h-4 w-4" />
              {isSubmitting ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>

        <section className="border-b border-sky-100 p-5">
          <h2 className="text-xl font-black text-slate-950">
            Suggested places to visit
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Select one of these cities as your first itinerary stop
          </p>
        </section>

        <section className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-3">
          {isLoadingCities
            ? Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-60 animate-pulse rounded-2xl bg-sky-50" />
              ))
            : cities.slice(0, 6).map((city) => {
                const imageUrl = cityImage(city);

                return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => setSelectedCityId(city.id)}
                  className={`lift-card overflow-hidden rounded-2xl border bg-white text-left shadow-xl shadow-sky-900/8 ${
                    selectedCityId === city.id ? "border-sky-400 ring-2 ring-sky-200" : "border-sky-100"
                  }`}
                >
                  <div className="relative h-48 bg-sky-100">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={city.name}
                        fill
                        className="object-cover"
                        sizes="360px"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="inline-block rounded-full border border-amber-300/40 bg-amber-400/20 px-2.5 py-0.5 text-xs font-bold text-amber-200 backdrop-blur">
                        {city.region}
                      </span>
                      <p className="mt-1 font-black text-white">{city.name}</p>
                      <p className="text-xs text-sky-100">{city.flag} {city.country}</p>
                    </div>
                  </div>
                </button>
                );
              })}
        </section>

        <div className="flex justify-end p-6 pt-0">
          <Link
            href="/explore"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#ff5a3d] px-5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#f04a2d]"
          >
            Explore more <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
