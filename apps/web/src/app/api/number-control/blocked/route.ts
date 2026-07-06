import { blockedNumbersQuerySchema, createBlockedNumbersSchema } from "@/features/number-control/schemas/number-control.schema";
import { numberControlApi } from "@/features/number-control/server/number-control-api";
import { assertNumberControlMutationOrigin, getNumberControlAccessToken, numberControlErrorResponse, numberControlResponse, unauthorizedNumberControlResponse } from "@/features/number-control/server/number-control-route";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const query = blockedNumbersQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return numberControlResponse(await numberControlApi.getBlockedNumbers(query, token));
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    assertNumberControlMutationOrigin(request);
    const token = await getNumberControlAccessToken();
    if (!token) return unauthorizedNumberControlResponse();
    const input = createBlockedNumbersSchema.parse(await request.json());
    return numberControlResponse(await numberControlApi.createBlockedNumbers(input, token), 201);
  } catch (error) {
    return numberControlErrorResponse(error);
  }
}
