"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Icon } from "@/components/ui";
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

export function TopNav({ active, adminMode }: { active?: string; adminMode?: boolean }) {
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

  const navItems: NavItem[] = adminMode ? [] : [...defaultNavItems];
  if (isLoggedIn && getStoredUser()?.role === "ADMIN" && !adminMode) {
    navItems.push({ href: "/admin", label: "Admin", icon: "admin" });
  }

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-sky-100 bg-white/90 shadow-sm shadow-sky-900/5 backdrop-blur-xl transition-colors duration-300">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-sky-100 ring-offset-2 transition-all duration-300 group-hover:ring-sky-300 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="Traveloop Logo"
              fill
              className="object-cover"
              sizes="44px"
              priority
            />
          </div>
          <span className="min-w-0">
            <span className="block truncate text-xl font-black tracking-tight text-slate-900 group-hover:text-sky-600 transition-colors">
              Traveloop{adminMode && <span className="text-rose-500 ml-1 font-bold text-sm uppercase">Admin</span>}
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

      {navItems.length > 0 && (
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
      )}
    </header>
  );
}

export function AppShell({
  active,
  adminMode,
  children,
}: {
  active: string;
  adminMode?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_42%,#fff7ed_100%)] transition-colors duration-300">
      <TopNav active={active} adminMode={adminMode} />
      <main className="px-4 py-6 md:px-8 md:py-8 transition-colors duration-300">
        {children}
      </main>
    </div>
  );
}
