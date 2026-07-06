import { drawShiftIdSchema } from "@/features/draws/schemas/draws.schema";
import {
  assertDrawMutationOrigin,
  drawRouteErrorResponse,
  drawRouteResponse,
  getDrawRouteAccessToken,
  unauthorizedDrawRouteResponse,
} from "@/features/draws/server/draw-route";
import { drawsApi } from "@/features/draws/server/draws-api";

export async function PATCH(request: Request, { params }: { params: Promise<{ shiftId: string }> }) {
  try {
    assertDrawMutationOrigin(request);
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();
    const shiftId = drawShiftIdSchema.parse((await params).shiftId);
    return drawRouteResponse(await drawsApi.transitionShift(shiftId, "reopen", accessToken));
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
