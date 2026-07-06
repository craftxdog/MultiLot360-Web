import { parametersApi } from "@/features/parameters/server/parameters-api";
import {
  getParameterAccessToken,
  parameterRouteErrorResponse,
  parameterRouteResponse,
  unauthorizedParameterResponse,
} from "@/features/parameters/server/parameter-route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accessToken = await getParameterAccessToken();
    if (!accessToken) return unauthorizedParameterResponse();

    return parameterRouteResponse(
      await parametersApi.getOverview(accessToken),
    );
  } catch (error) {
    return parameterRouteErrorResponse(error);
  }
}
