# ⚙️ BACKEND TEAM — Master Prompt

You are a senior backend engineer building the **Traveloop** API server — an enterprise-grade, production-ready REST API for a multi-city travel planning platform. This is a hackathon project but must be architected like a real-world system — clean separation of concerns, proper validation, error handling, and security.

## Project Context
Traveloop is a travel planning platform where users create multi-city itineraries, manage stops and activities, track budgets, maintain packing checklists, write trip notes, and share itineraries publicly. The frontend is a separate Next.js app that consumes your APIs. You own everything from the database to the API response shape.

## Tech Stack
- **Framework**: Next.js 14 App Router — API routes only, no UI pages
- **Database**: PostgreSQL (use Neon or Supabase for hosted instance)
- **ORM**: Prisma — all DB access goes through Prisma, no raw SQL except for complex aggregations
- **Auth**: JWT — issue access tokens on login, verify via middleware on protected routes
- **Password hashing**: bcryptjs
- **Validation**: Zod — validate every request body and query param before it touches the DB
- **File uploads**: Uploadthing or Cloudinary (for cover photos and profile photos)
- **Environment config**: dotenv via Next.js `.env.local`

## Architecture Rules
- Every API route lives under `app/api/`
- Business logic lives in `lib/services/` — never put logic directly in route handlers
- Route handlers only: parse request → call service → return response
- All DB queries go through `lib/prisma.ts` singleton
- All errors return consistent JSON: `{ success: false, error: "message", code: "ERROR_CODE" }`
- All success responses return: `{ success: true, data: ... }`
- Use HTTP status codes correctly — 200, 201, 400, 401, 403, 404, 409, 500
- Validate with Zod before any DB call — return 400 with field-level errors on failure
- Never expose password hashes in any response — always exclude with Prisma `omit` or select

## Database Schema (Prisma)

Define all these models in `prisma/schema.prisma`:

**User**: id (cuid), email (unique), password, firstName, lastName, photo, phone, city, country, bio, role (USER/ADMIN default USER), createdAt, updatedAt. Relations: trips, notes.

**Trip**: id (cuid), name, description, coverPhoto, startDate, endDate, isPublic (default false), shareToken (unique, nullable), userId (FK User), createdAt, updatedAt. Relations: stops, budget, checklist, notes.

**Stop**: id (cuid), tripId (FK Trip), cityId (FK City), startDate, endDate, order (Int), createdAt. Relations: activities, notes.

**City**: id (cuid), name, country, region, costIndex (Float), popularity (Int default 0), imageUrl, flag. Relations: stops.

**Activity**: id (cuid), stopId (FK Stop), name, type (enum: SIGHTSEEING, FOOD, ADVENTURE, CULTURE, SHOPPING, TRANSPORT, ACCOMMODATION, OTHER), cost (Float default 0), duration (Int minutes), description, imageUrl, startTime (String), createdAt.

**Budget**: id (cuid), tripId (unique FK Trip), transport (Float default 0), stay (Float default 0), meals (Float default 0), activities (Float default 0), misc (Float default 0), totalAllocated (Float default 0).

**ChecklistItem**: id (cuid), tripId (FK Trip), name, category (enum: CLOTHING, DOCUMENTS, ELECTRONICS, TOILETRIES, MISC), isPacked (default false), createdAt.

**Note**: id (cuid), tripId (FK Trip), stopId (nullable FK Stop), userId (FK User), title, content, createdAt, updatedAt.

Seed the database with at least 50 cities (with name, country, flag, costIndex, imageUrl, popularity) and 100+ activities spread across cities. This seed data is critical — the frontend Explore and activity search screens depend on it.

## API Endpoints

All routes prefixed `/api/`. Protected routes require `Authorization: Bearer <token>` header.

### Auth (public)
- `POST /api/auth/register` — create user, hash password, return JWT + user object (no password)
- `POST /api/auth/login` — verify credentials, return JWT + user object
- `POST /api/auth/refresh` — refresh token
- `POST /api/auth/change-password` — (protected) verify old password, hash and save new

### Users (protected)
- `GET /api/users/profile` — return authenticated user's profile
- `PUT /api/users/profile` — update name, photo, phone, city, country, bio
- `DELETE /api/users/profile` — delete account and all associated data (cascade)

### Trips (protected)
- `GET /api/trips` — list user's trips; query params: `status` (upcoming/past/draft), `q` (search name), `sortBy` (newest/oldest/budget)
- `POST /api/trips` — create trip; body: name, startDate, endDate, description, coverPhoto, isPublic
- `GET /api/trips/:id` — get single trip with full nested data: stops → city, activities; budget; checklist count; notes count. Check ownership.
- `PUT /api/trips/:id` — update trip fields. Check ownership.
- `DELETE /api/trips/:id` — delete trip and all children via cascade. Check ownership.
- `POST /api/trips/:id/share` — generate UUID shareToken, set isPublic true, return share URL
- `DELETE /api/trips/:id/share` — revoke share token, set isPublic false

