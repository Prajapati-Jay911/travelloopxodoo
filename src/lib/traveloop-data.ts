export type TripStatus = "Upcoming" | "Ongoing" | "Completed" | "Draft";

export type ActivityType =
  | "Sightseeing"
  | "Food"
  | "Adventure"
  | "Culture"
  | "Shopping"
  | "Transport"
  | "Stay";

export type Activity = {
  id: string;
  name: string;
  type: ActivityType;
  time: string;
  cost: number;
  duration: string;
  description: string;
};

export type Stop = {
  id: string;
  city: string;
  country: string;
  flag: string;
  dates: string;
  nights: number;
  costIndex: number;
  image: string;
  activities: Activity[];
};

export type Trip = {
  id: string;
  name: string;
  dates: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  visibility: "Public" | "Private";
  image: string;
  cities: string[];
  budget: number;
  spent: number;
  notes: number;
  checklistPacked: number;
  checklistTotal: number;
  stops: Stop[];
};

export type Destination = {
  id: string;
  city: string;
  country: string;
  flag: string;
  region: string;
  image: string;
  costIndex: number;
  popularity: number;
  tag: string;
};

export type CommunityTrip = {
  id: string;
  title: string;
  author: string;
  avatar: string;
  image: string;
  cities: string[];
  saves: number;
  days: number;
};

export const destinations: Destination[] = [
  {
    id: "tokyo",
    city: "Tokyo",
    country: "Japan",
    flag: "JP",
    region: "East Asia",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80",
    costIndex: 82,
    popularity: 98,
    tag: "Neon food crawl",
  },
  {
    id: "lisbon",
    city: "Lisbon",
    country: "Portugal",
    flag: "PT",
    region: "Europe",
    image:
      "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=1200&q=80",
    costIndex: 58,
    popularity: 91,
    tag: "Coastal city break",
  },
  {
    id: "marrakesh",
    city: "Marrakesh",
    country: "Morocco",
    flag: "MA",
    region: "North Africa",
    image:
      "https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1200&q=80",
    costIndex: 46,
    popularity: 88,
    tag: "Markets and riads",
  },
  {
    id: "reykjavik",
    city: "Reykjavik",
    country: "Iceland",
    flag: "IS",
    region: "Nordics",
    image:
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200&q=80",
    costIndex: 89,
    popularity: 84,
    tag: "Northern lights",
  },
  {
    id: "bali",
    city: "Bali",
    country: "Indonesia",
    flag: "ID",
    region: "Southeast Asia",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
    costIndex: 42,
    popularity: 95,
    tag: "Wellness and surf",
  },
  {
    id: "cape-town",
    city: "Cape Town",
    country: "South Africa",
    flag: "ZA",
    region: "Africa",
    image:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&q=80",
    costIndex: 52,
    popularity: 86,
    tag: "Wine and coast",
  },
];

const activities: Activity[] = [
  {
    id: "act-1",
    name: "Private architecture walk",
    type: "Culture",
    time: "09:30",
    cost: 80,
    duration: "2h 30m",
    description: "Curated neighborhoods, hidden courtyards, and local context.",
  },
  {
    id: "act-2",
    name: "Market tasting route",
    type: "Food",
    time: "13:00",
    cost: 64,
    duration: "2h",
    description: "Five vendor stops with allergen-aware notes and receipts.",
  },
  {
    id: "act-3",
    name: "Sunset viewpoint transfer",
    type: "Transport",
    time: "17:45",
    cost: 42,
    duration: "45m",
    description: "Reserved driver window with buffer for traffic.",
  },
];

