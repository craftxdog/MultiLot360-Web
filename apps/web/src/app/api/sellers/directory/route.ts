import { z } from "zod";
import { getSellerRouteAccessToken, sellerRouteErrorResponse, sellerRouteResponse, unauthorizedSellerRouteResponse } from "@/features/sellers/server/seller-route";
import { sellersApi } from "@/features/sellers/server/sellers-api";

const querySchema = z.object({ search: z.string().trim().max(120).optional(), active: z.enum(["true", "false"]).transform((value) => value === "true").optional(), page: z.coerce.number().int().positive().default(1), limit: z.coerce.number().int().min(1).max(100).default(10), sortBy: z.string().max(40).default("name"), sortDirection: z.enum(["asc", "desc"]).default("asc") });
export const dynamic = "force-dynamic";
export async function GET(request: Request) { try { const token = await getSellerRouteAccessToken(); if (!token) return unauthorizedSellerRouteResponse(); const query = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams)); return sellerRouteResponse(await sellersApi.getDirectory(query, token)); } catch (error) { return sellerRouteErrorResponse(error); } }
