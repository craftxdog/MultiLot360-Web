import { drawShiftsQuerySchema } from "@/features/draws/schemas/draws.schema";
import {
  drawRouteErrorResponse,
  drawRouteResponse,
  getDrawRouteAccessToken,
  unauthorizedDrawRouteResponse,
} from "@/features/draws/server/draw-route";
import { drawsApi } from "@/features/draws/server/draws-api";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();

    const parsed = drawShiftsQuerySchema.omit({ status: true }).parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return drawRouteResponse(await drawsApi.getActiveShifts(parsed, accessToken));
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
