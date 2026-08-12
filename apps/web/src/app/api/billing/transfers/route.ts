import { bankTransferSchema } from "@/features/billing/schemas/billing.schema";
import { billingApi } from "@/features/billing/server/billing-api";
import {
  assertBillingMutationOrigin,
  billingErrorResponse,
  billingResponse,
  billingUnauthorizedResponse,
  getBillingAccessToken,
} from "@/features/billing/server/billing-route";

export async function POST(request: Request) {
  try {
    assertBillingMutationOrigin(request);
    const token = await getBillingAccessToken();
    if (!token) return billingUnauthorizedResponse();
    const input = bankTransferSchema.parse(await request.json());
    return billingResponse(await billingApi.createTransfer(input, token), 201);
  } catch (error) {
    return billingErrorResponse(error);
  }
}
