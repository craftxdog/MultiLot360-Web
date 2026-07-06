export type Pagination = { page: number; limit: number; count: number; total: number; totalPages: number; hasNextPage: boolean; hasPreviousPage: boolean };
export type SortDirection = "asc" | "desc";
export type Person = { id: string; username?: string; name: string | null };
export type ShiftRef = { id: string; date: string; status: string; configuration: { id: string; code: string; time: string } };

export type Result = { id: string; shift: ShiftRef; winningNumber: string; createdBy: Person | null; createdAt: string; winnerSummary: { winningSalesCount: number; totalPrizeMiles: number; paidSalesCount: number; paidPrizeMiles: number; pendingSalesCount: number; pendingPrizeMiles: number } };
export type ResultsQuery = { page?: number; limit?: number; shiftId?: string; date?: string; drawCode?: string; winningNumber?: string; createdByUserId?: string; sortBy?: "createdAt" | "winningNumber" | "date" | "drawCode"; sortDirection?: SortDirection };
export type WinningSale = { saleId: string; seller: { id: string; name: string }; shift: ShiftRef | null; saleStatus: string; saleTotalMiles: number; saleCreatedAt: string; winningPrizeMiles: number; winningDetails: Array<{ id: string; number: string; prizeMiles: number; createdAt: string }>; paid: boolean; payment: { paidAmountMiles: number; paidByUserId: string | null; paidAt: string } | null };
export type WinningSalesQuery = { page?: number; limit?: number; sellerId?: string; paid?: boolean; sortBy?: "createdAt" | "sellerName" | "totalMiles"; sortDirection?: SortDirection };

export type PrizePayment = { saleId: string; result: { id: string; winningNumber: string; shift: ShiftRef }; sale: { id: string; status: string; totalMiles: number; createdAt: string; seller: { id: string; name: string }; shift: ShiftRef | null }; paidAmountMiles: number; paidBy: Person | null; paidAt: string };
export type PrizePaymentsQuery = { page?: number; limit?: number; resultId?: string; saleId?: string; sellerId?: string; paidByUserId?: string; date?: string; drawCode?: string; paidFrom?: string; paidUntil?: string; sortBy?: "paidAt" | "paidAmountMiles" | "sellerName" | "drawCode"; sortDirection?: SortDirection };

export type CashCut = { id: string; startDate: string; endDate: string; description: string | null; visibleToSellers: boolean; createdBy: Person | null; createdAt: string };
export type CashCutsQuery = { page?: number; limit?: number; startDate?: string; endDate?: string; visibleToSellers?: boolean | string; createdByUserId?: string; sortBy?: "createdAt" | "startDate" | "endDate"; sortDirection?: SortDirection };
export type CashCutSummary = { cut: CashCut; totals: SellerReport; sellers: Array<SellerReport & { sellerId: string; sellerName: string }> };

export type ReportQuery = { dateFrom: string; dateUntil: string; sellerId?: string; drawCode?: string };
export type SellerReport = { salesCount?: number; activeSalesCount: number; voidedSalesCount: number; grossSalesMiles: number; voidedSalesMiles: number; netSalesMiles: number; winningPrizeMiles?: number; paidPrizesMiles: number; pendingPrizesMiles?: number; balanceMiles: number };
export type OperationalReport = ReportQuery & SellerReport & { filters: ReportQuery };
export type SellerOperationalReport = SellerReport & { sellerId: string; sellerName: string };
export type SellerReportsQuery = ReportQuery & { page?: number; limit?: number; sortBy?: "sellerName" | "netSalesMiles" | "paidPrizesMiles" | "balanceMiles"; sortDirection?: SortDirection };

export type AuditEvent = { id: string; userId: string | null; event: string; payload: unknown; actor: Person | null; createdAt: string };
export type AuditQuery = { page?: number; limit?: number; userId?: string; event?: string; createdFrom?: string; createdUntil?: string; sortBy?: "createdAt" | "event" | "id"; sortDirection?: SortDirection };

export type PageResult<T> = { data: T[]; pagination: Pagination };
