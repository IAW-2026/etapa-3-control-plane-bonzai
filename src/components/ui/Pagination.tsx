"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
}

export function Pagination({ total, page, limit }: PaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-center gap-4 py-6">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        Previous
      </button>
      <span className="text-sm text-[var(--color-text-muted)]">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className="text-[0.65rem] uppercase tracking-[0.1em] font-semibold px-4 py-2 border border-[var(--color-border)] text-[var(--color-text)] bg-transparent cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
      >
        Next
      </button>
    </div>
  );
}
