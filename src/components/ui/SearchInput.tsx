"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useCallback } from "react";
import { cn } from "@/lib/utils";

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
    <div className={cn("relative", className)}>
      <input
        value={value}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-[0.6rem] text-sm border-[1.5px] border-[var(--color-border)] rounded-xl outline-none transition-all duration-200 hover:border-[var(--color-primary)] focus:border-[var(--color-primary)]"
      />
      {value && (
        <button
          onClick={() => setSearch("")}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center text-[var(--color-text-muted)] rounded-full hover:bg-[var(--color-neutral-dark)] cursor-pointer"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
