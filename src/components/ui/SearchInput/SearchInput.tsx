"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useCallback } from "react";
import styles from "./SearchInput.module.css";

interface SearchInputProps {
  param?: string;
  placeholder?: string;
  className?: string;
}

export function SearchInput({ param = "search", placeholder = "Search...", className }: SearchInputProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const value = searchParams.get(param) || "";

  const setSearch = useCallback(
    (term: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (term) {
        params.set(param, term);
      } else {
        params.delete(param);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, router, pathname, param]
  );

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <input
        value={value}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      {value && (
        <button
          onClick={() => setSearch("")}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
