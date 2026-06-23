import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMemo, useRef, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatARS(amount: number): string {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function useSafePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const didReplace = useRef(false);
  const raw = parseInt(searchParams.get("page") || "1", 10);
  const safe = useMemo(() => Math.max(1, raw), [raw]);

  useEffect(() => {
    if (safe === raw || didReplace.current) return;
    didReplace.current = true;
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(safe));
    router.replace(url.pathname + url.search);
  }, [safe, raw, router, pathname]);

  useEffect(() => {
    didReplace.current = false;
  });

  return safe;
}
