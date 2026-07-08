import { drawConfigurationIdSchema } from "@/features/draws/schemas/draws.schema";
import { drawRouteErrorResponse, drawRouteResponse, getDrawRouteAccessToken, unauthorizedDrawRouteResponse } from "@/features/draws/server/draw-route";
import { drawsApi } from "@/features/draws/server/draws-api";

export async function GET(_request: Request, context: { params: Promise<{ configurationId: string }> }) {
  try {
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();
    const configurationId = drawConfigurationIdSchema.parse((await context.params).configurationId);
    return drawRouteResponse(await drawsApi.getConfigurationDeleteImpact(configurationId, accessToken));
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
