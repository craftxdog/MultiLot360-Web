import { numberControlIdSchema } from "@/features/number-control/schemas/number-control.schema";
import { numberControlApi } from "@/features/number-control/server/number-control-api";
import { assertNumberControlMutationOrigin, getNumberControlAccessToken, numberControlErrorResponse, numberControlResponse, unauthorizedNumberControlResponse } from "@/features/number-control/server/number-control-route";

type Context = { params: Promise<{ blockId: string }> };

export async function GET(_request: Request, { params }: Context) {
  try {
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const blockId = numberControlIdSchema.parse((await params).blockId);
    return numberControlResponse(await numberControlApi.getBlockedNumber(blockId, token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}

export async function DELETE(request: Request, { params }: Context) {
  try {
    assertNumberControlMutationOrigin(request);
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const blockId = numberControlIdSchema.parse((await params).blockId);
    return numberControlResponse(await numberControlApi.deleteBlockedNumber(blockId, token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}
