"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { 
  MapPin, Calendar, Users, Star, Plane, Sun, 
  Search, Sparkles, ChevronRight, Activity, Wallet,
  Globe, ArrowRight, Filter, CheckCircle,
  SlidersHorizontal, ArrowUpDown, LayoutGrid, Lightbulb
} from "lucide-react";
import {
  apiFetch,
  apiList,
  formatDateRange,
  formatMoney,
  getAuthToken,
  getStoredUser,
  tripCover,
  type CityDto,
  type TripDto,
} from "@/lib/client-api";

// Images for the hero carousel
const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80", // Mountains
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80", // Beaches
  "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1920&q=80", // Forests
  "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80", // City Night
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1920&q=80", // Road Trips
];

const QUOTES = [
  "“The journey not the arrival matters.”",
  "“Adventure is worthwhile in itself.”",
  "“To travel is to live.”",
  "“Not all those who wander are lost.”"
];

// --- Subcomponents ---

function DashboardNav({ isLoggedIn }: { isLoggedIn: boolean }) {

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("traveloop_token");
      window.localStorage.removeItem("traveloop_user");
      window.location.reload();
    }
  };

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/explore", label: "Explore" },
    { href: "/trips", label: "My Trips" },
    { href: "/community", label: "Community" },
    { href: "/billing", label: "Billing" },
    { href: "/profile", label: "Profile" },
  ];

  if (isLoggedIn && getStoredUser()?.role === "ADMIN") {
    navItems.push({ href: "/admin", label: "Admin" });
  }

  return (
    <header className="absolute left-0 right-0 top-0 z-50 px-4 py-6 md:px-8">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between rounded-full border border-white/10 bg-black/20 px-6 backdrop-blur-xl transition-all hover:bg-black/30">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-11 w-11 overflow-hidden rounded-full ring-2 ring-white/20 ring-offset-2 ring-offset-black/20 transition-all duration-300 group-hover:ring-white/50 group-hover:scale-105 shadow-xl">
            <Image
              src="/logo.png"
              alt="Traveloop Logo"
              fill
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tight text-white group-hover:text-cyan-300 transition-colors">
            Traveloop
          </span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-semibold transition-colors ${
                item.label === "Dashboard" ? "text-cyan-400" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link 
            href="/search"
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 hover:scale-110"
          >
            <Search className="h-5 w-5" />
          </Link>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="hidden h-10 items-center rounded-full bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:flex"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="hidden h-10 items-center rounded-full bg-white/10 px-5 text-sm font-bold text-white backdrop-blur-md transition-colors hover:bg-white/20 sm:flex"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function FloatingStatCard({ icon, title, value, delay, className = "" }: { icon: React.ReactNode, title: string, value: string, delay: number, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: "easeOut" }}
      className={`absolute flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-2xl shadow-black/50 ${className}`}
      style={{
        animation: `float 6s ease-in-out infinite ${delay}s`,
      }}
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-white/10 to-transparent shadow-inner">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-white/60">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </motion.div>
  );
}

type DashboardStats = {
  cities: number;
  trips: number;
  activities: number;
};

type TravelTip = {
  title: string;
  type: string;
  desc: string;
  tip: string;
};

// --- Main Page Component ---

