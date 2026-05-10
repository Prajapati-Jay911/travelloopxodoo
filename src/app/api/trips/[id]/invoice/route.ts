import type { NextRequest } from "next/server";
import { fail, ok, optionsResponse, parseJson } from "@/lib/api";
import { authenticate } from "@/lib/middleware/auth";
import { badRequest } from "@/lib/errors";
import * as invoiceService from "@/lib/services/invoiceService";
import { invoiceActionSchema, updateInvoiceSchema } from "@/lib/schemas/invoice";

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    return ok(await invoiceService.getInvoice(user.id, id));
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    const data = await parseJson(request, updateInvoiceSchema);
    return ok(await invoiceService.updateInvoice(user.id, id, data));
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const [{ id }, user] = await Promise.all([params, authenticate(request)]);
    const { action } = await parseJson(request, invoiceActionSchema);
    
    if (action === "pay") {
      return ok(await invoiceService.markAsPaid(user.id, id));
    }
    
    return fail(badRequest("Invalid action"));
  } catch (error) {
    return fail(error);
  }
}

export const OPTIONS = optionsResponse;
