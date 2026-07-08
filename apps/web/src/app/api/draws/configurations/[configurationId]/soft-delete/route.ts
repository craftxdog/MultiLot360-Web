import { drawConfigurationIdSchema, softDeleteDrawConfigurationSchema } from "@/features/draws/schemas/draws.schema";
import { assertDrawMutationOrigin, drawRouteErrorResponse, drawRouteResponse, getDrawRouteAccessToken, unauthorizedDrawRouteResponse } from "@/features/draws/server/draw-route";
import { drawsApi } from "@/features/draws/server/draws-api";

export async function PATCH(request: Request, context: { params: Promise<{ configurationId: string }> }) {
  try {
    assertDrawMutationOrigin(request);
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();
    const configurationId = drawConfigurationIdSchema.parse((await context.params).configurationId);
    const input = softDeleteDrawConfigurationSchema.parse(await request.json());
    return drawRouteResponse(await drawsApi.softDeleteConfiguration(configurationId, input, accessToken));
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
