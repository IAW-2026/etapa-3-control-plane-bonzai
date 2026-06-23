"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import styles from "./Pagination.module.css";

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
  const didClamp = useRef(false);

  useEffect(() => {
    if (page >= 1 && total <= 0) return;
    const clamped = page < 1 ? 1 : totalPages > 0 && page > totalPages ? totalPages : page;
    if (clamped === page) return;
    if (didClamp.current) return;
    didClamp.current = true;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(clamped));
    router.replace(url.pathname + url.search);
  }, [total, page]);

  useEffect(() => {
    didClamp.current = false;
  });

  if (totalPages <= 1) return null;

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className={styles.wrapper}>
      <button
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        className={styles.button}
      >
        Previous
      </button>
      <span className={styles.pageInfo}>
        {page} / {totalPages}
      </span>
      <button
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        className={styles.button}
      >
        Next
      </button>
    </div>
  );
}