export const trips: Trip[] = [
  {
    id: "europe-loop",
    name: "Europe Design Loop",
    dates: "Jun 12 - Jun 24, 2026",
    startDate: "2026-06-12",
    endDate: "2026-06-24",
    status: "Upcoming",
    visibility: "Private",
    image:
      "https://images.unsplash.com/photo-1491557345352-5929e343eb89?auto=format&fit=crop&w=1400&q=80",
    cities: ["Lisbon", "Barcelona", "Paris"],
    budget: 5200,
    spent: 3180,
    notes: 12,
    checklistPacked: 18,
    checklistTotal: 31,
    stops: [
      {
        id: "stop-lisbon",
        city: "Lisbon",
        country: "Portugal",
        flag: "PT",
        dates: "Jun 12 - Jun 15",
        nights: 3,
        costIndex: 58,
        image:
          "https://images.unsplash.com/photo-1585208798174-6cedd86e019a?auto=format&fit=crop&w=1200&q=80",
        activities,
      },
      {
        id: "stop-barcelona",
        city: "Barcelona",
        country: "Spain",
        flag: "ES",
        dates: "Jun 16 - Jun 20",
        nights: 4,
        costIndex: 73,
        image:
          "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=1200&q=80",
        activities: activities.slice(0, 2),
      },
      {
        id: "stop-paris",
        city: "Paris",
        country: "France",
        flag: "FR",
        dates: "Jun 20 - Jun 24",
        nights: 4,
        costIndex: 87,
        image:
          "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80",
        activities: activities.slice(1),
      },
    ],
  },
  {
    id: "japan-food-map",
    name: "Japan Food Map",
    dates: "Sep 4 - Sep 16, 2026",
    startDate: "2026-09-04",
    endDate: "2026-09-16",
    status: "Draft",
    visibility: "Private",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1400&q=80",
    cities: ["Tokyo", "Kyoto", "Osaka"],
    budget: 6400,
    spent: 1120,
    notes: 7,
    checklistPacked: 4,
    checklistTotal: 27,
    stops: [],
  },
  {
    id: "andes-retreat",
    name: "Andes Retreat",
    dates: "Feb 8 - Feb 18, 2026",
    startDate: "2026-02-08",
    endDate: "2026-02-18",
    status: "Completed",
    visibility: "Public",
    image:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=1400&q=80",
    cities: ["Cusco", "Sacred Valley"],
    budget: 3800,
    spent: 3640,
    notes: 18,
    checklistPacked: 22,
    checklistTotal: 22,
    stops: [],
  },
];

export const communityTrips: CommunityTrip[] = [
  {
    id: "community-1",
    title: "10 days across Portugal by train",
    author: "Nisha Rao",
    avatar: "NR",
    image:
      "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
    cities: ["Porto", "Lisbon", "Lagos"],
    saves: 1840,
    days: 10,
  },
  {
    id: "community-2",
    title: "Remote-work cafes in Seoul",
    author: "Aarav Mehta",
    avatar: "AM",
    image:
      "https://images.unsplash.com/photo-1538485399081-7191377e8241?auto=format&fit=crop&w=1200&q=80",
    cities: ["Seoul", "Busan"],
    saves: 936,
    days: 7,
  },
  {
    id: "community-3",
    title: "Nordic winter route",
    author: "Maya Chen",
    avatar: "MC",
    image:
      "https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?auto=format&fit=crop&w=1200&q=80",
    cities: ["Oslo", "Bergen", "Reykjavik"],
    saves: 1275,
    days: 12,
  },
];

export const budgetCategories = [
  { label: "Transport", value: 1120, color: "bg-sky-400" },
  { label: "Stay", value: 1850, color: "bg-amber-400" },
  { label: "Meals", value: 720, color: "bg-emerald-400" },
  { label: "Activities", value: 940, color: "bg-sky-400" },
  { label: "Misc", value: 310, color: "bg-rose-400" },
];

export const checklistGroups = [
  {
    category: "Documents",
    items: [
      { name: "Passport and visa printout", packed: true },
      { name: "Travel insurance certificate", packed: true },
      { name: "Hotel confirmations", packed: false },
    ],
  },
  {
    category: "Clothing",
    items: [
      { name: "Light rain shell", packed: true },
      { name: "Evening outfit", packed: false },
      { name: "Walking shoes", packed: false },
    ],
  },
  {
    category: "Electronics",
    items: [
      { name: "Universal adapter", packed: true },
      { name: "Power bank", packed: false },
      { name: "Camera batteries", packed: false },
    ],
  },
];

export const notes = [
  {
    title: "Lisbon arrival buffer",
    stop: "Lisbon",
    updated: "2 hours ago",
    body: "Keep the first evening light. Add dinner reservation near Chiado after check-in.",
  },
  {
    title: "Museum pass comparison",
    stop: "Paris",
    updated: "Yesterday",
    body: "City pass is worth it only if Louvre, Orsay, and Sainte-Chapelle stay on the plan.",
  },
  {
    title: "Barcelona food list",
    stop: "Barcelona",
    updated: "May 7",
    body: "Prioritize lunch reservations; evenings can stay flexible for tapas walks.",
  },
];

export function getTrip(id: string): Trip {
  return trips.find((trip) => trip.id === id) ?? trips[0];
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
