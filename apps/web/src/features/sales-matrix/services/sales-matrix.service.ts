import { browserHttp } from "@/lib/api/browser-http";
import type { SalesMatrixQuery, SalesMatrix } from "../types/sales-matrix.types";
import { buildSalesMatrixQueryString } from "../utils/sales-matrix-query";

export const salesMatrixService = {
  get(query: SalesMatrixQuery) {
    return browserHttp<SalesMatrix>(`/api/sales-matrix${buildSalesMatrixQueryString(query)}`);
  },
};
