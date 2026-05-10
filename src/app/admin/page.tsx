import { AppShell } from "@/components/app-shell";
import { Icon } from "@/components/ui";
import { communityTrips } from "@/lib/traveloop-data";

const users = [
  { name: "Priya Rao", trips: 18, status: "Active", role: "USER", avatar: "PR" },
  { name: "Nisha Rao", trips: 11, status: "Active", role: "USER", avatar: "NR" },
  { name: "Aarav Mehta", trips: 7, status: "Review", role: "USER", avatar: "AM" },
  { name: "Maya Chen", trips: 14, status: "Active", role: "USER", avatar: "MC" },
  { name: "Admin Lead", trips: 42, status: "Active", role: "ADMIN", avatar: "AL" },
];

const popularCities = [
  { city: "Tokyo", visits: 3420, trend: "+12%" },
  { city: "Lisbon", visits: 2890, trend: "+8%" },
  { city: "Bali", visits: 2560, trend: "+22%" },
  { city: "Barcelona", visits: 2340, trend: "+5%" },
  { city: "Paris", visits: 2180, trend: "+3%" },
];

const popularActivities = [
  { name: "Food Tours", count: 1820, percentage: 34 },
  { name: "Sightseeing", count: 1540, percentage: 29 },
  { name: "Adventure Sports", count: 980, percentage: 18 },
  { name: "Cultural Visits", count: 640, percentage: 12 },
  { name: "Shopping", count: 380, percentage: 7 },
];

const monthlyTrends = [
  { month: "Jan", users: 1200, trips: 340 },
  { month: "Feb", users: 1450, trips: 420 },
  { month: "Mar", users: 1800, trips: 560 },
  { month: "Apr", users: 2100, trips: 680 },
  { month: "May", users: 2600, trips: 820 },
  { month: "Jun", users: 3100, trips: 960 },
];

export default function AdminPage() {
  const totalUsers = 12840;
  const totalTrips = 31406;
  const activeToday = 1284;
  const maxTrips = Math.max(...monthlyTrends.map((m) => m.trips));

  return (
    <AppShell active="Admin">
      <div className="mx-auto max-w-7xl space-y-6 pb-24 lg:pb-0">
        {/* Search toolbar */}
        <section className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex h-12 items-center gap-3 rounded-xl border border-sky-100 bg-white px-4 text-sm text-slate-500">
            <Icon name="search" className="h-4 w-4" />
            <input
              aria-label="Search admin"
              placeholder="Search users, trips, analytics..."
              className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </label>
          {["Filter", "Sort by"].map((label) => (
            <button
              key={label}
              type="button"
              className="h-12 rounded-xl border border-sky-100 bg-white px-5 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:bg-sky-50"
            >
              {label}
            </button>
          ))}
        </section>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-950">
              Admin Console
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Platform overview and management
            </p>
          </div>
        </div>

        {/* Stats row */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total Users",
              value: totalUsers.toLocaleString(),
              icon: "community" as const,
              color: "from-sky-100 text-sky-600",
            },
            {
              label: "Total Trips",
              value: totalTrips.toLocaleString(),
              icon: "trips" as const,
              color: "from-amber-100 text-amber-600",
            },
            {
              label: "Active Today",
              value: activeToday.toLocaleString(),
              icon: "dashboard" as const,
              color: "from-emerald-100 text-emerald-600",
            },
            {
              label: "Community Posts",
              value: communityTrips.length.toLocaleString(),
              icon: "share" as const,
              color: "from-rose-100 text-rose-600",
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className="lift-card rounded-2xl border border-sky-100 bg-gradient-to-br to-white p-5 shadow-xl shadow-sky-900/5"
            >
              <div
                className={`mb-4 inline-flex rounded-xl bg-gradient-to-br ${stat.color} to-transparent p-3`}
              >
                <Icon name={stat.icon} className="h-5 w-5" />
              </div>
              <p className="text-2xl font-black text-slate-950">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* Main content */}
          <div className="space-y-6">
            {/* User management table */}
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="flex items-center justify-between border-b border-sky-100 p-5">
                <h2 className="text-lg font-black text-slate-950">
                  Manage Users
                </h2>
                <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                  {users.length} users
                </span>
              </div>
              <div className="divide-y divide-sky-50">
                {users.map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center gap-4 p-4 transition hover:bg-sky-50/50"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-xs font-bold text-white shadow-md shadow-sky-200">
                      {user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-950">{user.name}</p>
                      <p className="text-xs text-slate-500">
                        {user.trips} trips
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        user.status === "Active"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {user.status}
                    </span>
                    <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-600">
                      {user.role}
                    </span>
                    <button
                      type="button"
                      className="rounded-lg border border-sky-100 px-3 py-1.5 text-xs font-bold text-sky-700 transition hover:border-sky-300 hover:bg-sky-50"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Monthly Trends chart */}
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="border-b border-sky-100 p-5">
                <h2 className="text-lg font-black text-slate-950">
                  User Trends &amp; Analytics
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Monthly trips created
                </p>
              </div>
              <div className="p-5">
                <div className="flex h-48 items-end gap-3">
                  {monthlyTrends.map((month) => (
                    <div
                      key={month.month}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <span className="text-xs font-bold text-slate-950">
                        {month.trips}
                      </span>
                      <div
                        className="w-full rounded-t-lg bg-gradient-to-t from-sky-500 to-sky-300 shadow-md shadow-sky-200 transition-all hover:from-sky-600 hover:to-sky-400"
                        style={{
                          height: `${(month.trips / maxTrips) * 100}%`,
                          minHeight: "16px",
                        }}
                      />
                      <span className="text-xs font-semibold text-slate-500">
                        {month.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            {/* Popular Cities */}
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="border-b border-sky-100 p-5">
                <h2 className="text-lg font-black text-slate-950">
                  Popular Cities
                </h2>
              </div>
              <div className="divide-y divide-sky-50 p-2">
                {popularCities.map((city, index) => (
                  <div
                    key={city.city}
                    className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-sky-50/50"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-sky-50 text-xs font-black text-sky-600">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-950">{city.city}</p>
                      <p className="text-xs text-slate-500">
                        {city.visits.toLocaleString()} visits
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-600">
                      {city.trend}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Popular Activities */}
            <section className="overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5">
              <div className="border-b border-sky-100 p-5">
                <h2 className="text-lg font-black text-slate-950">
                  Popular Activities
                </h2>
              </div>
              <div className="space-y-4 p-5">
                {popularActivities.map((activity) => (
                  <div key={activity.name}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="font-semibold text-slate-700">
                        {activity.name}
                      </span>
                      <span className="font-bold text-slate-950">
                        {activity.percentage}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-sky-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-sky-500"
                        style={{ width: `${activity.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
