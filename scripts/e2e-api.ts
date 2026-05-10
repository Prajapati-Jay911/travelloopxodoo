import "dotenv/config";
import { spawn, type ChildProcess } from "node:child_process";
import pg from "pg";

type JsonObject = Record<string, unknown>;

type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
  token?: string;
  body?: JsonObject;
  expectedStatus?: number;
  expectSuccess?: boolean;
};

type TestContext = {
  baseUrl: string;
  runId: string;
  userToken: string;
  userId: string;
  userEmail: string;
  adminToken?: string;
  tripId?: string;
  copiedTripId?: string;
};

type City = {
  id: string;
  name: string;
  country: string;
};

type Activity = {
  id: string;
  name: string;
  type: string;
  cost: number;
  duration: number;
};

type Trip = {
  id: string;
  name: string;
  shareToken?: string | null;
  stops?: Stop[];
};

type Stop = {
  id: string;
  cityId: string;
};

type ChecklistItem = {
  id: string;
  isPacked: boolean;
};

type Note = {
  id: string;
};

const baseUrl = (
  process.env.E2E_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:3000/api"
).replace(/\/$/, "");

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@traveloop.dev";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "Admin12345";

const results: { name: string; durationMs: number; skipped?: boolean }[] = [];

let managedServer: ChildProcess | undefined;
let managedServerOutput = "";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function request<T = unknown>(
  path: string,
  {
    method = "GET",
    token,
    body,
    expectedStatus,
    expectSuccess = true,
  }: RequestOptions = {},
): Promise<ApiEnvelope<T>> {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (expectedStatus !== undefined && response.status !== expectedStatus) {
    throw new Error(
      `${method} ${path} expected ${expectedStatus}, received ${response.status}: ${await response.text()}`,
    );
  }

  if (method === "OPTIONS") {
    return { success: response.ok } as ApiEnvelope<T>;
  }

  const payload = (await response.json()) as ApiEnvelope<T>;

  if (expectSuccess && !payload.success) {
    throw new Error(
      `${method} ${path} returned API error ${payload.code ?? "UNKNOWN"}: ${payload.error ?? "No message"}`,
    );
  }

  if (!expectSuccess && payload.success) {
    throw new Error(`${method} ${path} unexpectedly succeeded`);
  }

  return payload;
}

async function tryHealthCheck() {
  try {
    const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(1000) });
    return response.ok;
  } catch {
    return false;
  }
}

function canStartLocalServer() {
  const url = new URL(baseUrl);
  return ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

async function waitForHealth(timeoutMs: number) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    if (await tryHealthCheck()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 750));
  }

  throw new Error(`Timed out waiting for ${baseUrl}/health`);
}

async function ensureServer() {
  if (await tryHealthCheck()) {
    return;
  }

  if (process.env.E2E_START_SERVER === "false" || !canStartLocalServer()) {
    throw new Error(
      `No API server is reachable at ${baseUrl}. Start the app first or set E2E_API_BASE_URL.`,
    );
  }

  const url = new URL(baseUrl);
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  const hostname = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;

  console.log(`Starting Next dev server on ${hostname}:${port}...`);

  managedServer = spawn(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", "dev", "--", "--hostname", hostname, "--port", port],
    {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  managedServer.stdout?.on("data", (chunk: Buffer) => {
    managedServerOutput += chunk.toString();
  });
  managedServer.stderr?.on("data", (chunk: Buffer) => {
    managedServerOutput += chunk.toString();
  });

  managedServer.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`Managed Next dev server exited with code ${code}.`);
      if (managedServerOutput.trim()) {
        console.error(managedServerOutput.trim());
      }
    }
  });

  await waitForHealth(45_000);
}

async function ensureDatabaseReachable() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    if (process.env.DATABSE_URL) {
      throw new Error("DATABASE_URL is missing. Rename DATABSE_URL to DATABASE_URL in .env.");
    }

    throw new Error("DATABASE_URL is required for e2e tests.");
  }

  const parsed = new URL(databaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, "") || "(default)";
  const pool = new pg.Pool({ connectionString: databaseUrl });

  try {
    await pool.query("select 1");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (message.includes("does not exist")) {
      throw new Error(
        `DATABASE_URL points to database "${databaseName}", but Postgres says it does not exist. Create it or update DATABASE_URL, then run npm run prisma:migrate && npm run prisma:seed.`,
      );
    }

    throw new Error(`Could not connect to database "${databaseName}": ${message}`);
  } finally {
    await pool.end().catch(() => undefined);
  }
}

