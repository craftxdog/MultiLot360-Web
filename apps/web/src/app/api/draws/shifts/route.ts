import {
  createDrawShiftSchema,
  drawShiftsQuerySchema,
} from "@/features/draws/schemas/draws.schema";
import {
  assertDrawMutationOrigin,
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

    const query = drawShiftsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    return drawRouteResponse(await drawsApi.getShifts(query, accessToken));
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertDrawMutationOrigin(request);
    const accessToken = await getDrawRouteAccessToken();
    if (!accessToken) return unauthorizedDrawRouteResponse();

    const input = createDrawShiftSchema.parse(await request.json());
    return drawRouteResponse(await drawsApi.createShift(input, accessToken), 201);
  } catch (error) {
    return drawRouteErrorResponse(error);
  }
}
