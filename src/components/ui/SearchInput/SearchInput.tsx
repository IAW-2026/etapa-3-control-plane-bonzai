"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { X } from "lucide-react";
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
  const urlValue = searchParams.get(param) || "";
  const [local, setLocal] = useState(urlValue);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(urlValue);
  }, [urlValue]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (local === urlValue) return;
      const params = new URLSearchParams(searchParams.toString());
      if (local) {
        params.set(param, local);
      } else {
        params.delete(param);
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [local]);

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(" ")}>
      <input
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
      />
      {local && (
        <button
          onClick={() => setLocal("")}
          className={styles.clearButton}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
