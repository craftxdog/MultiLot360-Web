import "server-only";
import { http } from "@/lib/api/http";
import type { SalesMatrix, SalesMatrixQuery } from "../types/sales-matrix.types";
import { buildSalesMatrixQueryString } from "../utils/sales-matrix-query";

export const salesMatrixApi = {
  get(query: SalesMatrixQuery, accessToken: string) {
    return http<SalesMatrix>(`/sales-matrix${buildSalesMatrixQueryString(query)}`, {
      method: "GET",
      token: accessToken,
    });
  },
};
