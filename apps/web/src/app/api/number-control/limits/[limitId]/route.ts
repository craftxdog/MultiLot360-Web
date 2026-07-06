import { numberControlIdSchema, updateNumberLimitSchema } from "@/features/number-control/schemas/number-control.schema";
import { numberControlApi } from "@/features/number-control/server/number-control-api";
import { assertNumberControlMutationOrigin, getNumberControlAccessToken, numberControlErrorResponse, numberControlResponse, unauthorizedNumberControlResponse } from "@/features/number-control/server/number-control-route";

type Context = { params: Promise<{ limitId: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const limitId = numberControlIdSchema.parse((await params).limitId);
    return numberControlResponse(await numberControlApi.getLimit(limitId, token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    assertNumberControlMutationOrigin(request);
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const limitId = numberControlIdSchema.parse((await params).limitId);
    const input = updateNumberLimitSchema.parse(await request.json());
    return numberControlResponse(await numberControlApi.updateLimit(limitId, input, token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}
