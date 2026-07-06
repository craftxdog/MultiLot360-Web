import {
  drawRouteErrorResponse,
  drawRouteResponse,
  getDrawRouteAccessToken,
  unauthorizedDrawRouteResponse,
} from "@/features/draws/server/draw-route";
import { drawsApi } from "@/features/draws/server/draws-api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();
    return drawRouteResponse(await drawsApi.getOverview(accessToken));
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
