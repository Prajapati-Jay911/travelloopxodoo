"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { EmptyState } from "@/components/ui";
import Link from "next/link";
import { apiFetch, apiList, formatMoney } from "@/lib/client-api";
import { 
  Users, 
  Map, 
  MapPin, 
  Activity, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Globe2, 
  Trash2,
  Search
} from "lucide-react";

type AdminStats = {
  totalUsers: number;
  totalTrips: number;
  tripsCreatedToday: number;
  totalActivities: number;
  topCities: {
    id: string;
    name: string;
    country: string;
    flag: string | null;
    _count: { stops: number };
  }[];
  recentTrips: {
    id: string;
    name: string;
    totalCost: number | null;
    startDate: string;
    endDate: string;
    user: { firstName: string; lastName: string; email: string };
  }[];
  totalRevenue: number;
  tripsPerMonth: { name: string; value: number }[];
  budgetTrends: { name: string; value: number }[];
};

type AdminUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  _count: { trips: number };
};

function SimpleBarChart({ data, title, isCurrency = false }: { data: { name: string, value: number }[], title: string, isCurrency?: boolean }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-bold text-slate-700 mb-6">{title}</h3>
        <div className="flex-1 flex items-center justify-center h-40 border-2 border-dashed border-sky-100 rounded-xl">
          <p className="text-sm font-bold text-slate-400">No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  
  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-bold text-slate-700 mb-6">{title}</h3>
      <div className="flex-1 flex items-stretch justify-between gap-2 h-40">
        {data.map((item, i) => {
          const rawValue = Number(item.value) || 0;
          const heightPct = Math.max((rawValue / maxValue) * 100, 5);
          return (
            <div key={i} className="flex flex-col items-center justify-end gap-2 group flex-1 h-full min-h-0">
              <div className="w-full relative flex-1 min-h-[100px]">
                <div 
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[40px] bg-sky-200 rounded-t-sm group-hover:bg-sky-400 transition-all duration-500"
                  style={{ height: `${heightPct}%` }}
                >
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                    {isCurrency ? formatMoney(rawValue) : rawValue}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0 truncate max-w-full text-center" title={item.name}>{item.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadAdmin = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [statsResult, usersResult] = await Promise.all([
        apiFetch<AdminStats>("/api/admin/stats"),
        apiList<AdminUser>("/api/admin/users?limit=10"),
      ]);
      setStats(statsResult);
      setUsers(usersResult.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load admin data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAdmin();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadAdmin]);

  async function deleteUser(id: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/admin/users/${id}`, { method: "DELETE" });
      setUsers((current) => current.filter((user) => user.id !== id));
      loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user");
    }
  }

  async function deleteTrip(id: string) {
    if (!confirm("Are you sure you want to delete this trip?")) return;
    setError("");

    try {
      await apiFetch<{ deleted: boolean }>(`/api/trips/${id}`, { method: "DELETE" });
      loadAdmin();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete trip");
    }
  }

  return (
    <AppShell active="Admin" adminMode={true}>
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
        
        {/* Header with Search and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-sky-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 grid place-items-center text-white shadow-lg">
              <Globe2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-slate-500 font-medium">Platform overview and management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search users or trips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 pr-4 py-2.5 rounded-full border border-sky-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none w-full md:w-64 transition-all"
              />
            </div>
            <button 
              onClick={() => {
                setIsRefreshing(true);
                loadAdmin().finally(() => setIsRefreshing(false));
              }}
              disabled={isRefreshing}
              className={`p-2.5 rounded-full border border-sky-100 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
              title="Refresh Data"
            >
              <Globe2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-4 gap-4"><div className="h-32 bg-sky-50 rounded-2xl"/><div className="h-32 bg-sky-50 rounded-2xl"/><div className="h-32 bg-sky-50 rounded-2xl"/><div className="h-32 bg-sky-50 rounded-2xl"/></div>
            <div className="h-64 bg-sky-50 rounded-2xl" />
          </div>
        ) : !stats ? (
          !error ? (
            <EmptyState
              title="Access Denied"
              body="You need admin privileges to view this dashboard."
              action={
                <Link href="/login" className="px-5 py-2.5 rounded-xl bg-sky-100 text-sky-700 font-bold hover:bg-sky-200 transition-colors">
                  Sign in to Console
                </Link>
              }
            />
          ) : null
        ) : (
          <div className="space-y-8">
            
            {/* 1. Top Analytics Cards */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <article className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-blue-50 text-blue-600 grid place-items-center">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
                  <p className="text-3xl font-black text-slate-900">{stats.totalUsers.toLocaleString()}</p>
                </div>
              </article>
              <article className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
                  <Map className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Trips</p>
                  <p className="text-3xl font-black text-slate-900">{stats.totalTrips.toLocaleString()}</p>
                </div>
              </article>
              <article className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-orange-50 text-orange-600 grid place-items-center">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Popular Dest.</p>
                  <p className="text-2xl font-black text-slate-900 truncate max-w-[120px]">
                    {stats.topCities[0]?.name || "N/A"}
                  </p>
                </div>
              </article>
              <article className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-purple-50 text-purple-600 grid place-items-center">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Activities</p>
                  <p className="text-3xl font-black text-slate-900">{stats.totalActivities.toLocaleString()}</p>
                </div>
              </article>
              <article className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex items-center gap-5">
                <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-600 grid place-items-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Revenue</p>
                  <p className="text-2xl font-black text-slate-900">{formatMoney(stats.totalRevenue)}</p>
                </div>
              </article>
            </section>

            {/* 2. Charts Section */}
            <section className="grid lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="h-5 w-5 text-sky-500" />
                  <h2 className="text-lg font-black text-slate-900">Trips per month</h2>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-4">
                  <SimpleBarChart data={stats.tripsPerMonth} title="Recent Trip Creation Volume" />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-black text-slate-900">Most visited cities</h2>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-4">
                  <SimpleBarChart 
                    data={stats.topCities.slice(0, 6).map(c => ({ name: c.name.split(' ')[0], value: c._count.stops }))} 
                    title="Top Destinations by Stops" 
                  />
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-sky-100 shadow-sm flex flex-col">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-black text-slate-900">Budget trends</h2>
                </div>
                <div className="flex-1 bg-slate-50 rounded-xl p-4">
                  <SimpleBarChart data={stats.budgetTrends} title="Average Allocated Budget" isCurrency />
                </div>
              </div>
            </section>

            {/* 3. Tables Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Recent Users Table */}
            <section className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-sky-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <h2 className="text-lg font-black text-slate-900">Recent Users</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {users.filter(u => 
                    u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    u.firstName.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length} showing
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-black">Name</th>
                      <th className="p-4 font-black">Email</th>
                      <th className="p-4 font-black">Trips Created</th>
                      <th className="p-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {users
                      .filter(u => 
                        u.email.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 5)
                      .map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <span className="font-bold text-slate-900">{user.firstName} {user.lastName}</span>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">{user.email}</td>
                        <td className="p-4">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                            {user._count?.trips || 0}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => deleteUser(user.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={4} className="p-4 text-center text-slate-500">No users found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Recent Trips Table */}
            <section className="bg-white rounded-2xl border border-sky-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-sky-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Map className="h-5 w-5 text-emerald-500" />
                  <h2 className="text-lg font-black text-slate-900">Recent Trips</h2>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  {stats.recentTrips.filter(t => 
                    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                    t.user.email.toLowerCase().includes(searchQuery.toLowerCase())
                  ).length} showing
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4 font-black">Trip Name</th>
                      <th className="p-4 font-black">User</th>
                      <th className="p-4 font-black">Budget</th>
                      <th className="p-4 font-black">Status</th>
                      <th className="p-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sky-50">
                    {stats.recentTrips
                      .filter(t => 
                        t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        t.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        t.user.firstName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .map(t => {
                        const isPast = new Date(t.endDate) < new Date();
                        const isFuture = new Date(t.startDate) > new Date();
                        const status = isPast ? "Completed" : isFuture ? "Upcoming" : "Ongoing";
                        const statusColor = isPast ? "bg-slate-100 text-slate-600" : isFuture ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600";
                        
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-slate-900">{t.name}</td>
                            <td className="p-4 text-slate-500 font-medium">{t.user.firstName} {t.user.lastName}</td>
                            <td className="p-4 font-bold text-slate-700">{formatMoney(t.totalCost || 0)}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-2 py-1 rounded-md font-bold text-[10px] uppercase tracking-wider ${statusColor}`}>
                                {status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Link href={`/trips/${t.id}`} className="p-1 text-sky-400 hover:text-sky-600 transition-colors">
                                  <Map className="h-4 w-4" />
                                </Link>
                                <button onClick={() => deleteTrip(t.id)} className="p-1 text-rose-400 hover:text-rose-600 transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    {stats.recentTrips.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-slate-500">No trips found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
            </div>

            {/* 5. Popular Destinations Section */}
            <section className="bg-white rounded-3xl border border-sky-100 shadow-sm p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-500 grid place-items-center">
                  <PieChart className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Popular Destinations</h2>
                  <p className="text-sm text-slate-500 font-medium">Top trending locations globally</p>
                </div>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                {stats.topCities.slice(0, 5).map((city, idx) => (
                  <div key={city.id} className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 hover:border-sky-200 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300">
                    <div className="absolute -right-6 -top-6 opacity-[0.03] text-[120px] font-black text-slate-900 pointer-events-none group-hover:opacity-[0.08] group-hover:scale-110 transition-all">
                      {idx + 1}
                    </div>
                    <div className="relative z-10">
                      <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform origin-left">
                        {city.flag || "📍"}
                      </div>
                      <h3 className="font-black text-slate-900 text-lg mb-1 truncate">{city.name}</h3>
                      <p className="text-sm font-bold text-slate-400 mb-6 truncate uppercase tracking-widest">{city.country}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-black">
                          <MapPin className="h-3 w-3" /> {city._count.stops} STOPS
                        </div>
                        <div className="text-sky-500 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                          <Search className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {stats.topCities.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <Globe2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold italic text-lg">&quot;No destinations explored yet...&quot;</p>
                  </div>
                )}
              </div>
            </section>

          </div>
        )}
      </div>
    </AppShell>
  );
}
