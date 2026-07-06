import {
  sellerInvitationStatuses,
  type SellerInvitationsQuery,
  type SellerInvitationStatus,
} from "../types/seller.types";

const statusSet = new Set<string>(sellerInvitationStatuses);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clean(value: string | null | undefined) {
  const normalized = value?.trim();

  return normalized || undefined;
}

function normalizePositiveInteger(
  value: string | null | undefined,
  fallback: number,
) {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function isSellerInvitationStatus(
  value: string | null | undefined,
): value is SellerInvitationStatus {
  return Boolean(value && statusSet.has(value.toUpperCase()));
}

export function parseSellerInvitationsQuery(
  params: Pick<URLSearchParams, "get">,
): SellerInvitationsQuery {
  const rawStatus = clean(params.get("status"))?.toUpperCase();
  const rawDirection = clean(params.get("sortDirection"));
  const rawEmail = clean(params.get("email"))?.toLowerCase();

  return {
    email: rawEmail && emailPattern.test(rawEmail) ? rawEmail : undefined,
    username: clean(params.get("username"))?.toLowerCase(),
    sellerName: clean(params.get("sellerName")),
    status: isSellerInvitationStatus(rawStatus) ? rawStatus : undefined,
    page: normalizePositiveInteger(params.get("page"), 1),
    limit: Math.min(normalizePositiveInteger(params.get("limit"), 10), 100),
    sortBy: clean(params.get("sortBy")),
    sortDirection: rawDirection === "asc" ? "asc" : "desc",
  };
}

export function buildSellerQueryString(query: SellerInvitationsQuery) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : "";
}