async function test(name: string, fn: () => Promise<void>, skip = false) {
  const startedAt = Date.now();

  if (skip) {
    results.push({ name, durationMs: 0, skipped: true });
    console.log(`- SKIP ${name}`);
    return;
  }

  try {
    await fn();
    const durationMs = Date.now() - startedAt;
    results.push({ name, durationMs });
    console.log(`- PASS ${name} (${durationMs}ms)`);
  } catch (error) {
    console.error(`- FAIL ${name}`);
    throw error;
  }
}

function uniqueEmail(prefix: string, runId: string) {
  return `${prefix}.${runId}@traveloop.test`;
}

async function registerUser(email: string, password: string, firstName = "E2E") {
  const response = await request<{ token: string; user: { id: string; email: string } }>(
    "/auth/register",
    {
      method: "POST",
      expectedStatus: 201,
      body: {
        email,
        password,
        firstName,
        lastName: "Traveler",
        phone: "+15550000000",
        city: "Bengaluru",
        country: "India",
        bio: "Disposable API e2e user",
      },
    },
  );

  assert(response.data?.token, "Register did not return token");
  assert(response.data.user.id, "Register did not return user id");
  return response.data;
}

async function loginUser(email: string, password: string) {
  const response = await request<{ token: string; user: { id: string; email: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: { email, password },
    },
  );

  assert(response.data?.token, "Login did not return token");
  return response.data;
}

async function cleanup(ctx: TestContext) {
  if (ctx.copiedTripId) {
    await request(`/trips/${ctx.copiedTripId}`, {
      method: "DELETE",
      token: ctx.userToken,
      expectSuccess: false,
    }).catch(() => undefined);
  }

  if (ctx.tripId) {
    await request(`/trips/${ctx.tripId}`, {
      method: "DELETE",
      token: ctx.userToken,
      expectSuccess: false,
    }).catch(() => undefined);
  }

  await request("/users/profile", {
    method: "DELETE",
    token: ctx.userToken,
  }).catch(() => undefined);
}

