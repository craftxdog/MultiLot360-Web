import { numberControlApi } from "@/features/number-control/server/number-control-api";
import { getNumberControlAccessToken, numberControlErrorResponse, numberControlResponse, unauthorizedNumberControlResponse } from "@/features/number-control/server/number-control-route";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    return numberControlResponse(await numberControlApi.getOverview(token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}
