import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  variant?: "shadow" | "flat";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
}

export function Card({ variant = "shadow", padding = "md", className, children }: CardProps) {
  return (
    <div
      className={cn(
        "bg-transparent",
        variant === "shadow" && "shadow-[var(--shadow-md)]",
        padding === "none" && "p-0",
        padding === "sm" && "p-3",
        padding === "md" && "p-4",
        padding === "lg" && "p-6",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, action, className }: CardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 mb-6", className)}>
      <div className="space-y-1">
        <h2 className="font-serif text-2xl font-normal text-[var(--color-primary)]">{title}</h2>
        {description && <p className="text-sm text-[var(--color-text-muted)]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
