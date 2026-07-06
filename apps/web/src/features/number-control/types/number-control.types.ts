export type SortDirection = "asc" | "desc";
export type NumberControlTab = "limits" | "blocked";
export type NumberLimitSellerScope = "GLOBAL" | "SELLER";
export type NumberLimitDrawScope = "DEFAULT" | "DRAW";
export type BlockedNumberScope = "DATE" | "SHIFT";

export type NumberControlPagination = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type NumberLimit = {
  id: string;
  sellerScope: NumberLimitSellerScope;
  drawScope: NumberLimitDrawScope;
  seller: { id: string; name: string } | null;
  drawConfiguration: { id: string; code: string; time: string } | null;
  number: string;
  limitMiles: number;
  validFrom: string;
  validUntil: string | null;
  createdAt: string;
};

export type BlockedNumber = {
  id: string;
  scope: BlockedNumberScope;
  number: string;
  date: string | null;
  shift: {
    id: string;
    date: string;
    status: string;
    configuration: { id: string; code: string; time: string };
  } | null;
  reason: string | null;
  createdBy: { id: string; username: string; name: string | null } | null;
  createdAt: string;
};

export type NumberLimitsQuery = {
  page?: number;
  limit?: number;
  sellerId?: string;
  drawConfigurationId?: string;
  drawCode?: string;
  number?: string;
  sellerScope?: NumberLimitSellerScope;
  drawScope?: NumberLimitDrawScope;
  active?: boolean;
  validOn?: string;
  sortBy?: "number" | "limitMiles" | "validFrom" | "validUntil" | "drawCode" | "createdAt";
  sortDirection?: SortDirection;
};

export type BlockedNumbersQuery = {
  page?: number;
  limit?: number;
  number?: string;
  scope?: BlockedNumberScope;
  shiftId?: string;
  date?: string;
  drawCode?: string;
  createdByUserId?: string;
  sortBy?: "createdAt" | "number" | "date" | "drawCode";
  sortDirection?: SortDirection;
};

export type NumberLimitsResult = {
  limits: NumberLimit[];
  pagination: NumberControlPagination;
};

export type BlockedNumbersResult = {
  blockedNumbers: BlockedNumber[];
  pagination: NumberControlPagination;
};

export type NumberControlOverview = {
  activeLimits: number;
  globalLimits: number;
  sellerLimits: number;
  blockedNumbers: number;
};

export type NumberControlWorkspaceQuery = {
  view: NumberControlTab;
  page: number;
  limit: number;
  number?: string;
  active?: boolean;
  sellerScope?: NumberLimitSellerScope;
  drawScope?: NumberLimitDrawScope;
  scope?: BlockedNumberScope;
  date?: string;
  drawCode?: string;
};

export type CreateNumberLimitsInput = {
  sellerId?: string;
  drawConfigurationId?: string;
  numbers: string[];
  limitMiles: number;
  validFrom: string;
  validUntil?: string;
};

export type UpdateNumberLimitInput = {
  sellerId?: string | null;
  drawConfigurationId?: string | null;
  number?: string;
  limitMiles?: number;
  validFrom?: string;
  validUntil?: string | null;
};

export type CreateBlockedNumbersInput = {
  numbers: string[];
  shiftId?: string;
  date?: string;
  reason?: string;
};