async function main() {
  const runId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const password = "E2ePass12345";
  const ctx: TestContext = {
    baseUrl,
    runId,
    userToken: "",
    userId: "",
    userEmail: uniqueEmail("primary", runId),
  };

  console.log(`Traveloop API e2e: ${baseUrl}`);

  try {
    await ensureDatabaseReachable();
    await ensureServer();

    await test("health and CORS preflight", async () => {
      const health = await request<{ service: string; status: string }>("/health");
      assert(health.data?.status === "ok", "Health check did not return ok");
      await request("/health", { method: "OPTIONS", expectedStatus: 204 });
    });

    await test("public cities and catalog are seeded", async () => {
      const cities = await request<City[]>("/cities?featured=true&limit=5&page=1");
      assert(cities.pagination, "Cities endpoint did not include pagination");
      assert((cities.data?.length ?? 0) >= 2, "Seed at least 2 cities before running e2e tests");

      const catalog = await request<Activity[]>("/activities/catalog?limit=5");
      assert(catalog.pagination, "Catalog endpoint did not include pagination");
      assert((catalog.data?.length ?? 0) >= 1, "Seed catalog activities before running e2e tests");
    });

    await test("auth register, login, refresh, protected rejection", async () => {
      await request("/users/profile", {
        expectedStatus: 401,
        expectSuccess: false,
      });

      const registered = await registerUser(ctx.userEmail, password);
      ctx.userToken = registered.token;
      ctx.userId = registered.user.id;

      const loggedIn = await loginUser(ctx.userEmail, password);
      ctx.userToken = loggedIn.token;

      const refreshed = await request<{ token: string }>("/auth/refresh", {
        method: "POST",
        token: ctx.userToken,
      });
      assert(refreshed.data?.token, "Refresh did not return token");
      ctx.userToken = refreshed.data.token;
    });

    await test("profile get and update", async () => {
      const profile = await request<{ id: string; firstName: string }>("/users/profile", {
        token: ctx.userToken,
      });
      assert(profile.data?.id === ctx.userId, "Profile user mismatch");

      const updated = await request<{ firstName: string }>("/users/profile", {
        method: "PUT",
        token: ctx.userToken,
        body: { firstName: "Validated", bio: "Updated through e2e" },
      });
      assert(updated.data?.firstName === "Validated", "Profile update did not persist");
    });

    let cityA: City;
    let cityB: City;
    let stopA: Stop;
    let stopB: Stop;
    let activityId: string;
    let checklistItemId: string;
    let noteId: string;

    await test("trip create, list, get, update", async () => {
      const cities = await request<City[]>("/cities?limit=2&page=1");
      assert(cities.data?.[0] && cities.data?.[1], "Need at least two seeded cities");
      [cityA, cityB] = cities.data;

      const trip = await request<Trip>("/trips", {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: {
          name: `E2E Grand Tour ${ctx.runId}`,
          description: "Created by endpoint coverage test",
          startDate: "2030-01-10",
          endDate: "2030-01-20",
          isPublic: false,
        },
      });
      assert(trip.data?.id, "Trip create did not return id");
      ctx.tripId = trip.data.id;

      const list = await request<Trip[]>("/trips?status=draft&q=E2E&sortBy=newest&page=1&limit=10", {
        token: ctx.userToken,
      });
      assert(list.data?.some((item) => item.id === ctx.tripId), "Created trip missing from trip list");

      const fetched = await request<Trip>(`/trips/${ctx.tripId}`, { token: ctx.userToken });
      assert(fetched.data?.id === ctx.tripId, "Trip get returned wrong trip");

      const updated = await request<Trip>(`/trips/${ctx.tripId}`, {
        method: "PUT",
        token: ctx.userToken,
        body: { description: "Updated description" },
      });
      assert(updated.data?.id === ctx.tripId, "Trip update returned wrong trip");
    });

    await test("stops create, list, update, reorder", async () => {
      const first = await request<Stop>(`/trips/${ctx.tripId}/stops`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: {
          cityId: cityA.id,
          startDate: "2030-01-10",
          endDate: "2030-01-14",
        },
      });
      assert(first.data?.id, "First stop create failed");
      stopA = first.data;

      const second = await request<Stop>(`/trips/${ctx.tripId}/stops`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: {
          cityId: cityB.id,
          startDate: "2030-01-15",
          endDate: "2030-01-20",
        },
      });
      assert(second.data?.id, "Second stop create failed");
      stopB = second.data;

      const updated = await request<Stop>(`/trips/${ctx.tripId}/stops/${stopA.id}`, {
        method: "PUT",
        token: ctx.userToken,
        body: { endDate: "2030-01-13" },
      });
      assert(updated.data?.id === stopA.id, "Stop update returned wrong stop");

      const reordered = await request<Stop[]>(`/trips/${ctx.tripId}/stops/reorder`, {
        method: "PUT",
        token: ctx.userToken,
        body: { orderedIds: [stopB.id, stopA.id] },
      });
      assert(reordered.data?.[0]?.id === stopB.id, "Stop reorder did not persist");

      const listed = await request<Stop[]>(`/trips/${ctx.tripId}/stops`, {
        token: ctx.userToken,
      });
      assert(listed.data?.length === 2, "Stop list did not return both stops");
    });

    await test("activity create, catalog query, update, delete", async () => {
      const catalog = await request<Activity[]>(`/activities/catalog?cityId=${cityA.id}&limit=1`);
      assert(catalog.data?.[0], "Catalog query by city returned no activities");
      const template = catalog.data[0];

      const activity = await request<Activity>(`/stops/${stopA.id}/activities`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: {
          name: template.name,
          type: template.type,
          cost: 42,
          duration: Math.max(30, template.duration),
          description: "Added from e2e catalog template",
          startTime: "09:30",
        },
      });
      assert(activity.data?.id, "Activity create did not return id");
      activityId = activity.data.id;

      const updated = await request<Activity>(`/activities/${activityId}`, {
        method: "PUT",
        token: ctx.userToken,
        body: { cost: 55, startTime: "10:00" },
      });
      assert(updated.data?.cost === 55, "Activity update did not persist");

      await request(`/activities/${activityId}`, {
        method: "DELETE",
        token: ctx.userToken,
      });

      const recreated = await request<Activity>(`/stops/${stopA.id}/activities`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: {
          name: "Budgeted Museum Visit",
          type: "CULTURE",
          cost: 60,
          duration: 120,
          description: "Recreated so budget totals have spend",
          startTime: "11:00",
        },
      });
      assert(recreated.data?.id, "Activity recreate failed");
      activityId = recreated.data.id;
    });

    await test("budget get and upsert", async () => {
      const budget = await request<{ totalSpent: number }>(`/trips/${ctx.tripId}/budget`, {
        token: ctx.userToken,
      });
      assert(budget.data?.totalSpent === 60, "Budget totalSpent did not include activity cost");

      const updated = await request<{ totalAllocated: number; totalSpent: number }>(
        `/trips/${ctx.tripId}/budget`,
        {
          method: "PUT",
          token: ctx.userToken,
          body: {
            transport: 100,
            stay: 400,
            meals: 180,
            activities: 240,
            misc: 80,
            totalAllocated: 1000,
          },
        },
      );
      assert(updated.data?.totalAllocated === 1000, "Budget upsert did not persist totalAllocated");
      assert(updated.data.totalSpent === 60, "Budget upsert did not return computed totalSpent");
    });

    await test("checklist create, list, patch, reset, delete", async () => {
      const item = await request<ChecklistItem>(`/trips/${ctx.tripId}/checklist`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: { name: "Passport", category: "DOCUMENTS" },
      });
      assert(item.data?.id, "Checklist create failed");
      checklistItemId = item.data.id;

      const grouped = await request<Record<string, ChecklistItem[]>>(`/trips/${ctx.tripId}/checklist`, {
        token: ctx.userToken,
      });
      assert(grouped.data?.DOCUMENTS?.some((entry) => entry.id === checklistItemId), "Checklist list missing item");

      const patched = await request<ChecklistItem>(`/checklist/${checklistItemId}`, {
        method: "PATCH",
        token: ctx.userToken,
        body: { isPacked: true, name: "Passport and visa" },
      });
      assert(patched.data?.isPacked === true, "Checklist patch did not toggle item");

      const reset = await request<Record<string, ChecklistItem[]>>(`/trips/${ctx.tripId}/checklist`, {
        method: "DELETE",
        token: ctx.userToken,
      });
      assert(
        reset.data?.DOCUMENTS?.find((entry) => entry.id === checklistItemId)?.isPacked === false,
        "Checklist reset did not unpack item",
      );

      await request(`/checklist/${checklistItemId}`, {
        method: "DELETE",
        token: ctx.userToken,
      });
    });

    await test("notes create, list with filter, update, delete", async () => {
      const note = await request<Note>(`/trips/${ctx.tripId}/notes`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
        body: {
          title: "Arrival note",
          content: "Check train platform and local SIM shop.",
          stopId: stopA.id,
        },
      });
      assert(note.data?.id, "Note create failed");
      noteId = note.data.id;

      const listed = await request<Note[]>(`/trips/${ctx.tripId}/notes?stopId=${stopA.id}`, {
        token: ctx.userToken,
      });
      assert(listed.data?.some((entry) => entry.id === noteId), "Note list with filter missing note");

      const updated = await request<Note>(`/notes/${noteId}`, {
        method: "PUT",
        token: ctx.userToken,
        body: { content: "Updated note body" },
      });
      assert(updated.data?.id === noteId, "Note update returned wrong note");

      await request(`/notes/${noteId}`, {
        method: "DELETE",
        token: ctx.userToken,
      });
    });

    await test("share, public share, community, copy, revoke", async () => {
      const shared = await request<{ shareToken: string; shareUrl: string }>(
        `/trips/${ctx.tripId}/share`,
        {
          method: "POST",
          token: ctx.userToken,
        },
      );
      assert(shared.data?.shareToken, "Share did not return token");

      const publicTrip = await request<Trip>(`/share/${shared.data.shareToken}`);
      assert(publicTrip.data?.id === ctx.tripId, "Public share returned wrong trip");

      const community = await request<Trip[]>(`/community?q=E2E&city=${encodeURIComponent(cityA.name)}&limit=10`);
      assert(community.data?.some((trip) => trip.id === ctx.tripId), "Community list missing public trip");

      const copied = await request<Trip>(`/trips/${ctx.tripId}/copy`, {
        method: "POST",
        token: ctx.userToken,
        expectedStatus: 201,
      });
      assert(copied.data?.id && copied.data.id !== ctx.tripId, "Copy trip did not create a new trip");
      ctx.copiedTripId = copied.data.id;

      await request(`/trips/${ctx.tripId}/share`, {
        method: "DELETE",
        token: ctx.userToken,
      });

      await request(`/share/${shared.data.shareToken}`, {
        expectedStatus: 404,
        expectSuccess: false,
      });
    });

    await test("delete stop and trip", async () => {
      await request(`/trips/${ctx.tripId}/stops/${stopB.id}`, {
        method: "DELETE",
        token: ctx.userToken,
      });

      if (ctx.copiedTripId) {
        await request(`/trips/${ctx.copiedTripId}`, {
          method: "DELETE",
          token: ctx.userToken,
        });
        ctx.copiedTripId = undefined;
      }

      await request(`/trips/${ctx.tripId}`, {
        method: "DELETE",
        token: ctx.userToken,
      });

      await request(`/trips/${ctx.tripId}`, {
        token: ctx.userToken,
        expectedStatus: 404,
        expectSuccess: false,
      });
      ctx.tripId = undefined;
    });

    await test("admin stats, users, delete user", async () => {
      try {
        const admin = await loginUser(adminEmail, adminPassword);
        ctx.adminToken = admin.token;
      } catch {
        console.log(
          `  Admin login unavailable for ${adminEmail}; run prisma:seed or set E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD.`,
        );
        return;
      }

      const stats = await request<{ totalUsers: number }>("/admin/stats", {
        token: ctx.adminToken,
      });
      assert(typeof stats.data?.totalUsers === "number", "Admin stats missing totalUsers");

      const users = await request<unknown[]>("/admin/users?page=1&limit=10", {
        token: ctx.adminToken,
      });
      assert(users.pagination, "Admin users missing pagination");

      const disposable = await registerUser(uniqueEmail("admin-delete", runId), password, "Delete");
      await request(`/admin/users/${disposable.user.id}`, {
        method: "DELETE",
        token: ctx.adminToken,
      });

      await request("/auth/login", {
        method: "POST",
        expectedStatus: 401,
        expectSuccess: false,
        body: { email: disposable.user.email, password },
      });
    });

    await test("change password and delete profile", async () => {
      const newPassword = "E2ePass67890";
      await request("/auth/change-password", {
        method: "POST",
        token: ctx.userToken,
        body: { oldPassword: password, newPassword },
      });

      const loggedIn = await loginUser(ctx.userEmail, newPassword);
      ctx.userToken = loggedIn.token;

      await request("/users/profile", {
        method: "DELETE",
        token: ctx.userToken,
      });

      await request("/auth/login", {
        method: "POST",
        expectedStatus: 401,
        expectSuccess: false,
        body: { email: ctx.userEmail, password: newPassword },
      });
      ctx.userToken = "";
    });
  } catch (error) {
    await cleanup(ctx);
    if (managedServerOutput.trim()) {
      console.error("\nManaged server output:");
      console.error(managedServerOutput.trim().split("\n").slice(-80).join("\n"));
    }
    throw error;
  } finally {
    managedServer?.kill("SIGTERM");
  }

  const passed = results.filter((result) => !result.skipped).length;
  const skipped = results.filter((result) => result.skipped).length;
  const totalMs = results.reduce((sum, result) => sum + result.durationMs, 0);
  console.log(`\nCompleted ${passed} checks${skipped ? `, ${skipped} skipped` : ""} in ${totalMs}ms.`);
}

main().catch((error) => {
  console.error("\nTraveloop API e2e failed:");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
