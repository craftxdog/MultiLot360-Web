import { expireNumberLimitSchema, numberControlIdSchema } from "@/features/number-control/schemas/number-control.schema";
import { numberControlApi } from "@/features/number-control/server/number-control-api";
import { assertNumberControlMutationOrigin, getNumberControlAccessToken, numberControlErrorResponse, numberControlResponse, unauthorizedNumberControlResponse } from "@/features/number-control/server/number-control-route";

export async function PATCH(request: Request, { params }: { params: Promise<{ limitId: string }> }) {
  try {
    assertNumberControlMutationOrigin(request);
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const limitId = numberControlIdSchema.parse((await params).limitId);
    const { expiresOn } = expireNumberLimitSchema.parse(await request.json());
    return numberControlResponse(await numberControlApi.expireLimit(limitId, expiresOn, token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}
