export type PaginationMeta = {
  page: number;
  limit: number;
  count: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export function normalizePagination(meta: PaginationMeta) {
  const totalPages = Math.max(1, meta.totalPages || 1);
  const page = Math.min(Math.max(1, meta.page || 1), totalPages);

  return { page, totalPages };
}

export function getPaginationPages(page: number, totalPages: number) {
  const pages = new Set([1, totalPages, page - 1, page, page + 1]);

  return Array.from(pages)
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);
}

export function getPaginationSummary(meta: PaginationMeta) {
  if (meta.total === 0 || meta.count === 0) {
    return { from: 0, to: 0 };
  }

  const page = Math.max(1, meta.page || 1);
  const from = (page - 1) * meta.limit + 1;
  const to = Math.min(from + meta.count - 1, meta.total);

  return { from, to };
}

export function buildPaginationHref({
  basePath,
  params,
  page,
}: {
  basePath: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  page: number;
}) {
  const searchParams = new URLSearchParams();

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (key === "page" || value === undefined || value === null || value === "") return;

    searchParams.set(key, String(value));
  });

  if (page > 1) searchParams.set("page", String(page));

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
}
