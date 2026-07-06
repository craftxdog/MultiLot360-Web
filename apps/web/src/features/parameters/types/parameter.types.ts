export type SystemParameter = {
  key: string;
  value: string;
  updatedAt: string;
};

export type ParametersQuery = {
  key?: string;
  page?: number;
  limit?: number;
  sortBy?: "key" | "updatedAt";
  sortDirection?: "asc" | "desc";
};

export type ParametersPagination = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ParametersResult = {
  parameters: SystemParameter[];
  pagination: ParametersPagination;
};

export type ParametersOverview = {
  total: number;
  namespaces: number;
  recentlyUpdated: number;
  isPartial: boolean;
};

export type UpsertSystemParameterInput = {
  key: string;
  value: string;
};

export type ParameterValueKind = "boolean" | "number" | "json" | "text";
