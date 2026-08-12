import { z } from "zod";
import { billingApi } from "@/features/billing/server/billing-api";
import {
  billingErrorResponse,
  billingResponse,
  billingUnauthorizedResponse,
  getBillingAccessToken,
} from "@/features/billing/server/billing-route";

const querySchema = z.object({
  status: z.enum(["PENDIENTE_EVIDENCIA", "EN_REVISION", "APROBADA", "RECHAZADA", "CANCELADA"]).default("EN_REVISION"),
  limit: z.coerce.number().int().min(1).max(200).default(100),
});

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = await getBillingAccessToken();
    if (!token) return billingUnauthorizedResponse();
    const input = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return billingResponse(await billingApi.transferQueue(input.status, input.limit, token));
  } catch (error) {
    return billingErrorResponse(error);
  }
}
