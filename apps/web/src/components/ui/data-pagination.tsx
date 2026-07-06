import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  buildPaginationHref,
  getPaginationPages,
  getPaginationSummary,
  normalizePagination,
  type PaginationMeta,
} from "./data-pagination.utils";

type DataPaginationProps = {
  pagination: PaginationMeta;
  basePath: string;
  params?: Record<string, string | number | boolean | undefined | null>;
  itemLabel?: string;
};

function PaginationButton({
  href,
  disabled,
  children,
  ariaLabel,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  if (disabled) {
    return (
      <span
        aria-label={ariaLabel}
        className="inline-flex h-9 min-w-9 cursor-not-allowed items-center justify-center rounded-lg border border-border px-3 text-sm text-muted-foreground opacity-35"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      scroll={false}
      aria-label={ariaLabel}
      className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg border border-border px-3 text-sm text-muted-foreground transition hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}

export function DataPagination({
  pagination,
  basePath,
  params,
  itemLabel = "registros",
}: DataPaginationProps) {
  const { page, totalPages } = normalizePagination(pagination);
  const pages = getPaginationPages(page, totalPages);
  const { from, to } = getPaginationSummary(pagination);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Mostrando{" "}
        <span className="text-foreground">{from}</span>
        {" - "}
        <span className="text-foreground">{to}</span>
        {" de "}
        <span className="text-foreground">{pagination.total}</span>{" "}
        {itemLabel}
      </p>

      <div className="flex flex-wrap items-center gap-1" aria-label="Paginación">
        <span className="mr-2 hidden text-xs text-muted-foreground sm:inline">
          Página {page} de {totalPages}
        </span>
        <PaginationButton
          href={buildPaginationHref({
            basePath,
            params,
            page: page - 1,
          })}
          disabled={!pagination.hasPreviousPage}
          ariaLabel="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </PaginationButton>

        {pages.map((item, index) => {
          const previous = pages[index - 1];
          const showGap = previous && item - previous > 1;
          const active = item === page;

          return (
            <div key={item} className="flex items-center gap-1">
              {showGap ? (
                <span className="px-2 text-sm text-muted-foreground">...</span>
              ) : null}

              <Link
                href={buildPaginationHref({
                  basePath,
                  params,
                  page: item,
                })}
                scroll={false}
                aria-label={`Ir a la página ${item}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm transition",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {item}
              </Link>
            </div>
          );
        })}

        <PaginationButton
          href={buildPaginationHref({
            basePath,
            params,
            page: page + 1,
          })}
          disabled={!pagination.hasNextPage}
          ariaLabel="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </PaginationButton>
      </div>
    </div>
  );
}
