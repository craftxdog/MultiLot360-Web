import {
  drawConfigurationIdSchema,
  hardDeleteDrawConfigurationSchema,
  updateDrawConfigurationSchema,
} from "@/features/draws/schemas/draws.schema";
import {
  assertDrawMutationOrigin,
  drawRouteErrorResponse,
  drawRouteResponse,
  getDrawRouteAccessToken,
  unauthorizedDrawRouteResponse,
} from "@/features/draws/server/draw-route";
import { drawsApi } from "@/features/draws/server/draws-api";

type ConfigurationRouteContext = {
  params: Promise<{ configurationId: string }>;
};

export async function GET(_request: Request, context: ConfigurationRouteContext) {
  try {
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();

    const configurationId = drawConfigurationIdSchema.parse(
      (await context.params).configurationId,
    );
    return drawRouteResponse(
      await drawsApi.getConfiguration(configurationId, accessToken),
    );
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}

export async function PATCH(request: Request, context: ConfigurationRouteContext) {
  try {
    assertDrawMutationOrigin(request);
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();

    const configurationId = drawConfigurationIdSchema.parse(
      (await context.params).configurationId,
    );
    const input = updateDrawConfigurationSchema.parse(await request.json());
    return drawRouteResponse(
      await drawsApi.updateConfiguration(configurationId, input, accessToken),
    );
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}

export async function DELETE(request: Request, context: ConfigurationRouteContext) {
  try {
    assertDrawMutationOrigin(request);
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();

    const configurationId = drawConfigurationIdSchema.parse(
      (await context.params).configurationId,
    );
    const input = hardDeleteDrawConfigurationSchema.parse(await request.json());
    return drawRouteResponse(
      await drawsApi.hardDeleteConfiguration(configurationId, input, accessToken),
    );
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
