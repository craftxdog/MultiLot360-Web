import { billingApi } from "@/features/billing/server/billing-api";
import {
  billingErrorResponse,
  billingResponse,
  billingUnauthorizedResponse,
  getBillingAccessToken,
} from "@/features/billing/server/billing-route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getBillingAccessToken();
    if (!token) return billingUnauthorizedResponse();
    return billingResponse(await billingApi.portal(token));
  } catch (error) {
    return billingErrorResponse(error);
  }
}
