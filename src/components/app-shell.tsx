"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui";
import { Plane } from "lucide-react";
import { getAuthToken, getStoredUser, clearAuth } from "@/lib/client-api";

type NavItem = {
  href: string;
  label: string;
  icon: "dashboard" | "search" | "trips" | "community" | "budget" | "profile" | "admin";
};

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/explore", label: "Explore", icon: "search" },
  { href: "/trips", label: "My Trips", icon: "trips" },
  { href: "/community", label: "Community", icon: "community" },
  { href: "/billing", label: "Billing", icon: "budget" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export function TopNav({ active }: { active?: string }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(Boolean(getAuthToken()));
      const user = getStoredUser();
      if (user) {
        setUserName(user.firstName);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const navItems: NavItem[] = [...defaultNavItems];
  if (isLoggedIn && getStoredUser()?.role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Admin", icon: "admin" });
  }

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/90 shadow-sm shadow-sky-900/5 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-blue-500 text-white shadow-lg shadow-sky-500/30">
            <Plane className="h-5 w-5 -rotate-45" />
          </div>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black tracking-tight text-slate-900">
              Traveloop
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.label;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${isActive
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-200"
                    : "text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                  }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700 hidden sm:inline-block">
                Hi, {userName}
              </span>
              <button
                onClick={handleLogout}
                className="hidden h-10 items-center rounded-full border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:inline-flex"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-full border border-sky-100 bg-white px-5 text-sm font-bold text-sky-700 shadow-sm shadow-sky-100 transition-colors hover:border-sky-300 hover:bg-sky-50 sm:inline-flex"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      <nav className="hide-scrollbar flex gap-2 overflow-x-auto border-t border-sky-50 px-4 py-2 lg:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-semibold ${active === item.label
                ? "bg-sky-500 text-white"
                : "bg-sky-50 text-slate-600"
              }`}
          >
            <Icon name={item.icon} className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function AppShell({
  active,
  children,
}: {
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_42%,#fff7ed_100%)] transition-colors duration-300">
      <TopNav active={active} />
      <main className="px-4 py-6 md:px-8 md:py-8 transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}