export default function PremiumDashboard() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [destinations, setDestinations] = useState<CityDto[]>([]);
  const [trips, setTrips] = useState<TripDto[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tips, setTips] = useState<TravelTip[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState("Popularity");
  const [groupBy, setGroupBy] = useState("None");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoggedIn(Boolean(getAuthToken()));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Embla carousels
  const [destRef] = useEmblaCarousel({ loop: true, align: "start" }, [Autoplay({ delay: 3000 })]);
  // useEmblaCarousel({ loop: false, align: "start" });

  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => {
      clearInterval(imgInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  useEffect(() => {
    void apiList<CityDto>("/api/cities?limit=6&featured=true")
      .then((result) => {
        setDestinations(result.data);
      })
      .catch(() => {
        setDestinations([]);
      });

    void apiFetch<DashboardStats>("/api/stats")
      .then((res) => setStats(res))
      .catch(() => setStats(null));

    void apiFetch<TravelTip[]>("/api/tips")
      .then((res) => setTips(res || []))
      .catch(() => setTips([]));

    if (!getAuthToken()) {
      return;
    }

    void apiList<TripDto>("/api/trips?limit=2&sortBy=newest")
      .then((result) => {
        setTrips(result.data);
      })
      .catch(() => {
        setTrips([]);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_42%,#fff7ed_100%)] text-slate-900 selection:bg-cyan-500/30">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}} />
      <DashboardNav isLoggedIn={isLoggedIn} />

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[95vh] w-full overflow-hidden rounded-b-[40px] shadow-2xl shadow-cyan-900/20">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={HERO_IMAGES[currentImageIndex]}
              alt="Travel destination"
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic gradients */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#020817]/80 via-transparent to-[#020817]/95" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#020817]/90 via-[#020817]/50 to-transparent" />

        {/* Animated background blobs */}
        <div className="absolute -left-[20%] top-[20%] z-0 h-[600px] w-[600px] rounded-full bg-cyan-600/20 blur-[120px]" />
        <div className="absolute -right-[10%] bottom-[10%] z-0 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[120px]" />

        {/* Animated Flight Path */}
        <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="none">
            <motion.path
              d="M -100,400 Q 200,100 500,250 T 1100,50"
              fill="none"
              stroke="url(#flight-gradient)"
              strokeWidth="2"
              strokeDasharray="8 8"
            />
            <motion.circle
              r="4"
              fill="#22d3ee"
              style={{
                offsetPath: 'path("M -100,400 Q 200,100 500,250 T 1100,50")',
              }}
              animate={{
                offsetDistance: ["0%", "100%"]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <defs>
              <linearGradient id="flight-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex h-full min-h-[95vh] max-w-7xl flex-col justify-center px-4 pt-20 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            
            {/* Left side: Text & Actions */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold tracking-[0.2em] text-cyan-400 uppercase">Traveloop Premium</span>
              </div>
              
              <h1 className="text-5xl font-black leading-[1.1] text-white md:text-7xl lg:text-[80px]">
                Explore <br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Horizons</span>
              </h1>
              
              <p className="mt-6 text-xl font-medium text-white/90">
                {isLoggedIn && getStoredUser() ? `Good Evening, ${getStoredUser()?.firstName} 👋` : "Good Evening, Explorer 👋"}
              </p>
              
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/60">
                Plan smarter journeys with AI-powered itineraries, seamless budgets, and exclusive destinations curated just for you.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Link
                  href="/trips/new"
                  className="group relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-cyan-500 px-8 text-sm font-bold text-[#020817] shadow-[0_0_40px_-10px_rgba(6,182,212,0.8)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(6,182,212,1)]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Plan New Trip <Plane className="h-4 w-4" />
                  </span>
                  <div className="absolute inset-0 z-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:text-cyan-300"
                >
                  <Search className="h-4 w-4" /> Search Ideas <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Dynamic Quote */}
              <div className="mt-12 overflow-hidden border-l-2 border-cyan-500/50 pl-4">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={quoteIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                    className="text-sm italic text-white/50"
                  >
                    {QUOTES[quoteIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Right side: Floating Cards */}
            <div className="hidden h-full min-h-[500px] w-full relative lg:block">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="absolute right-10 top-6 flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
              >
                <Sun className="h-5 w-5 text-amber-400" />
                <span className="text-sm font-medium text-white">Tokyo • 21°C • Clear Sky</span>
              </motion.div>

              <FloatingStatCard
                title="Destinations"
                value={stats ? `${stats.cities}+` : "124+"}
                icon={<Globe className="h-6 w-6 text-cyan-400" />}
                delay={0.2}
                className="top-24 right-48 w-64"
              />
              <FloatingStatCard
                title="Trips Planned"
                value={stats ? `${(stats.trips / 1000).toFixed(1)}K` : "2.4K"}
                icon={<CheckCircle className="h-6 w-6 text-emerald-400" />}
                delay={0.5}
                className="top-[200px] right-12 w-64"
              />
              <FloatingStatCard
                title="Activities Curated"
                value={stats ? `${stats.activities}` : "500+"}
                icon={<Activity className="h-6 w-6 text-blue-400" />}
                delay={1.1}
                className="top-[440px] right-8 w-64"
              />
              <FloatingStatCard
                title="Smart Budget Tracking"
                value="Active"
                icon={<Wallet className="h-6 w-6 text-amber-400" />}
                delay={0.8}
                className="top-[320px] right-40 w-72"
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN DASHBOARD CONTENT --- */}
      <main className="relative z-20 -mt-10 mx-auto max-w-7xl px-4 pb-32 md:px-8 space-y-24">
        
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mx-auto max-w-4xl"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              window.location.href = `/search?q=${encodeURIComponent(q)}`;
            }}
            className="rounded-[32px] border border-sky-100 bg-white/80 p-2 shadow-xl shadow-sky-900/5 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 px-4">
              <Search className="h-6 w-6 text-cyan-500" />
              <input
                name="q"
                type="text"
                placeholder="Search cities, countries, activities..."
                className="h-14 w-full bg-transparent text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              
              <div className="hidden items-center gap-2 border-l border-slate-100 pl-4 mr-2 md:flex">
                <button 
                  type="button"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-all ${
                    isFilterOpen ? "bg-cyan-500 text-white shadow-lg shadow-cyan-200" : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </button>
              </div>

              <button type="submit" className="rounded-full bg-cyan-500 px-8 py-3 font-bold text-white transition-transform hover:scale-105 shadow-sm shadow-cyan-200">
                Search
              </button>
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-6 border-t border-slate-100 p-6 md:grid-cols-3">
                    {/* Sort By */}
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <ArrowUpDown className="h-3 w-3" /> Sort By
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["Popularity", "Price: Low", "Price: High", "Name"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setSortBy(opt)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              sortBy === opt ? "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Group By */}
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <LayoutGrid className="h-3 w-3" /> Group By
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["None", "Region", "Country", "Cost"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setGroupBy(opt)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              groupBy === opt ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Filter Category */}
                    <div>
                      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <Filter className="h-3 w-3" /> Filter By
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {["All", "Beach", "Mountain", "City", "Culture"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setFilterCategory(opt)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              filterCategory === opt ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* Popular Destinations */}
        <section>
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900">Popular Destinations</h2>
              <p className="mt-2 text-slate-500">Explore curated locales based on global trends.</p>
            </div>
            <Link href="/explore" className="flex items-center gap-2 text-sm font-bold text-sky-600 hover:text-sky-500">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="overflow-hidden" ref={destRef}>
            <div className="flex gap-6 pb-8 pt-2" style={{ touchAction: "pan-y" }}>
              {destinations.slice(0, 6).map((dest) => (
                <div key={dest.id} className="min-w-[280px] max-w-[320px] flex-[0_0_100%] md:flex-[0_0_40%] lg:flex-[0_0_25%]">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative aspect-[4/5] overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-xl shadow-sky-900/5"
                  >
                    <Image
                      src={dest.imageUrl || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80"}
                      alt={dest.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-[#020817]/40 to-transparent opacity-80" />
                    
                    <div className="absolute right-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 backdrop-blur-md">
                      <div className="flex items-center gap-1 text-sm font-bold text-white">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {((dest.costIndex % 8) / 10 + 4.2).toFixed(1)}
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="mb-2 inline-block rounded-full bg-cyan-500/20 px-3 py-1 text-xs font-bold text-cyan-300 backdrop-blur-sm">
                        {dest.region}
                      </p>
                      <h3 className="text-2xl font-black text-white">{dest.name}</h3>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-white/60">
                          <MapPin className="h-4 w-4" /> {dest.country}
                        </div>
                        <p className="font-bold text-emerald-400">Est. ${dest.costIndex * 15}</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Upcoming Trips */}
          <section className="lg:col-span-2">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black text-slate-900">Upcoming Trips</h2>
                <p className="mt-2 text-slate-500">Your next adventures await.</p>
              </div>
            </div>
            
            <div className="grid gap-6">
              {trips.slice(0, 2).map((trip) => {
                const budget = trip.budget?.totalAllocated || 1;
                const spent = trip.totalCost ?? 0;
                const progress = Math.round((spent / budget) * 100);
                const cover = tripCover(trip) || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";
                return (
                  <motion.div
                    key={trip.id}
                    whileHover={{ x: 8 }}
                    className="group flex flex-col sm:flex-row gap-6 rounded-3xl border border-sky-100 bg-white p-4 shadow-xl shadow-sky-900/5 backdrop-blur-sm transition-colors hover:bg-sky-50"
                  >
                    <div className="relative h-48 w-full sm:w-64 shrink-0 overflow-hidden rounded-2xl">
                      <Image
                        src={cover}
                        alt={trip.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, 256px"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between py-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-black text-slate-900">{trip.name}</h3>
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">
                            {(trip.stopCount ?? 0) > 0 ? "Active" : "Draft"}
                          </span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-sky-500" /> {formatDateRange(trip.startDate, trip.endDate)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-sky-500" /> {trip.stopCount ?? 0} Cities
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="text-slate-500">Budget Planner</span>
                          <span className="font-bold text-slate-900">
                            {formatMoney(spent)} / {formatMoney(budget)}
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-sky-100">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* AI Recommendations */}
          <section>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900">AI Insights</h2>
              <p className="mt-2 text-slate-500">Smart suggestions for you.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              {(tips && tips.length > 0) ? tips.map((rec, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl border border-sky-100 bg-white p-6 shadow-xl shadow-sky-900/5 relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-sky-100/50 blur-2xl" />
                  
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-50 text-cyan-500">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{rec.title}</h3>
                      <p className="text-xs font-semibold text-sky-600 uppercase tracking-wider">{rec.type}</p>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-sm leading-relaxed text-slate-600">
                    {rec.desc}
                  </p>
                  
                  <div className="mt-5 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-2">
                      <Wallet className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                      <p className="text-xs font-medium text-emerald-700">
                        <span className="font-bold text-emerald-600">Pro Tip:</span> {rec.tip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p className="text-sm text-slate-500">No insights available at the moment.</p>
              )}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
