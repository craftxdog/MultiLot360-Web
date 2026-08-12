import { billingApi } from "@/features/billing/server/billing-api";
import {
  assertBillingMutationOrigin,
  billingErrorResponse,
  billingResponse,
  billingUnauthorizedResponse,
  getBillingAccessToken,
} from "@/features/billing/server/billing-route";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ submissionId: string }> },
) {
  try {
    assertBillingMutationOrigin(request);
    const token = await getBillingAccessToken();
    if (!token) return billingUnauthorizedResponse();
    const { submissionId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) {
      return billingResponse({ message: "Selecciona un comprobante." }, 400);
    }
    if (file.size > 10 * 1024 * 1024 || !allowedTypes.has(file.type)) {
      return billingResponse(
        { message: "El comprobante debe ser PDF, JPG o PNG y pesar hasta 10 MB." },
        400,
      );
    }
    return billingResponse(await billingApi.uploadEvidence(submissionId, file, token), 201);
  } catch (error) {
    return billingErrorResponse(error);
  }
}
