import Image from "next/image";
import Link from "next/link";
import type { Destination, Trip } from "@/lib/traveloop-data";
import { formatCurrency } from "@/lib/traveloop-data";

type IconName =
  | "dashboard"
  | "search"
  | "trips"
  | "community"
  | "profile"
  | "admin"
  | "plus"
  | "calendar"
  | "budget"
  | "check"
  | "notes"
  | "share"
  | "more"
  | "arrow";

const iconPaths: Record<IconName, string> = {
  dashboard: "M4 5h7v7H4V5Zm9 0h7v4h-7V5ZM4 14h7v5H4v-5Zm9-3h7v8h-7v-8Z",
  search:
    "M10.5 5a5.5 5.5 0 0 1 4.38 8.83l4.15 4.14-1.06 1.06-4.14-4.15A5.5 5.5 0 1 1 10.5 5Zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  trips:
    "M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm4-4h8V4H8V2.5Zm-1 7h10V8H7v1.5Zm0 4h10V12H7v1.5Zm0 4h6V16H7v1.5Z",
  community:
    "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8.5-.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19a5 5 0 0 1 10 0v1H3v-1Zm10.5 1v-1.25a6.45 6.45 0 0 0-1.1-3.62A4.5 4.5 0 0 1 21 17.5V20h-7.5Z",
  profile:
    "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0H5Z",
  admin:
    "M12 3 4 6v5c0 5 3.4 8.4 8 10 4.6-1.6 8-5 8-10V6l-8-3Zm0 4.5 3.5 3.5-1.06 1.06-1.69-1.69V16h-1.5v-5.63l-1.69 1.69L8.5 11 12 7.5Z",
  plus: "M11.25 5h1.5v6.25H19v1.5h-6.25V19h-1.5v-6.25H5v-1.5h6.25V5Z",
  calendar:
    "M7 3h1.5v2h7V3H17v2h2.5v15h-15V5H7V3Zm11 7H6v8.5h12V10ZM6 8.5h12v-2H6v2Z",
  budget:
    "M12 3a9 9 0 1 1-9 9h9V3Zm1.5.13A9 9 0 0 1 20.87 10H13.5V3.13Z",
  check:
    "m9.2 16.6-4.1-4.1 1.06-1.06 3.04 3.03 8.64-8.63L18.9 6.9 9.2 16.6Z",
  notes:
    "M5 3.5h10.75L19 6.75V20H5V3.5Zm9.8 1.5H6.5v13.5h11V7.7h-2.7V5ZM8 10h8v1.5H8V10Zm0 4h8v1.5H8V14Z",
  share:
    "M17 15a3 3 0 0 0-2.45 1.27L9.8 13.9a3.1 3.1 0 0 0 0-1.8l4.75-2.37A3 3 0 1 0 14 8a2.8 2.8 0 0 0 .08.66L9.32 11.04a3 3 0 1 0 0 1.92l4.76 2.38A2.8 2.8 0 0 0 14 16a3 3 0 1 0 3-1Z",
  more: "M6 13.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm6 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z",
  arrow:
    "M13.5 5.5 20 12l-6.5 6.5-1.06-1.06 4.69-4.69H4v-1.5h13.13l-4.69-4.69L13.5 5.5Z",
};

export function Icon({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  const classes =
    variant === "primary"
      ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-400"
      : "border border-slate-700 bg-slate-900/70 text-slate-100 hover:border-indigo-400";

  return (
    <Link
      href={href}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:scale-[1.02] ${classes}`}
    >
      {children}
    </Link>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
          {description}
        </p>
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  tone = "indigo",
}: {
  label: string;
  value: string;
  tone?: "indigo" | "amber" | "emerald" | "rose";
}) {
  const tones = {
    indigo: "from-indigo-400/20 text-indigo-200",
    amber: "from-amber-400/20 text-amber-200",
    emerald: "from-emerald-400/20 text-emerald-200",
    rose: "from-rose-400/20 text-rose-200",
  };

  return (
    <article className="lift-card rounded-2xl border border-slate-700/70 bg-gradient-to-br to-slate-950/80 p-5 shadow-xl shadow-slate-950/20">
      <div
        className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${tones[tone]} to-transparent p-3`}
      >
        <Icon name="budget" />
      </div>
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-sm text-slate-400">{label}</p>
    </article>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-amber-400 to-indigo-400"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

export function TripCard({ trip }: { trip: Trip }) {
  const progress = Math.round((trip.spent / trip.budget) * 100);

  return (
    <article className="lift-card overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80">
      <div className="relative aspect-[16/10]">
        <Image
          src={trip.image}
          alt={`${trip.name} cover`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 360px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
        <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          {trip.status}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <h3 className="text-lg font-semibold text-white">{trip.name}</h3>
          <p className="mt-1 text-sm text-slate-400">{trip.dates}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {trip.cities.map((city) => (
            <span
              key={city}
              className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs text-slate-300"
            >
              {city}
            </span>
          ))}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Budget used</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">{trip.stops.length || trip.cities.length} cities</span>
          <Link
            href={`/trips/${trip.id}`}
            className="inline-flex items-center gap-1 font-semibold text-indigo-300 hover:text-indigo-200"
          >
            Open <Icon name="arrow" className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function DestinationCard({
  destination,
}: {
  destination: Destination;
}) {
  return (
    <article className="lift-card min-w-[260px] overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/80">
      <div className="relative h-44">
        <Image
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          fill
          className="object-cover"
          sizes="280px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-xs font-semibold text-amber-200">{destination.tag}</p>
          <h3 className="mt-1 text-xl font-semibold text-white">
            {destination.city}
          </h3>
          <p className="text-sm text-slate-300">
            {destination.flag} / {destination.country}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 text-sm">
        <div>
          <p className="text-slate-500">Cost index</p>
          <p className="font-semibold text-white">{destination.costIndex}/100</p>
        </div>
        <div>
          <p className="text-slate-500">Popularity</p>
          <p className="font-semibold text-white">{destination.popularity}%</p>
        </div>
      </div>
    </article>
  );
}

export function SearchToolbar({
  placeholder = "Search trips, cities, notes...",
}: {
  placeholder?: string;
}) {
  return (
    <div className="surface-panel grid gap-3 rounded-2xl p-3 md:grid-cols-[1fr_auto_auto_auto]">
      <label className="flex h-12 items-center gap-3 rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-sm text-slate-400">
        <Icon name="search" className="h-4 w-4" />
        <input
          aria-label={placeholder}
          placeholder={placeholder}
          className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none"
        />
      </label>
      {["All status", "Newest", "Grid view"].map((item) => (
        <button
          key={item}
          type="button"
          aria-label={item}
          className="h-12 rounded-xl border border-slate-700 bg-slate-950/70 px-4 text-sm font-medium text-slate-200 transition hover:border-indigo-400"
        >
          {item}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action: React.ReactNode;
}) {
  return (
    <div className="surface-panel rounded-2xl p-8 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-indigo-400/30 bg-indigo-400/10 text-indigo-200">
        <Icon name="plus" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
        {body}
      </p>
      <div className="mt-6">{action}</div>
    </div>
  );
}

export function BudgetPill({ trip }: { trip: Trip }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
      <p className="text-xs text-slate-500">Trip budget</p>
      <p className="mt-1 text-xl font-semibold text-white">
        {formatCurrency(trip.spent)} / {formatCurrency(trip.budget)}
      </p>
      <div className="mt-3">
        <ProgressBar value={(trip.spent / trip.budget) * 100} />
      </div>
    </div>
  );
}
