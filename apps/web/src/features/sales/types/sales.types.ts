export type SaleStatus = "ACTIVA" | "ANULADA";
export type SalesTab = "sell" | "history";

export type SaleItem = {
  id: string;
  number: string;
  prizeMiles: number;
  createdAt: string;
};

export type Sale = {
  id: string;
  seller: { id: string; name: string };
  shift: {
    id: string;
    date: string;
    status: string;
    configuration: { id: string; code: string; time: string };
  } | null;
  status: SaleStatus;
  totalMiles: number;
  details: SaleItem[];
  createdAt: string;
  voidedByUserId: string | null;
  voidedAt: string | null;
  voidReason: string | null;
};

export type SalesPagination = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type SalesQuery = {
  page?: number;
  limit?: number;
  sellerId?: string;
  shiftId?: string;
  date?: string;
  drawCode?: string;
  number?: string;
  status?: SaleStatus;
  sortBy?: "createdAt" | "totalMiles" | "status" | "date" | "drawCode" | "sellerName";
  sortDirection?: "asc" | "desc";
};

export type SalesResult = { sales: Sale[]; pagination: SalesPagination };
export type SalesVoidPolicy = { windowMinutes: number };
export type SalesOverview = {
  total: number;
  today: number;
  active: number;
  voided: number;
};

export type CreateSaleInput = {
  sellerId?: string;
  shiftId: string;
  items: Array<{ number: string; prizeMiles: number }>;
};

export type SalesWorkspaceQuery = {
  view: SalesTab;
  page: number;
  limit: number;
  sellerId?: string;
  shiftId?: string;
  date?: string;
  drawCode?: string;
  number?: string;
  status?: SaleStatus;
};
