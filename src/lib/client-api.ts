export type ApiEnvelope<T> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: Pagination;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photo?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  role: "USER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
};

export type AuthPayload = {
  token: string;
  user: UserProfile;
};

export type CityDto = {
  id: string;
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
  imageUrl?: string | null;
  flag?: string | null;
};

export type ActivityDto = {
  id: string;
  stopId?: string;
  cityId?: string;
  name: string;
  type: string;
  cost: number;
  duration: number;
  description?: string | null;
  imageUrl?: string | null;
  startTime?: string | null;
  city?: Pick<CityDto, "id" | "name" | "country" | "flag" | "costIndex" | "imageUrl">;
};

export type StopDto = {
  id: string;
  tripId: string;
  cityId: string;
  startDate: string;
  endDate: string;
  order: number;
  createdAt?: string;
  city: CityDto;
  activities: ActivityDto[];
};

export type BudgetDto = {
  id?: string;
  tripId?: string;
  transport: number;
  stay: number;
  meals: number;
  activities: number;
  misc: number;
  totalAllocated: number;
  totalSpent?: number;
};

export type TripDto = {
  id: string;
  name: string;
  description?: string | null;
  coverPhoto?: string | null;
  startDate: string;
  endDate: string;
  isPublic: boolean;
  shareToken?: string | null;
  userId: string;
  travelers: string[];
  createdAt?: string;
  updatedAt?: string;
  budget?: BudgetDto | null;
  stops?: StopDto[];
  checklist?: ChecklistItemDto[];
  stopCount?: number;
  totalCost?: number;
  _count?: {
    checklist?: number;
    notes?: number;
    stops?: number;
  };
  user?: Pick<UserProfile, "id" | "firstName" | "lastName" | "photo" | "city" | "country">;
};

export type ChecklistItemDto = {
  id: string;
  tripId: string;
  name: string;
  category: "CLOTHING" | "DOCUMENTS" | "ELECTRONICS" | "TOILETRIES" | "MISC";
  isPacked: boolean;
  createdAt?: string;
};

export type NoteDto = {
  id: string;
  tripId: string;
  stopId?: string | null;
  day?: number | null;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  stop?: {
    id: string;
    city?: CityDto;
  } | null;
};

export type InvoiceDto = {
  id: string;
  tripId: string;
  invoiceNumber: string;
  generatedDate: string;
  status: "pending" | "paid";
  taxRate: number;
  discount: number;
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  activities: ActivityDto[];
  trip: {
    name: string;
    startDate: string;
    endDate: string;
    travelers: string[];
    owner: string;
  };
  budget: BudgetDto | null;
};

export type ListResponse<T> = {
  data: T[];
  pagination: Pagination;
};

const TOKEN_KEY = "traveloop_token";
const USER_KEY = "traveloop_user";

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(USER_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UserProfile;
  } catch {
    return null;
  }
}

export function storeAuth(payload: AuthPayload) {
  window.localStorage.setItem(TOKEN_KEY, payload.token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
}

export function clearAuth() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

export async function apiFetch<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload?.success) {
    const message = payload?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload.data as T;
}

export async function apiList<T>(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const token = getAuthToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...init,
    headers,
  });
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T[]> | null;

  if (!response.ok || !payload?.success || !payload.pagination) {
    const message = payload?.error ?? `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return {
    data: payload.data ?? [],
    pagination: payload.pagination,
  } satisfies ListResponse<T>;
}

export function formatDateRange(startDate: string, endDate: string) {
  const formatter = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function actualImageUrl(value: string | null | undefined) {
  if (!value || value.includes("source.unsplash.com")) {
    return null;
  }

  return value;
}

export function tripCover(trip: Pick<TripDto, "coverPhoto" | "stops">) {
  return actualImageUrl(trip.coverPhoto ?? trip.stops?.[0]?.city.imageUrl);
}

export function cityImage(city: Pick<CityDto, "imageUrl">) {
  return actualImageUrl(city.imageUrl);
}
