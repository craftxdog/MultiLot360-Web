import { getCurrentUser } from "@/features/auth/server/get-current-user";
import { operationsApi } from "@/features/operations/server/operations-api";
import { getOperationsToken, operationsError, operationsResponse } from "@/features/operations/server/operations-route";
import { analyticsQuerySchema } from "@/features/operations/utils/operations-query";

export async function GET(request: Request) {
  try {
    const token = await getOperationsToken();
    if (!token) return operationsResponse({ message: "Sesión expirada" }, 401);

    const parsed = analyticsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const user = await getCurrentUser();
    const admin = user?.role.name.toUpperCase() === "ADMIN";
    if (!admin && !user?.seller?.id) return operationsResponse({ message: "Tu cuenta no tiene un vendedor asociado." }, 403);

    return operationsResponse(await operationsApi.analytics({
      dateFrom: parsed.dateFrom,
      dateUntil: parsed.dateUntil,
      sellerId: admin ? parsed.sellerId : user?.seller?.id,
      drawCode: parsed.drawCode,
      topLimit: parsed.topLimit,
    }, token));
  } catch (error) {
    return operationsError(error);
  }
}
