import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  warning?: boolean;
  className?: string;
}

export function StatCard({ icon, value, label, warning, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "border border-[var(--color-border)] p-5 bg-[var(--color-bg)] flex items-center gap-4",
        warning && "!border-l-[var(--color-warning)]",
        className
      )}
    >
      <div
        className={cn(
          "w-9 h-9 flex items-center justify-center shrink-0 text-[var(--color-primary)]",
          warning ? "bg-[rgba(139,115,85,0.08)]" : "bg-[rgba(27,61,47,0.05)]"
        )}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="font-serif text-2xl font-medium text-[var(--color-primary)] leading-tight">
          {value}
        </span>
        <span className="text-[0.6rem] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          {label}
        </span>
      </div>
    </div>
  );
}
