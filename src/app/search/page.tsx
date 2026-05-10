"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";
import {
  apiList,
  formatMoney,
  type ActivityDto,
  type CityDto,
} from "@/lib/client-api";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  LayoutGrid, 
  MapPin, 
  Globe, 
  Activity,
  ArrowRight
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [cities, setCities] = useState<CityDto[]>([]);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    setError("");

    const cityParams = new URLSearchParams({ limit: "12" });
    const activityParams = new URLSearchParams({ limit: "12" });

    if (query.trim()) {
      cityParams.set("q", query.trim());
      activityParams.set("q", query.trim());
    }

    try {
      const [cityResult, activityResult] = await Promise.all([
        apiList<CityDto>(`/api/cities?${cityParams.toString()}`),
        apiList<ActivityDto>(`/api/activities/catalog?${activityParams.toString()}`),
      ]);
      setCities(cityResult.data);
      setActivities(activityResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [performSearch]);

  return (
    <AppShell active="Explore">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-8">
        {/* Search Header */}
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cities, activities, or travel ideas..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl border border-sky-100 bg-white text-lg shadow-sm focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 hover:bg-sky-50 transition-colors">
              <LayoutGrid className="h-4 w-4" /> Group by
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 hover:bg-sky-50 transition-colors">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-sky-100 bg-white text-sm font-bold text-slate-600 hover:bg-sky-50 transition-colors">
              <ArrowUpDown className="h-4 w-4" /> Sort by
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-8">
          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 w-full rounded-2xl bg-slate-50 animate-pulse" />
              ))}
            </div>
          ) : cities.length === 0 && activities.length === 0 ? (
            <EmptyState 
              title="No results found" 
              body="Try searching for something else like 'Tokyo', 'Hiking', or 'Paris'." 
            />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 px-1">Search Results</h2>
              
              {/* City Results */}
              {cities.map((city) => (
                <Link 
                  key={city.id} 
                  href="/trips/new"
                  className="group block overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-sky-50">
                      {city.imageUrl && (
                        <Image 
                          src={city.imageUrl} 
                          alt={city.name} 
                          fill 
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/10" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 truncate">{city.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-cyan-50 text-[10px] font-black text-cyan-600 uppercase tracking-wider">
                          City
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {city.country} · {city.region}
                      </p>
                    </div>
                    <div className="shrink-0">
                      <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}

              {/* Activity Results */}
              {activities.map((activity) => (
                <div 
                  key={activity.id}
                  className="group overflow-hidden rounded-2xl border border-sky-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                      <Activity className="h-8 w-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 truncate">{activity.name}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-black text-emerald-600 uppercase tracking-wider">
                          {activity.type}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-1">
                        {activity.description}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs font-bold text-slate-400">
                        <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {activity.city?.name}</span>
                        <span>·</span>
                        <span>{activity.duration} min</span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-slate-900">{formatMoney(activity.cost)}</p>
                      <Link href="/trips/new" className="text-xs font-bold text-cyan-600 hover:underline">
                        Plan trip
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchContent />
    </Suspense>
  );
}
