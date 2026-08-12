import { reviewTransferSchema } from "@/features/billing/schemas/billing.schema";
import { billingApi } from "@/features/billing/server/billing-api";
import {
  assertBillingMutationOrigin,
  billingErrorResponse,
  billingResponse,
  billingUnauthorizedResponse,
  getBillingAccessToken,
} from "@/features/billing/server/billing-route";

export async function POST(
  request: Request,
  context: { params: Promise<{ submissionId: string }> },
) {
  try {
    assertBillingMutationOrigin(request);
    const token = await getBillingAccessToken();
    if (!token) return billingUnauthorizedResponse();
    const { submissionId } = await context.params;
    const input = reviewTransferSchema.parse(await request.json());
    return billingResponse(await billingApi.reviewTransfer(submissionId, input, token), 201);
  } catch (error) {
    return billingErrorResponse(error);
  }
}
