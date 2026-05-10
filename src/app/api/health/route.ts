import { ok, optionsResponse } from "@/lib/api";

export async function GET() {
  return ok({
    service: "traveloop-api",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}

export const OPTIONS = optionsResponse;
