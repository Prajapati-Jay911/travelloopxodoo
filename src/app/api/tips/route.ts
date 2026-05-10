import { ok } from "@/lib/api";
import tips from "@/lib/data/tips.json";

export async function GET() {
  return ok(tips);
}
