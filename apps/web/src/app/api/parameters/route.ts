import { parametersQuerySchema } from "@/features/parameters/schemas/parameter.schema";
import { parametersApi } from "@/features/parameters/server/parameters-api";
import {
  getParameterAccessToken,
  parameterRouteErrorResponse,
  parameterRouteResponse,
  unauthorizedParameterResponse,
} from "@/features/parameters/server/parameter-route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const accessToken = await getParameterAccessToken();
    if (!accessToken) return unauthorizedParameterResponse();

    const query = parametersQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );

    return parameterRouteResponse(
      await parametersApi.getParameters(query, accessToken),
    );
  } catch (error) {
    return parameterRouteErrorResponse(error);
  }
}
