import { browserHttp } from "@/lib/api/browser-http";
import type {
  ParametersOverview,
  ParametersQuery,
  ParametersResult,
  SystemParameter,
  UpsertSystemParameterInput,
} from "../types/parameter.types";
import { buildParametersQueryString } from "../utils/parameter-query";

const JSON_HEADERS = { "Content-Type": "application/json" };

export const parametersService = {
  getParameters(query: ParametersQuery = {}) {
    return browserHttp<ParametersResult>(
      `/api/parameters${buildParametersQueryString(query)}`,
    );
  },

  getOverview() {
    return browserHttp<ParametersOverview>("/api/parameters/overview");
  },

  getParameter(key: string) {
    return browserHttp<SystemParameter>(
      `/api/parameters/${encodeURIComponent(key)}`,
    );
  },

  upsertParameter(input: UpsertSystemParameterInput) {
    return browserHttp<SystemParameter>(
      `/api/parameters/${encodeURIComponent(input.key)}`,
      {
        method: "PUT",
        headers: JSON_HEADERS,
        body: JSON.stringify({ value: input.value }),
      },
    );
  },
};
