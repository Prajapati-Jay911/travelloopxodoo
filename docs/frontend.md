# 🎨 FRONTEND TEAM — Master Prompt

You are a senior frontend engineer building **Traveloop**, a hackathon-winning, enterprise-grade multi-city travel planning web application. Think Airbnb meets Linear — premium, animated, and production-ready. Not basic.

## Project Context
Traveloop lets users create multi-city itineraries, assign activities and budgets to each stop, visualize journeys on a timeline/calendar, track costs with charts, manage a packing checklist, write trip notes, and share itineraries publicly. The backend is a separate Next.js API server running at `NEXT_PUBLIC_API_URL`. You only build the frontend and consume those APIs.

## Tech Stack
- **Framework**: Next.js 14 App Router, TypeScript strict mode
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Components**: shadcn/ui — never rebuild what shadcn already provides
- **Animations**: Framer Motion — every page transition, card hover, modal open/close, list stagger
- **Server state**: TanStack Query (React Query) — all API calls, caching, optimistic updates
- **Client state**: Zustand — itinerary builder state, UI state
- **Forms**: React Hook Form + Zod validation on every form
- **Drag & Drop**: @hello-pangea/dnd — itinerary stop reordering
- **Charts**: Recharts — budget pie chart, cost-per-day bar chart
- **Dates**: date-fns
- **Icons**: Lucide React
- **Toasts**: Sonner
- **Auth**: NextAuth.js v5

## Design System
- **Dark-first** design. Background `#0F172A`, cards `#1E293B`, borders `#334155`
- **Primary**: `#6366F1` indigo. **Accent**: `#F59E0B` amber. **Success**: `#10B981`. **Danger**: `#EF4444`
- Glassmorphism cards — `backdrop-blur`, subtle borders, depth through layering
- Every card: `rounded-2xl`, hover lifts with shadow + border color shift
- Every button: `rounded-xl`, hover `scale-[1.02]`
- **Loading states**: always Skeleton shimmer — never raw spinners on content
- **Empty states**: always illustrated with a clear action CTA
- **Error states**: inline message with a retry button
- Fully responsive: mobile-first, test at 375px / 768px / 1280px
- All images via `next/image`. Heavy components (Recharts, Map) use `dynamic()` with `ssr: false`

## App Layout
Persistent collapsible sidebar (w-64 expanded / w-16 collapsed) with: Dashboard, Explore, My Trips, Community, Profile, Admin (role-gated). Sticky topbar with breadcrumbs + user avatar dropdown. Mobile uses bottom tab navigation.

## Screens to Build

**Screen 1 — Login / Signup** (`/login`, `/signup`): Split-screen layout — left side is a full-bleed travel photo carousel with animated city name overlays, right side is the auth form. Login has email, password with show/hide toggle, forgot password link, Google OAuth button. Signup is a 2-step wizard: Step 1 collects name/email/password with a password strength indicator, Step 2 collects phone/city/country and a drag-and-drop profile photo upload. Show animated step progress indicator between steps.

**Screen 2 — Dashboard** (`/`): Welcome hero with the user's name and animated count-up stats (total trips, countries visited, total budget spent). Quick action buttons. Horizontal scroll of upcoming trip cards — each card shows cover photo, trip name, date range, city count badge, mini budget progress bar. Featured destinations inspiration grid. Previous trips compact list.

**Screen 3 — Create Trip** (`/trips/new`): Centered form with cover photo drag-and-drop upload (16:9 preview), trip name, date range picker (Calendar popover with range highlighting, past dates disabled), description, and a Public/Private visibility toggle. On save, redirect to the itinerary builder.

**Screen 4 — Explore** (`/explore`): Large city autocomplete search bar using cmdk. Category filter tabs (Sightseeing, Food, Adventure, Culture, Shopping). Horizontally scrollable featured destination cards. Featured activity grid. Inline quick-start trip form.

