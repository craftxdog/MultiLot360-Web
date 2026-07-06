import {
  parameterKeySchema,
  upsertSystemParameterSchema,
} from "@/features/parameters/schemas/parameter.schema";
import { parametersApi } from "@/features/parameters/server/parameters-api";
import {
  assertParameterMutationOrigin,
  getParameterAccessToken,
  parameterRouteErrorResponse,
  parameterRouteResponse,
  unauthorizedParameterResponse,
} from "@/features/parameters/server/parameter-route";

type ParameterRouteContext = {
  params: Promise<{ key: string }>;
};

export async function GET(_request: Request, context: ParameterRouteContext) {
  try {
    const accessToken = await getParameterAccessToken();
    if (!accessToken) return unauthorizedParameterResponse();

    const { key } = parameterKeySchema.parse(await context.params);

    return parameterRouteResponse(
      await parametersApi.getParameter(key, accessToken),
    );
  } catch (error) {
    return parameterRouteErrorResponse(error);
  }
}

export async function PUT(request: Request, context: ParameterRouteContext) {
  try {
    assertParameterMutationOrigin(request);
    const accessToken = await getParameterAccessToken();
    if (!accessToken) return unauthorizedParameterResponse();

    const params = await context.params;
    const input = upsertSystemParameterSchema.parse({
      ...params,
      ...(await request.json()),
    });

    return parameterRouteResponse(
      await parametersApi.upsertParameter(input, accessToken),
    );
  } catch (error) {
    return parameterRouteErrorResponse(error);
  }
}