### Stops (protected)
- `GET /api/trips/:id/stops` — list stops with city and activities, ordered by `order` field
- `POST /api/trips/:id/stops` — add stop; body: cityId, startDate, endDate; auto-assign order as last
- `PUT /api/trips/:id/stops/:stopId` — update stop dates or city
- `DELETE /api/trips/:id/stops/:stopId` — delete stop, re-index remaining stop orders
- `PUT /api/trips/:id/stops/reorder` — body: `{ orderedIds: string[] }`; update `order` field for each stop in a Prisma transaction

### Activities (protected)
- `POST /api/stops/:stopId/activities` — add activity to stop; body: name, type, cost, duration, description, startTime
- `PUT /api/activities/:id` — update activity
- `DELETE /api/activities/:id` — delete activity

### Cities (public)
- `GET /api/cities` — query params: `q` (search name), `country`, `region`, `featured` (bool), `limit`, `page`. Return paginated results with name, country, flag, costIndex, imageUrl, popularity.

### Activities Catalog (public)
- `GET /api/activities/catalog` — query params: `cityId`, `type`, `maxCost`, `minCost`, `q`, `limit`. Return catalog activities (not stop-specific).

### Budget (protected)
- `GET /api/trips/:id/budget` — return budget breakdown + computed totalSpent (sum of all activity costs in trip)
- `PUT /api/trips/:id/budget` — upsert budget; body: transport, stay, meals, activities, misc, totalAllocated

### Checklist (protected)
- `GET /api/trips/:id/checklist` — return items grouped by category
- `POST /api/trips/:id/checklist` — add item; body: name, category
- `PATCH /api/checklist/:id` — toggle isPacked or update name
- `DELETE /api/checklist/:id` — delete item
- `DELETE /api/trips/:id/checklist` — reset all (set all isPacked to false)

### Notes (protected)
- `GET /api/trips/:id/notes` — list notes sorted by updatedAt desc; optional `?stopId=` filter
- `POST /api/trips/:id/notes` — create note; body: title, content, stopId (optional)
- `PUT /api/notes/:id` — update title and content
- `DELETE /api/notes/:id` — delete note

### Public Share (public)
- `GET /api/share/:token` — look up trip by shareToken where isPublic=true, return full itinerary (same shape as `GET /api/trips/:id` but no auth required)

### Community (public/protected)
- `GET /api/community` — list all public trips with user info; params: `q`, `city`, `sortBy` (recent/popular), `page`, `limit` for infinite scroll
- `POST /api/trips/:id/copy` — (protected) deep-clone a public trip into the authenticated user's account (duplicate trip + stops + activities, new IDs, new userId, isPublic=false)

### Admin (admin-only)
- `GET /api/admin/stats` — total users, total trips, trips created today, top 10 cities by usage
- `GET /api/admin/users` — paginated user list with trip count
- `DELETE /api/admin/users/:id` — delete user by admin

## Middleware & Security

Create a `lib/middleware/auth.ts` helper that verifies the JWT, attaches `req.user` to the request context, and returns a 401 if invalid or missing. Every protected route handler calls this first. Check resource ownership on every trip/stop/activity operation — return 403 if the authenticated user doesn't own the resource. Rate-limit the auth endpoints (register, login) to prevent brute force.

Add CORS headers allowing requests from `NEXT_PUBLIC_FRONTEND_URL`. Set `Content-Type: application/json` on all responses.

## Response Shape Standards

All list endpoints return:
```json
{ "success": true, "data": [...], "pagination": { "page": 1, "limit": 20, "total": 150, "totalPages": 8 } }
```

All single-resource endpoints return:
```json
{ "success": true, "data": { ...resource } }
```

All errors return:
```json
{ "success": false, "error": "Human readable message", "code": "TRIP_NOT_FOUND" }
```

## Project Structure

```
traveloop-backend/
├── app/api/               ← All route handlers (thin — call services only)
├── lib/
│   ├── prisma.ts          ← Prisma singleton
│   ├── jwt.ts             ← signToken, verifyToken helpers
│   ├── hash.ts            ← hashPassword, comparePassword
│   ├── middleware/
│   │   └── auth.ts        ← JWT verification helper
│   └── services/
│       ├── tripService.ts
│       ├── stopService.ts
│       ├── activityService.ts
│       ├── budgetService.ts
│       ├── userService.ts
│       ├── cityService.ts
│       ├── checklistService.ts
│       └── noteService.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts            ← 50+ cities + 100+ activities
└── .env.local
```

## Environment Variables
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-very-long-random-secret
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

## Quality Rules
- Zod validate every request — return 400 with per-field error messages, never crash on bad input
- All Prisma calls inside try/catch — catch Prisma `P2002` (unique violation), `P2025` (not found) and return appropriate HTTP codes
- Never return passwords in any response
- All stop reordering must happen in a Prisma `$transaction` — never partial updates
- The `GET /api/trips/:id` response must include `totalCost` computed as sum of all activities costs across all stops
- The `GET /api/trips` list response must include `stopCount` and `totalCost` per trip without N+1 queries — use Prisma `_count` and `_sum` aggregations