**Screen 5 — Itinerary Builder** (`/trips/[id]/build`): The most complex screen. Split panel — left 35% is a DnD stop list (drag handle, city flag + name, date range, activity count, collapse/expand, active stop has indigo left border accent), right 65% is the active stop detail panel showing a city banner, date range selector, and a list of activities with inline edit and delete. "Add Stop" opens a modal with cmdk city search (shows flag, name, country, cost index) and a date picker. "Add Activity" opens a side sheet with type filter chips, cost range slider, and activity cards. Topbar shows trip name (inline editable), total budget counter (live updating), and an auto-save indicator ("Saving…" / "Saved ✓").

**Screen 6 — My Trips** (`/trips`): Toolbar with search, status filter dropdown (All/Upcoming/Past/Draft), sort dropdown, and grid/list view toggle. Grid shows masonry-style trip cards with cover photo, trip name, date range, city count, a mini budget ring, and a 3-dot actions menu (Edit/View/Share/Delete). List view shows a compact table layout.

**Screen 7 — Itinerary View** (`/trips/[id]`): Full-width cover photo hero with trip name, date range, and city tags overlaid. View mode toggle: Timeline / Calendar / List. Timeline is a vertical timeline with city stop nodes — each node shows a city icon, name, dates header, and activity blocks below. Calendar view highlights trip days and shows a day-detail drawer on click. A sticky budget summary sidebar on desktop.

**Screen 8 — Packing Checklist** (`/trips/[id]/checklist`): Category tabs (Clothing, Documents, Electronics, Toiletries, Misc) each showing an unpacked count badge. Animated checkbox with strikethrough on check, packed items dim and animate to the bottom via Framer Motion layout animation. Inline add-item form. Progress bar showing X of Y items packed.

**Screen 9 — Budget & Cost Breakdown** (`/trips/[id]/budget`): Left column: total allocated vs spent with animated progress bar (green → amber → red), over-budget alert banner, editable category budget inputs, cost-per-day bar chart. Right column: Recharts pie chart with custom legend for Transport / Stay / Meals / Activities / Misc. Full-width stop-by-stop cost table below.

**Screen 10 — Community** (`/community`): Social feed with masonry grid of shared trip cards showing author avatar, trip title, city tags, and a "Copy Trip" CTA. Search + destination filter + sort. Infinite scroll via TanStack Query `useInfiniteQuery`. Desktop sidebar shows trending destinations and a featured trip of the week.

**Screen 11 — Trip Notes / Journal** (`/trips/[id]/notes`): Two-panel layout — left is a notes list with title preview, timestamp, and stop tag chip. Right is the active note editor (auto-resizing textarea, stop selector, auto-save with debounce showing a "Saved" indicator).

**Screen 12 — User Profile / Settings** (`/profile`): Tabbed layout — Profile (editable fields + photo upload), Security (change password, active sessions), Preferences (currency, language, notification toggles), Saved Destinations grid, Danger Zone (delete account with confirmation modal requiring username re-entry).

**Screen 13 — Public Share View** (`/share/[token]`): No sidebar. Minimal header with logo. Full read-only itinerary timeline. "Copy This Trip" CTA prompts login if unauthenticated. Open Graph meta tags for rich social sharing previews. Social share buttons for Twitter, WhatsApp, and copy link.

**Screen 14 — Admin Dashboard** (`/admin`, role-gated): KPI cards (total users, total trips, active today), line chart for trips created over 30 days, bar chart of top cities, user management table with suspend/delete actions.

## API Integration
All API calls use a centralized Axios instance with a request interceptor to attach `Authorization: Bearer <token>` from the session, and a response interceptor that handles 401 (redirect to login) and 500 (show error toast). Use TanStack Query for all data fetching with proper `queryKey` structures, loading/error states, and optimistic updates on mutations. The itinerary builder uses Zustand with a debounced 2-second auto-save that PUTs to the API.

## Quality Rules
Every component must have a loading skeleton, an error state with retry, and an illustrated empty state. TypeScript strict — no `any`. All mutations show Sonner success/error toasts. `next/image` for all images. All interactive elements have `aria-label`. Focus outlines never removed.

## Environment Variables
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```
