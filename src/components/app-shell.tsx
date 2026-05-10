import Link from "next/link";
import { Icon } from "@/components/ui";

const navItems = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/explore", label: "Explore", icon: "search" },
  { href: "/trips", label: "My Trips", icon: "trips" },
  { href: "/community", label: "Community", icon: "community" },
  { href: "/profile", label: "Profile", icon: "profile" },
  { href: "/admin", label: "Admin", icon: "admin" },
] as const;

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_34%),linear-gradient(180deg,#0f172a,#020617)]">
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 border-r border-slate-800 bg-slate-950/80 p-4 backdrop-blur-xl lg:block">
        <Link href="/" className="flex items-center gap-3 px-2 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-500 font-bold text-white">
            T
          </span>
          <span>
            <span className="block text-lg font-semibold text-white">
              Traveloop
            </span>
            <span className="text-xs text-slate-500">Journey command center</span>
          </span>
        </Link>
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive = active === item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30"
                    : "text-slate-400 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
          <p className="text-sm font-semibold text-white">Auto-save ready</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            API hooks can plug into this shell without changing page structure.
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-slate-500">
                Workspace
              </p>
              <p className="text-sm font-semibold text-slate-100">
                {active}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/trips/new"
                className="hidden h-10 items-center gap-2 rounded-xl bg-indigo-500 px-4 text-sm font-semibold text-white transition hover:scale-[1.02] hover:bg-indigo-400 md:inline-flex"
              >
                <Icon name="plus" className="h-4 w-4" />
                Plan trip
              </Link>
              <Link
                href="/profile"
                aria-label="Open profile"
                className="grid h-10 w-10 place-items-center rounded-full border border-slate-700 bg-slate-900 text-sm font-semibold text-white"
              >
                PR
              </Link>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 grid grid-cols-5 border-t border-slate-800 bg-slate-950/90 px-2 py-2 backdrop-blur-xl lg:hidden">
        {navItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`grid justify-items-center gap-1 rounded-xl px-2 py-2 text-[11px] ${
              active === item.label ? "text-indigo-300" : "text-slate-500"
            }`}
          >
            <Icon name={item.icon} className="h-5 w-5" />
            <span>{item.label.split(" ")[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
