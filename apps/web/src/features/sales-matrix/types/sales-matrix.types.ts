export type SalesMatrixStatus = "ACTIVA" | "ANULADA" | "TODAS";
export type SalesMatrixQuery = {
  date: string;
  shiftId?: string;
  drawCode?: string;
  sellerId?: string;
  status: SalesMatrixStatus;
};
export type SalesMatrixCell = {
  number: string;
  amountMiles: number;
  salesCount: number;
  itemsCount: number;
  sold: boolean;
};
export type SalesMatrix = {
  filters: SalesMatrixQuery;
  rows: Array<{ row: number; cells: SalesMatrixCell[] }>;
  summary: {
    totalMiles: number;
    salesCount: number;
    itemsCount: number;
    soldNumbersCount: number;
  };
  realtime: { namespace: "/realtime"; events: ["sales.created", "sales.voided"]; strategy: "REFETCH" };
  generatedAt: string;
};
