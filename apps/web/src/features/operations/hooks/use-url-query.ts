"use client";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { z } from "zod";
import { queryString } from "../utils/operations-query";
export function useUrlQuery<T extends Record<string, unknown>>(schema: z.ZodType<T>, defaults: Partial<T> = {}) { const router = useRouter(); const pathname = usePathname(); const searchParams = useSearchParams(); const query = useMemo(() => schema.parse({ ...defaults, ...Object.fromEntries(new URLSearchParams(searchParams.toString())) }), [defaults, schema, searchParams]); const update = (changes: Partial<T>) => router.replace(`${pathname}${queryString({ ...query, ...changes, page: 1 })}`, { scroll: false }); return { query, update, pathname }; }
